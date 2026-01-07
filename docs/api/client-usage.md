# راهنمای استفاده از API Client

## مقدمه

`EasyTraderAPIClient` یک کلاس TypeScript است که ارتباط با APIهای ایزی‌تریدر را تسهیل می‌کند. این کلاس مدیریت احراز هویت، ارسال درخواست‌ها و مدیریت خطاها را به صورت خودکار انجام می‌دهد.

## ویژگی‌های کلیدی

- ✅ **استخراج خودکار توکن**: توکن‌های احراز هویت به صورت خودکار از ترافیک شبکه استخراج می‌شوند
- ✅ **کش‌گذاری توکن**: توکن‌ها به مدت 30 دقیقه cache می‌شوند تا از استخراج مکرر جلوگیری شود
- ✅ **مدیریت خطا**: خطاها به صورت ساختاریافته مدیریت می‌شوند
- ✅ **Retry Logic**: در صورت خطا، درخواست‌ها به صورت خودکار retry می‌شوند
- ✅ **Type Safety**: تمام Types و Interfaces به صورت کامل تعریف شده‌اند

---

## نصب و راه‌اندازی

### پیش‌نیازها

- یک صفحه Playwright که به سایت کارگزاری لاگین شده است
- وابستگی‌های پروژه نصب شده باشد

### Import کردن

```typescript
import { EasyTraderAPIClient, placeOrder, getOrders, getQueuePosition, monitorOrder } from './src/brokerages/easy/api';
import { BrowserManager } from './src/core/browser';
```

### ایجاد Client

```typescript
const browserManager = new BrowserManager('easy');
const page = await browserManager.launch(true);
await page.goto('https://d.easytrader.ir/', { waitUntil: 'load' });
await page.waitForTimeout(15000); // منتظر لود شدن صفحه

const client = new EasyTraderAPIClient(page);
```

**نکته مهم**: صفحه باید به سایت کارگزاری لاگین شده باشد. Client از ترافیک شبکه برای استخراج توکن استفاده می‌کند.

---

## متدهای اصلی

### 1. ثبت سفارش (`placeOrder`)

ثبت سفارش خرید یا فروش.

```typescript
const result = await placeOrder(client, {
  symbol: 'زر',
  price: '590000',
  quantity: '2',
  side: 'buy' // یا 'sell' برای فروش
});

console.log('Order ID:', result.id);
console.log('Success:', result.isSuccessful);
```

#### پارامترها

- `client`: نمونه `EasyTraderAPIClient`
- `order`: اطلاعات سفارش
  - `symbol`: نام نماد (مثلاً 'زر')
  - `price`: قیمت به صورت string
  - `quantity`: تعداد به صورت string
  - `side`: نوع سفارش (`'buy'` یا `'sell'`)

#### برگشت

```typescript
{
  isSuccessful: boolean;
  id: string;
  message: string;
  omsError: OMSError[] | null;
}
```

#### مثال کامل

```typescript
import { EasyTraderAPIClient, placeOrder } from './src/brokerages/easy/api';

async function buyStock() {
  const browserManager = new BrowserManager('easy');
  const page = await browserManager.launch(true);
  await page.goto('https://d.easytrader.ir/', { waitUntil: 'load' });
  await page.waitForTimeout(15000);

  const client = new EasyTraderAPIClient(page);

  try {
    const result = await placeOrder(client, {
      symbol: 'زر',
      price: '590000',
      quantity: '2',
      side: 'buy'
    });

    if (result.isSuccessful) {
      console.log('✅ سفارش با موفقیت ثبت شد!');
      console.log('Order ID:', result.id);
    } else {
      console.error('❌ خطا در ثبت سفارش:', result.message);
      if (result.omsError) {
        result.omsError.forEach(err => {
          console.error(`  - ${err.name}: ${err.error} (Code: ${err.code})`);
        });
      }
    }
  } catch (error) {
    console.error('خطای غیرمنتظره:', error);
  } finally {
    await browserManager.close();
  }
}
```

---

### 2. دریافت لیست سفارشات (`getOrders`)

دریافت لیست تمام سفارشات فعال و انجام شده.

```typescript
const orders = await getOrders(client);
console.log('Orders count:', orders.orders.length);

orders.orders.forEach(order => {
  console.log(`Order ${order.id}:`, {
    symbol: order.symbolIsin,
    price: order.price,
    quantity: order.quantity,
    side: order.side === 0 ? 'buy' : 'sell',
    state: order.orderStateStr,
    executed: order.executedQuantity
  });
});
```

#### برگشت

```typescript
{
  orders: Order[];
}
```

#### ساختار Order

```typescript
{
  id: string;
  symbolIsin: string;
  price: number;
  quantity: number;
  side: number; // 0 = خرید، 1 = فروش
  orderStateStr: string;
  executedQuantity: number;
}
```

---

### 3. دریافت جایگاه در صف (`getQueuePosition`)

دریافت جایگاه سفارش در صف خرید یا فروش.

```typescript
const orderId = '1121Ak37W56*.]3A';
const position = await getQueuePosition(client, orderId);

console.log('Queue position:', position.orderPlaces[0].orderPlace);
console.log('Volume ahead:', position.orderPlaces[0].volumeAhead);
```

#### پارامترها

- `client`: نمونه `EasyTraderAPIClient`
- `orderId`: شناسه سفارش که از `placeOrder` دریافت شده است

#### برگشت

```typescript
{
  orderPlaces: OrderPlace[];
}
```

#### ساختار OrderPlace

```typescript
{
  orderId: string;
  orderPlace: number; // نوبت در صف
  volumeAhead: number; // حجم جلوتر از شما
}
```

---

### 4. مانیتورینگ جایگاه (`monitorOrder`)

مانیتورینگ جایگاه سفارش با interval مشخص.

```typescript
const orderId = '1121Ak37W56*.]3A';

await monitorOrder(
  client,
  orderId,
  5000, // interval: هر 5 ثانیه
  (position) => {
    console.log(`Current position: ${position.orderPlace}`);
    console.log(`Volume ahead: ${position.volumeAhead}`);
  },
  10 // maxChecks: حداکثر 10 بار بررسی
);
```

#### پارامترها

- `client`: نمونه `EasyTraderAPIClient`
- `orderId`: شناسه سفارش
- `interval`: فاصله زمانی بین بررسی‌ها (میلی‌ثانیه)
- `callback`: تابع callback که با هر بررسی فراخوانی می‌شود
- `maxChecks`: حداکثر تعداد بررسی (اختیاری، پیش‌فرض: 10)

---

## مثال کامل: ثبت سفارش و مانیتورینگ

```typescript
import { EasyTraderAPIClient, placeOrder, getOrders, monitorOrder } from './src/brokerages/easy/api';
import { BrowserManager } from './src/core/browser';

async function fullOrderFlow() {
  const browserManager = new BrowserManager('easy');
  const page = await browserManager.launch(true);
  
  try {
    // لاگین و آماده‌سازی
    await page.goto('https://d.easytrader.ir/', { waitUntil: 'load' });
    await page.waitForTimeout(15000);

    const client = new EasyTraderAPIClient(page);

    // ثبت سفارش
    console.log('📝 ثبت سفارش...');
    const result = await placeOrder(client, {
      symbol: 'زر',
      price: '590000',
      quantity: '2',
      side: 'buy'
    });

    if (!result.isSuccessful) {
      throw new Error(`Failed to place order: ${result.message}`);
    }

    console.log('✅ سفارش ثبت شد! ID:', result.id);

    // مانیتورینگ جایگاه
    console.log('🔍 شروع مانیتورینگ جایگاه...');
    await monitorOrder(
      client,
      result.id,
      3000,
      (position) => {
        console.log(`📍 جایگاه فعلی: ${position.orderPlace}, حجم جلوتر: ${position.volumeAhead}`);
      },
      5
    );

    // بررسی نهایی سفارشات
    console.log('📋 بررسی لیست سفارشات...');
    const orders = await getOrders(client);
    const myOrder = orders.orders.find(o => o.id === result.id);
    
    if (myOrder) {
      console.log('📊 وضعیت سفارش:', {
        state: myOrder.orderStateStr,
        executed: myOrder.executedQuantity,
        total: myOrder.quantity
      });
    }

  } catch (error) {
    console.error('❌ خطا:', error);
  } finally {
    await browserManager.close();
  }
}

// اجرا
fullOrderFlow();
```

---

## مدیریت خطا

### APIError

در صورت خطا در validation یا ارسال درخواست، `APIError` throw می‌شود:

```typescript
import { APIError } from './src/brokerages/easy/api';

try {
  await placeOrder(client, order);
} catch (error) {
  if (error instanceof APIError) {
    console.error('API Error:', error.message);
    console.error('Status Code:', error.statusCode);
    console.error('Details:', error.details);
  } else {
    console.error('Unknown error:', error);
  }
}
```

### OMSError

خطاهای OMS (Order Management System) در response برگردانده می‌شوند:

```typescript
const result = await placeOrder(client, order);

if (!result.isSuccessful && result.omsError) {
  result.omsError.forEach(err => {
    console.error(`OMS Error: ${err.name}`);
    console.error(`  Message: ${err.error}`);
    console.error(`  Code: ${err.code}`);
  });
}
```

---

## نکات مهم

1. **احراز هویت**: Client به صورت خودکار توکن‌ها را از ترافیک شبکه استخراج می‌کند. اطمینان حاصل کنید که صفحه به سایت کارگزاری لاگین شده است.

2. **Cache**: توکن‌ها به مدت 30 دقیقه cache می‌شوند. در صورت منقضی شدن، به صورت خودکار استخراج مجدد انجام می‌شود.

3. **Retry**: در صورت خطا در ارسال درخواست، تا 3 بار retry انجام می‌شود.

4. **Performance**: از `PerformanceLogger` برای مانیتورینگ عملکرد استفاده می‌شود.

---

## پیوندهای مرتبط

- [مستندات API](easytrader-api-spec.md)
- [README اصلی پروژه](../../README.md)

