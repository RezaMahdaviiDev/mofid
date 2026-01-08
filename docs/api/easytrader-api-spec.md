# مستندات API ایزی‌تریدر (EasyTrader API Specification)

## مقدمه

بر اساس تحلیل لاگ‌های ترافیک شبکه، ۳ API اصلی و حیاتی برای خرید، فروش و مدیریت سفارشات استخراج شد. این مستندات به صورت کامل با جزئیات فنی (متد، آدرس، بدنه درخواست و نمونه پاسخ) آماده شده است.

---

## ۱. دریافت لیست سفارشات (Get Orders)

این API برای دریافت لیست تمامی سفارشات فعال و انجام شده استفاده می‌شود.

### جزئیات درخواست

- **متد (Method)**: `GET`
- **آدرس (URL)**: `https://api-mts.orbis.easytrader.ir/core/api/order`

### هدرهای مهم (Headers)

```
Accept: application/json
Cookie: [session cookie]
Authorization: [bearer token]
```

**نکته**: نیاز به توکن احراز هویت دارد (Cookie یا Authorization)

### نمونه پاسخ (Response Example)

```json
{
  "orders": [
    {
      "id": "1121Ak37W5X[dJ,C",
      "symbolIsin": "IRT1AFRN0001",
      "price": 42790,
      "quantity": 30,
      "side": 0,
      "orderStateStr": "OnBoard",
      "executedQuantity": 0
    }
    // ... سایر سفارشات
  ]
}
```

### استفاده در کد

```typescript
import { EasyTraderAPIClient, getOrders } from './src/brokerages/easy/api';

const client = new EasyTraderAPIClient(page);
const orders = await getOrders(client);
console.log('Orders count:', orders.orders.length);
```

---

## ۲. ثبت سفارش خرید یا فروش (Place Order)

این مهم‌ترین API برای ارسال سفارش جدید به هسته معاملات است.

### جزئیات درخواست

- **متد (Method)**: `POST`
- **آدرس (URL)**: `https://api-mts.orbis.easytrader.ir/core/api/v2/order`

### بدنه درخواست (Request Body - JSON)

```json
{
  "order": {
    "symbolIsin": "IRT1AFRN0001",
    "price": 42770,
    "quantity": 30,
    "side": 0,
    "validityType": 0,
    "orderModelType": 1,
    "orderFrom": 34,
    "createDateTime": "1/7/2026, 12:54:46 PM"
  }
}
```

### پارامترها

- `symbolIsin`: شناسه نماد (مثلاً `IRT1AFRN0001` برای افران)
- `price`: قیمت سفارش
- `quantity`: تعداد سهم
- `side`: **نکته مهم**: `0` برای خرید (Buy)، `1` برای فروش (Sell)
- `validityType`: نوع اعتبار (معمولاً `0` برای روز)
- `orderModelType`: نوع مدل سفارش (معمولاً `1`)
- `orderFrom`: منبع سفارش (معمولاً `34`)
- `createDateTime`: زمان ایجاد به فرمت `M/D/YYYY, h:mm:ss AM/PM`

### نمونه پاسخ موفق (Success Response)

```json
{
  "isSuccessful": true,
  "id": "1121Ak37W56*.]3A",
  "message": "",
  "omsError": null
}
```

### نمونه پاسخ خطا (Error Response)

```json
{
  "isSuccessful": false,
  "id": "1121Ak37W5KG2mWT",
  "message": "7005: حجم سفارش خارج از محدوده مجاز می‌باشد",
  "omsError": [{
    "name": "VolumeIsNotInRangeError",
    "error": "حجم سفارش خارج از محدوده مجاز می‌باشد",
    "code": 7005
  }]
}
```

### استفاده در کد

```typescript
import { EasyTraderAPIClient, placeOrder } from './src/brokerages/easy/api';

const client = new EasyTraderAPIClient(page);
const result = await placeOrder(client, {
  symbol: 'زر',
  price: '590000',
  quantity: '2',
  side: 'buy'
});
console.log('Order ID:', result.id);
```

---

## ۳. استعلام جایگاه در صف (Order Queue Position)

این API برای فهمیدن اینکه سفارش شما در کجای صف خرید یا فروش قرار دارد (جایگاه و حجم جلوتر) استفاده می‌شود.

### جزئیات درخواست

- **متد (Method)**: `GET`
- **آدرس (URL)**: `https://api-mts.orbis.easytrader.ir/ms/api/MarketSheet/order-place?actionType=get`

### هدرهای اجباری (Required Headers)

```
order-id: 1121Ak37W56*.]3A
```

**نکته**: همان ID که در پاسخ ثبت سفارش دریافت کردید را در هدر `order-id` قرار دهید.

### نمونه پاسخ (Response Example)

```json
{
  "orderPlaces": [
    {
      "orderId": "1121Ak37W56*.]3A",
      "orderPlace": 116,
      "volumeAhead": 307485923
    }
  ]
}
```

### فیلدهای پاسخ

- `orderId`: شناسه سفارش
- `orderPlace`: نوبت در صف (مثلاً 116)
- `volumeAhead`: حجم جلوتر از شما (مثلاً 307485923)

### استفاده در کد

```typescript
import { EasyTraderAPIClient, getQueuePosition, monitorOrder } from './src/brokerages/easy/api';

const client = new EasyTraderAPIClient(page);
const orderId = '1121Ak37W56*.]3A';

// دریافت یک‌باره جایگاه
const position = await getQueuePosition(client, orderId);
console.log('Queue position:', position.orderPlaces[0].orderPlace);

// مانیتورینگ جایگاه با interval
await monitorOrder(client, orderId, 5000, (pos) => {
  console.log('Current position:', pos.orderPlace);
}, 10);
```

---

## نکات فنی مهم

### پارامتر `side`

در متد POST ثبت سفارش، مقدار `side` بسیار مهم است:
- `0` = خرید (Buy)
- `1` = فروش (Sell)

### احراز هویت (Authentication)

تمام این درخواست‌ها نیاز به Session معتبر دارند:
- **Cookie**: از لاگین وب دریافت می‌شود
- **Authorization**: Bearer Token که از ترافیک شبکه استخراج می‌شود
- **X-Xsrf-Token**: توکن CSRF که در هدرهای درخواست‌های واقعی وجود دارد

برای استخراج خودکار این توکن‌ها، از `EasyTraderAPIClient` استفاده کنید که ترافیک شبکه را شنود کرده و توکن‌ها را به صورت خودکار استخراج می‌کند.

### فلو (Flow) استاندارد

1. **ثبت سفارش**: ابتدا با API شماره ۲ سفارش را ثبت کنید
2. **دریافت ID**: `id` سفارش را از پاسخ بردارید
3. **مانیتورینگ**: با استفاده از API شماره ۳ و قرار دادن `id` در هدر، جایگاه سفارش را مانیتور کنید

---

## پیوندهای مرتبط

- [راهنمای استفاده از API Client](client-usage.md)
- [مستندات پروژه اصلی](../../README.md)


