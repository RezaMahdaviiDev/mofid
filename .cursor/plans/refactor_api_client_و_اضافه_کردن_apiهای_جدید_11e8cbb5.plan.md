---
name: Refactor API Client و اضافه کردن APIهای جدید
overview: پیاده‌سازی سه API اصلی (Place Order, Get Orders, Get Queue Position) با refactor کد موجود و ایجاد ساختار modular برای مدیریت APIها و احراز هویت. رویکرد تدریجی و قدم به قدم با تمرکز بر تست، مستندسازی و مدیریت خطاها
todos:
  - id: create-types
    content: ایجاد فایل types.ts با تمام interfaces و types مورد نیاز برای APIها - استفاده از BuyOrder interface موجود از buyAction.ts - تعریف OrderResponse, OrderItem, OrdersResponse, QueuePositionResponse, PlaceOrderRequest, APIError - با JSDoc کامل
    status: completed
  - id: test-types
    content: ایجاد فایل تست موقت برای اعتبارسنجی types (tests/temp/test-types-validation.ts) - بعد از تأیید حذف می‌شود
    status: completed
    dependencies:
      - create-types
  - id: create-api-client-core
    content: ایجاد هسته اصلی API Client (کلاس EasyTraderAPIClient با constructor و متد request() پایه) - استفاده از Settings از config/settings.ts برای URLهای API - یکپارچه‌سازی با logger از core/advancedLogger.ts - ابتدا با حداقل قابلیت‌ها
    status: completed
    dependencies:
      - create-types
  - id: implement-auth-headers
    content: اضافه کردن متد getAuthHeaders() به API Client (انتقال از buyActionAPI.ts با بهبود و error handling)
    status: completed
    dependencies:
      - create-api-client-core
  - id: add-error-handling
    content: پیاده‌سازی مدیریت خطاهای جامع در API Client (status codes، پیام‌های خطای معنادار، retry logic) - استفاده از logger.error() و logger.warn() از core/advancedLogger.ts موجود
    status: completed
    dependencies:
      - implement-auth-headers
  - id: test-api-client
    content: ایجاد تست موقت برای API Client (tests/temp/test-api-client.ts) - تست احراز هویت و error handling
    status: completed
    dependencies:
      - add-error-handling
  - id: implement-place-order
    content: پیاده‌سازی API ثبت سفارش (placeOrder) با validation ورودی‌ها و security checks - استفاده از BuyOrder interface موجود - استفاده از getIsinForSymbol() از symbolHelper.ts - استفاده از logger.logAPIRequest() موجود - یکپارچه‌سازی با PerformanceLogger از logger.ts
    status: completed
    dependencies:
      - add-error-handling
  - id: test-place-order
    content: تست موقت برای placeOrder API - بعد از تأیید حذف می‌شود
    status: completed
    dependencies:
      - implement-place-order
  - id: implement-get-orders
    content: پیاده‌سازی API دریافت لیست سفارشات (getOrders) با validation و error handling
    status: completed
    dependencies:
      - test-place-order
  - id: implement-queue-position
    content: پیاده‌سازی API جایگاه در صف (getQueuePosition) با validation order-id
    status: completed
    dependencies:
      - implement-get-orders
  - id: test-all-apis
    content: تست یکپارچگی برای تمام APIها و flow کامل (Place → Get → Queue Position)
    status: completed
    dependencies:
      - implement-queue-position
  - id: refactor-buyaction-api
    content: Refactor فایل buyActionAPI.ts برای استفاده از API Client جدید (حذف کد تکراری، حفظ سازگاری) - حذف تابع getAuthHeaders() (استفاده از API Client) - حفظ interface executeAPIBuy() برای سازگاری با buy.ts route - استفاده از PerformanceLogger و logger موجود
    status: completed
    dependencies:
      - test-all-apis
  - id: add-logging-monitoring
    content: اضافه کردن logging مناسب در API Client و پیاده‌سازی متد monitorOrder() برای مانیتورینگ - استفاده از logger.logAPIRequest(), logger.logBuy(), logger.logPerformance() موجود - یکپارچه‌سازی با PerformanceLogger برای اندازه‌گیری زمان
    status: completed
    dependencies:
      - refactor-buyaction-api
  - id: create-index-exports
    content: ایجاد فایل index.ts برای export مرکزی تمام APIها و types
    status: completed
    dependencies:
      - add-logging-monitoring
  - id: optimize-performance
    content: بهینه‌سازی عملکرد (cache headers، مدیریت منابع، بررسی memory leaks)
    status: completed
    dependencies:
      - create-index-exports
  - id: cleanup-test-files
    content: پاک کردن تمام فایل‌های تست موقت از tests/temp/ و اطمینان از تمیز بودن محیط کد اصلی
    status: completed
    dependencies:
      - optimize-performance
  - id: final-documentation
    content: تکمیل مستندسازی (JSDoc، README، نمونه کد) و به‌روزرسانی README.md با ساختار جدید
    status: completed
    dependencies:
      - cleanup-test-files
---

# پلن پیاده‌سازی APIها و Refactoring

## اصول و رویکرد توسعه

این پلن بر اساس نکات مهم توسعه نرم‌افزار طراحی شده است:

1. **ساختار از کوچک به بزرگ**: ابتدا هسته اصلی (types، client core)، سپس قابلیت‌ها به تدریج اضافه می‌شوند
2. **کار تدریجی و قدم به قدم**: هر مرحله کامل شده و تست می‌شود قبل از رفتن به مرحله بعد
3. **مدیریت فایل‌های تست**: تست‌های موقت در `tests/temp/` ایجاد می‌شوند و بعد از تأیید حذف می‌شوند
4. **مستندسازی مناسب**: JSDoc برای تمام public methods و به‌روزرسانی README
5. **تست و اعتبارسنجی**: تست واحد برای هر ماژول + تست یکپارچگی + تست عملکردی
6. **مدیریت خطاها**: پیام‌های خطای معنادار، logging مناسب، جلوگیری از crash
7. **امنیت**: اعتبارسنجی ورودی‌ها، محافظت از داده‌های حساس، احراز هویت مناسب
8. **بهینه‌سازی**: cache headers، مدیریت منابع، مانیتورینگ عملکرد

## تحلیل وضعیت فعلی

**وضعیت موجود:**

- API ثبت سفارش (Place Order) در `src/brokerages/easy/buyActionAPI.ts` پیاده‌سازی شده
- مدیریت احراز هویت به صورت inline در همان فایل است
- APIهای دریافت لیست سفارشات و جایگاه در صف پیاده‌سازی نشده‌اند
- کد به اندازه کافی modular نیست و قابل استفاده مجدد نیست

**نیازها:**

- پیاده‌سازی API دریافت لیست سفارشات (GET `/core/api/order`)
- پیاده‌سازی API استعلام جایگاه در صف (GET `/ms/api/MarketSheet/order-place`)
- Refactor کد برای ساختار بهتر و قابلیت استفاده مجدد

## وابستگی‌ها و کدهای موجود

### ماژول‌های استفاده‌شده

#### 1. Interfaces و Types موجود

- **`src/brokerages/easy/buyAction.ts`**:
- `BuyOrder` interface: برای ورودی سفارش (symbol, price, quantity, side)
- استفاده در: `placeOrder()` API

#### 2. Helper Functions

- **`src/brokerages/easy/symbolHelper.ts`**:
- `getIsinForSymbol(symbol: string)`: تبدیل نماد به ISIN
- استفاده در: ساخت payload برای `placeOrder()`

#### 3. Logging Systems

- **`src/core/advancedLogger.ts`**:
- `logger`: Singleton instance از AdvancedLogger
- متدهای استفاده‌شده:
    - `logger.logAPIRequest()`: لاگ درخواست‌های API
    - `logger.logBuy()`: لاگ عملیات خرید
    - `logger.logPerformance()`: لاگ عملکرد
    - `logger.info()`, `logger.warn()`, `logger.error()`: لاگ‌های عمومی
- **`src/brokerages/easy/logger.ts`**:
- `PerformanceLogger`: کلاس static برای اندازه‌گیری زمان
- متدهای استفاده‌شده:
    - `PerformanceLogger.start(label)`: شروع تایمر
    - `PerformanceLogger.end(label)`: پایان تایمر و برگشت مدت زمان

#### 4. Configuration

- **`src/config/settings.ts`**:
- `Settings.easy.apiUrl`: URL پایه API
- استفاده در: ساخت URLهای کامل برای درخواست‌ها

#### 5. فایل‌های Refactor شونده

- **`src/brokerages/easy/buyActionAPI.ts`**:
- تابع `getAuthHeaders()`: انتقال به API Client (خطوط 12-139)
- تابع `executeAPIBuy()`: refactor برای استفاده از API Client جدید
- حفظ interface برای سازگاری backward
- **`src/dashboard/routes/buy.ts`**:
- استفاده از `executeAPIBuy()` در خط 72
- باید سازگاری کامل حفظ شود

### نقش هر وابستگی

| ماژول | نقش | استفاده در |

|------|-----|-----------|

| `BuyOrder` | Interface ورودی سفارش | `placeOrder()` |

| `getIsinForSymbol` | تبدیل نماد به ISIN | ساخت payload |

| `logger` | لاگ‌گیری جامع | تمام API calls |

| `PerformanceLogger` | اندازه‌گیری زمان | Performance monitoring |

| `Settings` | تنظیمات API URLs | ساخت URLهای درخواست |

| `executeAPIBuy` | Interface عمومی | حفظ سازگاری با routes |

### حفظ سازگاری

- **Interface `executeAPIBuy`** باید بدون تغییر باقی بماند
- **Signature:** `(page: Page, order: BuyOrder): Promise<number>`
- **Return:** زمان اجرا به میلی‌ثانیه
- **Usage:** در `src/dashboard/routes/buy.ts` (model 5)

## معماری پیشنهادی

```javascript
src/brokerages/easy/
├── api/
│   ├── client.ts          # API Client اصلی (احراز هویت، درخواست‌ها)
│   ├── types.ts           # Types و Interfaces
│   ├── order.ts           # APIهای مرتبط با سفارش
│   └── index.ts           # Export مرکزی
├── buyActionAPI.ts        # استفاده از API Client (refactored)
└── ...

tests/
├── temp/                  # فایل‌های تست موقت (حذف بعد از تأیید)
│   ├── test-types-validation.ts
│   ├── test-api-client.ts
│   └── test-place-order.ts
└── unit/                  # تست‌های واحد دائمی
    └── test-api-client.ts
```



## مراحل پیاده‌سازی (گام به گام)

جزئیات کامل هر مرحله در بخش todos موجود است. خلاصه فازها:

1. **فاز 1: پایه و اساس** - Types و API Client Core
2. **فاز 2: احراز هویت و مدیریت خطا** - انتقال و بهبود کد موجود
3. **فاز 3: پیاده‌سازی APIها** - Place Order, Get Orders, Queue Position
4. **فاز 4: Refactoring و یکپارچگی** - Refactor buyActionAPI.ts
5. **فاز 5: بهینه‌سازی و پاکسازی** - Optimization و Cleanup

## جزئیات فنی

### API Endpoints

1. **Place Order**: POST `/core/api/v2/order`
2. **Get Orders**: GET `/core/api/order`
3. **Get Queue Position**: GET `/ms/api/MarketSheet/order-place?actionType=get`

### مدیریت احراز هویت

- استخراج از ترافیک شبکه با `page.route()`
- انتقال کد از `buyActionAPI.ts` خطوط 12-139

### Logging Strategy

- استفاده از `logger.logAPIRequest()`, `logger.logBuy()`, `logger.logPerformance()` موجود
- یکپارچه‌سازی با `PerformanceLogger` برای اندازه‌گیری زمان

## چک‌لیست نهایی

- [ ] تمام فایل‌های تست موقت حذف شده‌اند
- [ ] تمام public methods دارای JSDoc هستند
- [ ] README به‌روزرسانی شده است
- [ ] هیچ کد تکراری باقی نمانده است