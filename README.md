# ربات خرید خودکار ایزی‌تریدر (EasyTrader Auto-Buy Bot)

## 📋 خلاصه پروژه

این پروژه یک ربات خرید خودکار برای کارگزاری **مفید (EasyTrader)** است که با استفاده از **Playwright** و **TypeScript** پیاده‌سازی شده است. ربات قادر است سفارشات خرید را با سرعت بالا (زیر ۱ ثانیه) و دقت ۱۰۰٪ ثبت کند.

### ویژگی‌های کلیدی
- ✅ **۵ مدل مختلف خرید** با سرعت‌های متفاوت (از ۲۰۲ms تا ۱۷۴۰ms)
- ✅ **مدیریت Session** برای دور زدن کپچا
- ✅ **تایید هوشمند نماد** برای جلوگیری از کلیک اشتباه
- ✅ **لاگ‌گیری دقیق** برای تحلیل عملکرد
- ✅ **Fallback خودکار** در صورت خطا
- ✅ **هوشمندسازی API**: استخراج خودکار توکن‌ها از ترافیک شبکه
- ✅ **Dashboard وب**: رابط کاربری ساده و زیبا برای خرید/فروش
- ✅ **Asset Tracking**: نمایش موجودی نقدی و تغییرات آن
- ✅ **Transaction Validation**: اعتبارسنجی خودکار تغییر موجودی

---

## 🏗️ ساختار پروژه

```
Agah/
├── src/
│   ├── core/
│   │   ├── browser.ts          # مدیریت مرورگر و session
│   │   └── advancedLogger.ts   # سیستم لاگ‌گیری پیشرفته
│   ├── config/
│   │   └── settings.ts         # تنظیمات API
│   └── brokerages/
│       └── easy/
│           ├── api/            # API Client (جدید)
│           │   ├── client.ts   # API Client اصلی
│           │   ├── types.ts    # Types و Interfaces
│           │   ├── order.ts    # APIهای سفارش
│           │   └── index.ts    # Export مرکزی
│           ├── buyAction.ts    # مدل ۱: Standard
│           ├── buyActionJS.ts  # مدل ۳: JS Injection
│           ├── buyActionUltra.ts # مدل ۴: Ultra Aggressive
│           ├── buyActionAPI.ts  # مدل ۵: API Direct (با API Client)
│           ├── buyActionKeyboard.ts # مدل ۲: Keyboard
│           ├── logger.ts        # سیستم لاگ‌گیری عملکرد
│           └── symbolHelper.ts  # Helper برای نمادها
├── tests/
│   └── easy/
│       ├── test_speed.ts       # تست مدل ۱
│       ├── test_model_2.ts     # تست مدل ۲
│       ├── test_model_3.ts     # تست مدل ۳
│       ├── test_model_4.ts     # تست مدل ۴
│       ├── test_api_speed.ts   # تست سرعت API
│       └── test_api_fix.ts     # تست تعمیر و عیب‌یابی API (جدید)
├── .user-data/
│   └── easy/                   # Session ذخیره شده
├── logs/                        # اسکرین‌شات‌ها و لاگ‌ها
├── src/                         # کد منبع
│   └── dashboard/               # داشبورد وب
│       ├── server.ts           # سرور Express
│       ├── routes/             # API endpoints
│       └── public/             # فایل‌های استاتیک
├── docs/                       # مستندات
│   ├── api/                    # مستندات API
│   ├── guides/                 # راهنماها
│   ├── development/            # مستندات توسعه
│   └── reports/                # گزارش‌ها و تحلیل‌ها
├── package.json                # پیکربندی npm و وابستگی‌ها
├── package-lock.json           # قفل نسخه‌های وابستگی‌ها
├── tsconfig.json               # پیکربندی TypeScript
└── README.md                   # این فایل
```

---

## 🚀 نصب و راه‌اندازی

### پیش‌نیازها
- Node.js (v18 یا بالاتر)
- npm یا yarn

### مراحل نصب

```bash
# ۱. نصب وابستگی‌ها
npm install

# ۲. کامپایل TypeScript
npm run build

# ۳. اجرای تست لاگین (اولین بار)
npm run test:easy:login:auto
```

**نکته مهم**: در اولین اجرا، باید به صورت دستی وارد حساب کاربری شوید. Session بعد از لاگین ذخیره می‌شود و در اجراهای بعدی نیازی به لاگین مجدد نیست.

---

## 📊 مدل‌های خرید

### مدل ۱: Standard-Fast (۹۶۰ms)
**فایل**: `src/brokerages/easy/buyAction.ts`

- استفاده از Playwright Locators استاندارد
- `fill({ force: true })` برای دور زدن Popoverها
- تایید هوشمند نماد (جلوگیری از کلیک روی اطلس)

**استفاده**:
```typescript
import { executeFastBuy } from './src/brokerages/easy/buyAction';

const order = {
  symbol: 'زر',
  price: '590000',
  quantity: '2'
};

await executeFastBuy(page, order);
```

### مدل ۲: Keyboard-Focus (۱۴۷۸ms)
**فایل**: `src/brokerages/easy/buyActionKeyboard.ts`

- استفاده از میان‌برهای کیبورد (`Tab`, `Enter`)
- شبیه‌سازی تایپ واقعی

**نکته**: این مدل کندتر است به دلیل شبیه‌سازی تایپ کاراکتر به کاراکتر.

### مدل ۳: JS-Injection (۷۶۳ms) ⭐ **توصیه می‌شود**
**فایل**: `src/brokerages/easy/buyActionJS.ts`

- تغییر مستقیم `value` اینپوت‌ها با `page.evaluate()`.
- دور زدن لایه‌های شبیه‌سازی Playwright.
- **بهترین تعادل بین سرعت و پایداری**.

### مدل ۴: Ultra-Aggressive (۲۰۲ms) 🏆 **سریع‌ترین**
**فایل**: `src/brokerages/easy/buyActionUltra.ts`

- حذف کامل `waitForTimeout`.
- استفاده از `setInterval` برای چک کردن المان‌ها.
- **برای سرخطی زدن ایده‌آل است**.

**نکته**: این مدل ممکن است در برخی شرایط ناپایدار باشد.

### مدل ۵: API Direct (Smart Headers) ✅ **پیاده‌سازی شده**
**فایل**: `src/brokerages/easy/buyActionAPI.ts`

- ارسال مستقیم به `https://api-mts.orbis.easytrader.ir/core/api/v2/order`.
- استفاده از **API Client جدید** برای مدیریت درخواست‌ها
- **مکانیزم جدید**: شنود ترافیک شبکه برای استخراج توکن `Authorization`.
- **هدف**: دستیابی به سرعت زیر ۱۰۰ms.

**وضعیت فعلی**: مکانیزم استخراج هدر پیاده‌سازی شده و API Client کامل آماده استفاده است.

---

## 🔧 API Client

این پروژه شامل یک **API Client کامل** برای ارتباط با EasyTrader API است که در `src/brokerages/easy/api/` قرار دارد.

### ساختار API Client

```
src/brokerages/easy/api/
├── client.ts          # API Client اصلی (احراز هویت، درخواست‌ها)
├── types.ts           # Types و Interfaces
├── order.ts           # APIهای مرتبط با سفارش
└── index.ts           # Export مرکزی
```

### ویژگی‌های API Client

- ✅ **احراز هویت خودکار**: استخراج توکن از ترافیک شبکه
- ✅ **Cache هوشمند**: ذخیره هدرها برای جلوگیری از درخواست‌های مکرر
- ✅ **Retry Logic**: retry خودکار برای خطاهای موقت (5xx)
- ✅ **Error Handling**: مدیریت خطاهای جامع با پیام‌های معنادار
- ✅ **Logging کامل**: لاگ‌گیری تمام درخواست‌ها و پاسخ‌ها
- ✅ **Performance Monitoring**: اندازه‌گیری زمان هر API call

### استفاده از API Client

```typescript
import { EasyTraderAPIClient, placeOrder, getOrders, getQueuePosition, monitorOrder } from './src/brokerages/easy/api';
import { BrowserManager } from './src/core/browser';

async function example() {
  const browserManager = new BrowserManager('easy');
  const page = await browserManager.launch(true);
  await page.goto('https://d.easytrader.ir/', { waitUntil: 'load' });
  await page.waitForTimeout(15000);

  const client = new EasyTraderAPIClient(page);

  // ثبت سفارش
  const orderResult = await placeOrder(client, {
    symbol: 'زر',
    price: '590000',
    quantity: '2',
    side: 'buy'
  });
  console.log('Order ID:', orderResult.id);

  // دریافت لیست سفارشات
  const orders = await getOrders(client);
  console.log('Orders count:', orders.orders.length);

  // بررسی جایگاه در صف
  const position = await getQueuePosition(client, orderResult.id);
  console.log('Queue position:', position.orderPlaces[0].orderPlace);

  // مانیتورینگ جایگاه
  await monitorOrder(client, orderResult.id, 5000, (pos) => {
    console.log('Current position:', pos.orderPlace);
  }, 10);

  await browserManager.close();
}
```

### API Methods

#### `placeOrder(client, order)`
ثبت سفارش خرید یا فروش

#### `getOrders(client)`
دریافت لیست تمام سفارشات

#### `getQueuePosition(client, orderId)`
دریافت جایگاه سفارش در صف

#### `monitorOrder(client, orderId, interval, callback, maxChecks)`
مانیتورینگ جایگاه سفارش با interval مشخص

برای راهنمای کامل API Client به [docs/api/client-usage.md](docs/api/client-usage.md) مراجعه کنید.

---

## 📊 Dashboard

این پروژه شامل یک **Dashboard وب کامل** است که امکان خرید/فروش را به صورت گرافیکی فراهم می‌کند.

### ویژگی‌های Dashboard

#### 💰 Asset Tracking
- نمایش موجودی نقدی فعلی
- نمایش تغییر موجودی پس از هر معامله
- رنگ‌بندی تغییرات (سبز برای افزایش، قرمز برای کاهش)
- اعتبارسنجی خودکار تطابق تغییر موجودی با نوع معامله

#### 📜 Transaction History
- نمایش تاریخچه تمام معاملات (خرید و فروش)
- نمایش نوع معامله با آیکون (🟢 خرید / 🔴 فروش)
- نمایش تغییر موجودی در هر معامله
- Badge اعتبارسنجی برای هر معامله

#### 🔄 Real-time Updates
- به‌روزرسانی خودکار موجودی پس از هر معامله
- نمایش وضعیت در لحظه (موفقیت، خطا، در حال اجرا)
- Validation در زمان واقعی

### اجرای Dashboard

```bash
npm run dashboard
```

سپس به `http://localhost:3000` بروید.

برای راهنمای کامل استفاده از Dashboard به [docs/guides/dashboard-guide.md](docs/guides/dashboard-guide.md) مراجعه کنید.

---

## 🔧 مستندات API

برای مستندات کامل APIها به [docs/api/easytrader-api-spec.md](docs/api/easytrader-api-spec.md) مراجعه کنید.

### Endpoint خرید
```
POST https://api-mts.orbis.easytrader.ir/core/api/v2/order
```

### Endpoint دریافت لیست سفارشات
```
GET https://api-mts.orbis.easytrader.ir/core/api/order
```

### Endpoint جایگاه در صف
```
GET https://api-mts.orbis.easytrader.ir/ms/api/MarketSheet/order-place?actionType=get
Headers: order-id: <ORDER_ID>
```

### Payload ساختار
```json
{
  "order": {
    "price": 590000,
    "quantity": 2,
    "side": 0,
    "validityType": 0,
    "createDateTime": "1/6/2026, 3:17:30 PM",
    "commission": 0.0012,
    "symbolIsin": "IRTKZARF0001",
    "symbolName": "زر",
    "orderModelType": 1,
    "orderFrom": 34
  }
}
```

### Response موفق
```json
{
  "isSuccessful": true,
  "id": "1121Ak37W5|d1ROs",
  "message": "",
  "omsError": null
}
```

### Response خطا
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

---

## 🎯 سلکتورهای کلیدی

### نماد زر
```typescript
"[data-cy='symbol-name-renderer-IRTKZARF0001']"
```

### دکمه خرید
```typescript
"[data-cy='order-buy-btn']"
```

### فیلد قیمت
```typescript
"[data-cy='order-form-input-price']"
```

### فیلد حجم
```typescript
"[data-cy='order-form-input-quantity']"
```

### دکمه ارسال
```typescript
"[data-cy='oms-order-form-submit-button-buy']"
```

### هدر پنل خرید
```typescript
"order-form-header"
```

---

## 📚 مستندات

### مستندات اصلی
- [README اصلی](README.md) - این فایل
- [راهنمای شروع سریع](docs/guides/quick-start.md)
- [راهنمای Dashboard](docs/guides/dashboard-guide.md)

### مستندات API
- [مستندات API ایزی‌تریدر](docs/api/easytrader-api-spec.md)
- [راهنمای استفاده از API Client](docs/api/client-usage.md)

### مستندات توسعه
- [دفترچه گزارش پیشرفت](docs/development/journal.md)
- [نکات Best Practices](docs/development/best-practices.md)

### گزارش‌ها
- [گزارش تست‌های سرعت](docs/reports/speed-report.md)

---

## 🐛 مشکلات حل شده

### ۱. مشکل کلیک روی نماد اشتباه (اطلس)
**مشکل**: گاهی پنل خرید برای نماد قبلی (اطلس) باز می‌شد.

**راه‌حل**: 
- استفاده از سلکتور اختصاصی `symbol-name-renderer-IRTKZARF0001`
- تایید هوشمند: چک کردن هدر پنل بعد از باز شدن
- در صورت تشخیص اطلس، کلیک مجدد روی زر

**کد**:
```typescript
const headerCheck = await page.evaluate(() => {
  const header = document.querySelector('order-form-header');
  return header?.textContent?.includes('اطلس') || false;
});

if (headerCheck) {
  // کلیک مجدد روی زر
  await page.locator("[data-cy='symbol-name-renderer-IRTKZARF0001']").click({ force: true });
}
```

### ۲. مشکل Popover مسدود کننده
**مشکل**: Popoverهای خطا مانع کلیک روی اینپوت‌ها می‌شدند.

**راه‌حل**: استفاده از `fill({ force: true })` به جای `click` + `fill`

### ۳. مشکل Session Management
**مشکل**: نیاز به لاگین دستی در هر اجرا.

**راه‌حل**: 
- ذخیره session در `.user-data/easy/`
- استفاده از `persistent context` در Playwright

---

## 📈 نتایج تست‌ها

### جدول مقایسه سرعت (میلی‌ثانیه)

| مدل | زمان کل | انتخاب نماد | باز کردن پنل | پر کردن فرم | ارسال |
|:---|:---:|:---:|:---:|:---:|:---:|
| **مدل ۱** | ۹۶۰ | ۲۱۲ | ۳۴۰ | ۱۷۴ | ۲۳۴ |
| **مدل ۲** | ۱۴۷۸ | ۲۱۷ | ۱۷۱ | ۹۴۹ | ۱۴۱ |
| **مدل ۳** | ۷۶۳ | ۲۰۳ | ۱۸۷ | ۷۶ | ۲۹۷ |
| **مدل ۴** | ۲۰۲ | - | - | - | - |
| **مدل ۵** | ۳۶۴ | - | - | - | ۱۱۵ |

### توصیه‌ها
- **برای سرعت حداکثری**: مدل ۴ (۲۰۲ms)
- **برای پایداری**: مدل ۳ (۷۶۳ms)
- **برای استفاده عمومی**: مدل ۱ (۹۶۰ms)

---

## 🧪 دستورات تست

```bash
# تست مدل ۱ (Standard)
npm run test:easy:speed

# تست مدل ۲ (Keyboard)
npm run test:easy:m2

# تست مدل ۳ (JS Injection)
npm run test:easy:m3

# تست مدل ۴ (Ultra)
npm run test:easy:m4

# تست مدل ۵ (API)
npm run test:easy:api

# تست تعمیر و عیب‌یابی API (جدید)
npm run test:easy:api:fix

# تست لاگین
npm run test:easy:login:auto
```

---

## 📝 نحوه استفاده

### روش ۱: استفاده از داشبورد (توصیه می‌شود) 🎯

ساده‌ترین روش برای استفاده از ربات:

```bash
# ۱. اجرای داشبورد
npm run dashboard

# ۲. باز کردن مرورگر و رفتن به:
# http://localhost:3000
```

**ویژگی‌های داشبورد:**
- ✅ رابط کاربری ساده و زیبا و Responsive
- ✅ فرم سفارش (خرید/فروش) با تمام گزینه‌ها
- ✅ انتخاب نوع سفارش (خرید یا فروش)
- ✅ انتخاب مدل خرید (1, 4, 5)
- ✅ گزینه Debug (نمایش/مخفی کردن مرورگر)
- ✅ نمایش وضعیت سفارش (موفقیت، خطا، در حال اجرا)
- ✅ 💰 **Asset Tracking**: نمایش موجودی نقدی و تغییرات آن
- ✅ 📊 **Transaction Validation**: اعتبارسنجی خودکار تغییر موجودی
- ✅ 📜 تاریخچه معاملات با نمایش نوع معامله (خرید/فروش)
- ✅ دکمه لاگین با مدیریت session
- ✅ ذخیره تاریخچه در localStorage

برای راهنمای کامل داشبورد به [docs/guides/dashboard-guide.md](docs/guides/dashboard-guide.md) مراجعه کنید.

**مراحل استفاده:**
1. اجرای `npm run dashboard`
2. باز کردن `http://localhost:3000` در مرورگر
3. کلیک روی دکمه "لاگین" (اولین بار)
4. پر کردن فرم خرید و کلیک روی "خرید"

---

### روش ۲: استفاده از کد (برای توسعه‌دهندگان)

#### مثال ساده

```typescript
import { BrowserManager } from './src/core/browser';
import { executeFastBuy } from './src/brokerages/easy/buyAction';

async function main() {
  const browserManager = new BrowserManager('easy');
  const page = await browserManager.launch(true); // headless: true
  
  await page.goto('https://d.easytrader.ir/', { waitUntil: 'load' });
  await page.waitForTimeout(15000); // انتظار برای لود کامل
  
  const order = {
    symbol: 'زر',
    price: '590000',
    quantity: '2'
  };
  
  await executeFastBuy(page, order);
  await browserManager.close();
}

main();
```

#### استفاده از مدل ۳ (توصیه می‌شود)

```typescript
import { executeJSInjectBuy } from './src/brokerages/easy/buyActionJS';

await executeJSInjectBuy(page, order);
```

#### استفاده از مدل ۴ (سریع‌ترین)

```typescript
import { executeUltraBuy } from './src/brokerages/easy/buyActionUltra';

await executeUltraBuy(page, order);
```

---

## 🔐 امنیت

### Session Management
- Session در `.user-data/easy/` ذخیره می‌شود
- **هشدار**: این فایل‌ها حاوی اطلاعات حساس هستند. آن‌ها را در `.gitignore` قرار دهید.

### Credentials
- **هرگز** رمز عبور را در کد hardcode نکنید
- از متغیرهای محیطی استفاده کنید (در صورت نیاز)

---

## 📚 مستندات تکمیلی

- [راهنمای Dashboard](docs/guides/dashboard-guide.md): راهنمای کامل استفاده از داشبورد
- [گزارش تست‌های سرعت](docs/reports/speed-report.md): گزارش کامل بنچمارک سرعت
- [دفترچه گزارش پیشرفت](docs/development/journal.md): تاریخچه پیشرفت پروژه و تصمیمات

---

## 🛠️ عیب‌یابی

### مشکل: خطای 401 در API
**علت**: مشکل authentication  
**راه‌حل**: استفاده از UI automation (fallback خودکار) یا اجرای `npm run test:easy:api:fix` برای استخراج مجدد توکن.

### مشکل: پنل برای اطلس باز می‌شود
**علت**: State قبلی مرورگر  
**راه‌حل**: تایید هوشمند (در مدل ۱، ۳، ۴ پیاده‌سازی شده)

### مشکل: خطای "حجم سفارش خارج از محدوده"
**علت**: حجم درخواستی خارج از محدوده مجاز نماد است  
**راه‌حل**: بررسی `minValidBuyVolume` و `maxValidBuyVolume` از API

---

## 📞 پشتیبانی

برای سوالات و مشکلات:
1. بررسی فایل [دفترچه گزارش](docs/development/journal.md) برای مشکلات مشابه
2. بررسی لاگ‌های `logs/` و اسکرین‌شات‌ها
3. بررسی [گزارش تست‌های سرعت](docs/reports/speed-report.md) برای نتایج تست‌ها

---

## 📄 لایسنس

ISC

---

## 🙏 تشکر

این پروژه با استفاده از:
- **Playwright**: برای browser automation
- **TypeScript**: برای type safety
- **EasyTrader API**: برای ثبت سفارشات

ساخته شده است.