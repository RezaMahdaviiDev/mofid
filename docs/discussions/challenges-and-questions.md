# بحث‌ها و چالش‌های پروژه - جلسات فکری

> این فایل برای ثبت سوالات، نکات، چالش‌ها و بحث‌های فنی پروژه است که در زمان تعطیلی بازار انجام می‌شود.

**آخرین به‌روزرسانی**: 2025-01-08  
**وضعیت**: در حال بحث و تکمیل

---

## 📋 فهرست مطالب

- [مدل‌های معاملاتی](#1-مدل‌های-معاملاتی)
- [بهینه‌سازی API](#2-بهینه‌سازی-api)
- [زیرمدل‌های Model 5 (API Direct)](#21-زیرمدل‌های-model-5-api-direct)
- [استراتژی تست جامع](#22-استراتژی-تست-جامع-comprehensive-testing-strategy)
- [مسائل فنی](#3-مسائل-فنی)
- [بهبودهای آینده](#4-بهبودهای-آینده)
- [سوالات باز](#5-سوالات-باز-open-questions)
- [تصمیمات اتخاذ شده](#6-تصمیمات-اتخاذ-شده)
- [نکات و یادداشت‌ها](#7-نکات-و-یادداشت‌ها)
- [Action Items](#8-action-items)

---

## 1. مدل‌های معاملاتی

### سوال اصلی
**آیا باید مدل‌های UI-based (1-4) را حذف کنیم و فقط از API استفاده کنیم؟**

### وضعیت فعلی

| مدل | روش | سرعت | وضعیت | استفاده |
|-----|-----|------|-------|---------|
| Model 1 | UI Standard | ~960ms | ⚠️ فعال | کم |
| Model 2 | UI Keyboard | ~1478ms | ⚠️ فعال | خیلی کم |
| Model 3 | UI JS-Inject | ~763ms | ⚠️ فعال | متوسط |
| Model 4 | UI Ultra | ~202ms | ⚠️ فعال | بالا (fallback) |
| **Model 5** | **API Direct** | **~364ms** | ✅ **فعال** | **بالا** |
| **Model 6** | **API Ultra** | **<100ms (هدف)** | ✅ **فعال** | **در حال تست** |

### نکات مطرح شده

#### ✅ مزایای استفاده فقط از API:
- سرعت بسیار بالاتر (زیر 100ms)
- کد ساده‌تر و قابل نگهداری‌تر
- عدم وابستگی به تغییرات UI
- قابلیت Scale بهتر
- Error handling واضح‌تر
- عدم نیاز به browser rendering (کمتر resource-intensive)

#### ⚠️ معایب/نگرانی‌ها:
- وابستگی کامل به API ایزی‌تریدر
- در صورت مشکل API، fallback نداریم
- نیاز به تست گسترده قبل از حذف
- Token management و expiration
- اگر API تغییر کند، باید سریع adapt کنیم

### تصمیم موقت (پیشنهادی)

**رویکرد سه مرحله‌ای:**

#### فاز 1: تست کامل API (1-2 هفته)
- ✅ نگه داشتن همه مدل‌ها
- ✅ تست گسترده API (Model 5 & 6)
- ✅ جمع‌آوری آمار موفقیت/خطا
- ✅ تست در شرایط مختلف (load, error, edge cases)

#### فاز 2: Deprecation تدریجی (بعد از تایید API)
- ⚠️ حذف Model 1, 2, 3 (کندتر و کمتر استفاده)
- ⚠️ نگه داشتن Model 4 به عنوان **fallback** (deprecated)
- ✅ استفاده اصلی از Model 5 و 6 (API)
- ✅ اضافه کردن auto-fallback: API → UI (Model 4)

#### فاز 3: حذف کامل (3-6 ماه بعد)
- ⚠️ اگر API پایدار بود (نرخ موفقیت >99%)
- ⚠️ اگر fallback استفاده نشد
- ⚠️ حذف Model 4
- ✅ فقط استفاده از API

### Checklist تست API

#### تست عملکردی
- [ ] خرید با مقادیر مختلف (1, 10, 100 سهم)
- [ ] فروش با مقادیر مختلف
- [ ] تست نمادهای مختلف (پرطرفدار، کم‌طرفدار)
- [ ] تست قیمت‌های مختلف (بالا، پایین، میانه)
- [ ] تست در ساعات مختلف (شروع بازار، وسط، پایان)

#### تست خطا
- [ ] نماد نامعتبر
- [ ] موجودی ناکافی
- [ ] قیمت خارج از محدوده
- [ ] Network timeout
- [ ] Token expiration
- [ ] Rate limiting
- [ ] API server error (500, 503)

#### تست Load
- [ ] 10 سفارش پشت سر هم (sequential)
- [ ] 5 سفارش همزمان (parallel)
- [ ] 100 سفارش در یک روز
- [ ] تست در ساعات شلوغی بازار
- [ ] Stress test (rapid fire orders)

#### تست Reliability
- [ ] 100 سفارش در روز برای 7 روز متوالی
- [ ] بررسی نرخ موفقیت (>99% هدف)
- [ ] بررسی latency consistency
- [ ] تست token refresh
- [ ] تست session persistence

### سوالات باز

#### درباره Fallback
- [ ] آیا Model 4 را به عنوان fallback نگه داریم؟
- [ ] یا بهتر است Model 3 (JS-Inject) را نگه داریم؟ (سرعت: 763ms vs 202ms)
- [ ] آیا نیاز به auto-fallback داریم یا manual fallback کافی است؟
- [ ] چه زمانی باید fallback trigger شود؟ (API error? timeout? rate limit?)

#### درباره Timeline
- [ ] چه مدت باید API را تست کنیم قبل از حذف UI models؟ (1 هفته؟ 2 هفته؟ 1 ماه؟)
- [ ] چه معیارهایی برای "موفقیت" API در نظر بگیریم؟ (نرخ موفقیت >99%؟ عدم خطای critical برای X روز؟)
- [ ] چطور می‌توانیم مطمئن شویم API پایدار است؟

#### درباره Implementation
- [ ] آیا نیاز به feature flag داریم برای enable/disable UI models؟
- [ ] چطور token expiration را handle کنیم؟
- [ ] آیا نیاز به monitoring system داریم برای track کردن fallback usage؟

---

## 2. بهینه‌سازی API

### چالش: سرعت API

#### وضعیت فعلی
- **Model 5**: ~364ms (API Direct)
- **Model 6**: هدف <100ms (API Ultra) - در حال بهینه‌سازی

#### گلوگاه‌های شناسایی شده

| مرحله | زمان فعلی | زمان هدف | راه‌حل |
|-------|-----------|----------|--------|
| Token extraction | ~100-200ms | <50ms | Pre-extraction, cache |
| Network latency | ~50-100ms | ~50ms | Connection pooling |
| Order verification | ~100-150ms | 0ms (optional) | Skip verification |
| Payload preparation | ~10-20ms | <10ms | Caching, optimization |
| **Total** | **~364ms** | **<100ms** | - |

### راه‌حل‌های پیشنهادی و وضعیت

#### ✅ Token Management (پیاده‌سازی شده)
- ✅ Token Cache با TTL (2 ساعت)
- ✅ Persistent cache در فایل
- ⏳ Pre-extraction در browser launch (در حال توسعه)
- ⏳ Background refresh قبل از expiration (در حال توسعه)
- ⏳ Token pool برای multiple sessions (آینده)

#### ✅ Order Verification
- ✅ skipVerification flag (پیاده‌سازی شده)
- ⏳ Background verification (پیشنهادی)
- ⏳ Async verification با callback (پیشنهادی)

#### ⏳ Network Optimization
- ⏳ HTTP/2 connection pooling (پیشنهادی)
- ⏳ Request batching (اگر API پشتیبانی کند)
- ⏳ Parallel requests برای multiple orders (آینده)

#### ⏳ Symbol ISIN Caching
- ⏳ Cache کردن mapping symbol → ISIN
- ⏳ Pre-fetch کردن ISIN نمادهای پرطرفدار
- ⏳ Background refresh برای cache

### سوالات باز

#### درباره Verification
- [ ] آیا order verification ضروری است یا می‌توانیم skip کنیم؟
- [ ] چه زمانی verification مهم است؟ (خرید بزرگ؟ فروش؟)
- [ ] آیا background verification کافی است یا نیاز به synchronous داریم؟

#### درباره Optimization
- [ ] آیا می‌توانیم به <50ms برسیم؟ چه بهینه‌سازی‌هایی لازم است؟
- [ ] چطور multiple orders را بهینه handle کنیم؟
- [ ] آیا نیاز به connection pooling داریم؟ چقدر تاثیر دارد؟

#### درباره Caching
- [ ] Symbol ISIN cache چقدر مفید است؟ (چند بار در روز استفاده می‌شود؟)
- [ ] Token cache TTL بهینه چیست؟ (2 ساعت؟ بیشتر؟ کمتر؟)
- [ ] آیا نیاز به cache invalidation strategy داریم؟

---

## 2.1. زیرمدل‌های Model 5 (API Direct)

### سوال اصلی
**آیا می‌توانیم برای Model 5 زیرمدل‌های مختلف ایجاد کنیم و با راه‌حل‌های فنی مختلف آن را بهینه کنیم؟**

### پاسخ: بله! ✅

با بررسی کد مشخص شد که در واقع ما قبلاً شروع کرده‌ایم:
- **Model 5**: API Direct (Standard) - با verification
- **Model 6**: API Ultra - بدون verification (در واقع Model 5.3)

می‌توانیم این رویکرد را گسترش دهیم و زیرمدل‌های بیشتری ایجاد کنیم.

---

### زیرمدل‌های پیشنهادی

#### **Model 5.1: API Direct (Standard)** - فعلی
- ✅ با verification کامل
- ✅ با retry logic (3 attempts)
- ✅ با error handling کامل
- ✅ با logging و monitoring
- ⏱️ **سرعت**: ~364ms
- 📊 **استفاده**: Production پایدار، معاملات مهم
- 🎯 **مزایا**: بالاترین reliability
- ⚠️ **معایب**: کندترین زیرمدل API

**کد فعلی**: `src/brokerages/easy/buyActionAPI.ts`

---

#### **Model 5.2: API Direct (Fast)**
- ❌ بدون verification (skip verification)
- ✅ با retry logic (3 attempts)
- ✅ با error handling
- ✅ با logging
- ⏱️ **سرعت هدف**: ~150ms
- 📊 **استفاده**: تعادل بین سرعت و پایداری
- 🎯 **مزایا**: سریع‌تر از Standard، اما همچنان reliable
- ⚠️ **معایب**: بدون verification ممکن است order را miss کند

**وضعیت**: ⏳ پیشنهادی - نیاز به پیاده‌سازی

**تفاوت با 5.1**: 
```typescript
// فقط skipVerification = true
executeAPIBuy(page, order, { skipVerification: true });
```

---

#### **Model 5.3: API Direct (Ultra)** - فعلی Model 6
- ❌ بدون verification
- ❌ بدون retry (فقط 1 attempt)
- ✅ minimal error handling
- ✅ minimal logging
- ⏱️ **سرعت هدف**: <100ms
- 📊 **استفاده**: سرخطی‌های سریع، معاملات کوچک
- 🎯 **مزایا**: سریع‌ترین زیرمدل
- ⚠️ **معایب**: کمترین reliability

**کد فعلی**: `src/brokerages/easy/buyActionAPIUltra.ts`

**وضعیت**: ✅ پیاده‌سازی شده

---

#### **Model 5.4: API Direct (Parallel Pre-fetch)**
- ❌ بدون verification
- ❌ بدون retry (1 attempt)
- ✅ **Pre-fetch token** در background (اگر cache نباشد)
- ✅ **Pre-fetch ISIN** در background (اگر cache نباشد)
- ✅ **Pre-compute payload** همزمان
- ✅ استفاده از `Promise.all()` برای parallel operations
- ⏱️ **سرعت هدف**: ~80ms
- 📊 **استفاده**: بهترین عملکرد در شرایط عادی
- 🎯 **مزایا**: بهینه‌سازی شده برای parallel operations
- ⚠️ **معایب**: پیچیده‌تر، نیاز به cache management

**وضعیت**: ⏳ پیشنهادی - نیاز به پیاده‌سازی

**ایده کد**:
```typescript
export async function executeAPIParallelPrefetch(
  page: Page,
  order: BuyOrder
): Promise<number> {
  const startTime = Date.now();
  
  // 1. Pre-fetch token (اگر cache نباشد)
  const tokenPromise = tokenCache.get() 
    ? Promise.resolve(tokenCache.get())
    : extractTokenInBackground(page);
  
  // 2. Pre-fetch ISIN (اگر cache نباشد)
  const isinPromise = symbolIsinCache.get(order.symbol)
    ? Promise.resolve(symbolIsinCache.get(order.symbol))
    : fetchIsinInBackground(page, order.symbol);
  
  // 3. آماده‌سازی payload (همزمان)
  const payloadPromise = preparePayload(order);
  
  // 4. انتظار برای تمام pre-fetches (parallel)
  const [token, isin, payload] = await Promise.all([
    tokenPromise,
    isinPromise,
    payloadPromise
  ]);
  
  // 5. ارسال درخواست (فقط این کار blocking است)
  const client = new EasyTraderAPIClient(page);
  const result = await placeOrder(client, { ...order, symbolIsin: isin });
  
  return Date.now() - startTime;
}
```

---

#### **Model 5.5: API Direct (Batch Optimized)**
- ❌ بدون verification
- ❌ بدون retry (1 attempt per order)
- ✅ برای **چند سفارش همزمان**
- ✅ Connection pooling
- ✅ Request batching (اگر API پشتیبانی کند)
- ✅ Parallel execution برای multiple orders
- ⏱️ **سرعت هدف**: <50ms per order
- 📊 **استفاده**: چند سفارش همزمان، high-frequency trading
- 🎯 **مزایا**: بهترین برای multiple orders
- ⚠️ **معایب**: پیچیده‌ترین، نیاز به connection management

**وضعیت**: ⏳ آینده - نیاز به تحقیق درباره API batching

**ایده کد**:
```typescript
export async function executeAPIBatch(
  page: Page,
  orders: BuyOrder[]
): Promise<{ orderId: string; duration: number }[]> {
  // استفاده از connection pool
  // Parallel execution
  // ممکن است نیاز به request batching باشد (اگر API پشتیبانی کند)
}
```

---

### مقایسه زیرمدل‌ها

| زیرمدل | Verification | Retry | Pre-fetch | هدف سرعت | Reliability | پیچیدگی | وضعیت |
|--------|--------------|-------|-----------|----------|-------------|---------|-------|
| 5.1 Standard | ✅ | ✅ (3x) | ❌ | ~364ms | ⭐⭐⭐⭐⭐ | ⭐⭐ | ✅ پیاده شده |
| 5.2 Fast | ❌ | ✅ (3x) | ❌ | ~150ms | ⭐⭐⭐⭐ | ⭐⭐ | ⏳ پیشنهادی |
| 5.3 Ultra | ❌ | ❌ | ❌ | <100ms | ⭐⭐⭐ | ⭐ | ✅ پیاده شده |
| 5.4 Parallel | ❌ | ❌ | ✅ | ~80ms | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⏳ پیشنهادی |
| 5.5 Batch | ❌ | ❌ | ✅ | <50ms | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⏳ آینده |

---

### راه‌حل‌های بهینه‌سازی فنی

#### 1. **Token Pre-warming** 🔥
**ایده**: استخراج token هنگام browser launch در background

**مزایا**:
- Token آماده قبل از درخواست order
- کاهش latency در moment critical
- جلوگیری از blocking

**پیاده‌سازی**:
```typescript
class TokenPreWarmer {
  async warmUp(page: Page) {
    // استخراج token در background
    // ذخیره در cache
    // refresh قبل از expire
  }
}

// در browser launch:
await tokenPreWarmer.warmUp(page);
```

**وضعیت**: ⏳ پیشنهادی

---

#### 2. **Symbol ISIN Caching** 💾
**ایده**: Cache کردن mapping symbol → ISIN برای نمادهای رایج

**مزایا**:
- جلوگیری از lookup تکراری
- کاهش API calls
- سریع‌تر شدن payload preparation

**پیاده‌سازی**:
```typescript
// Cache برای نمادهای پرطرفدار
const symbolIsinCache = new Map<string, string>();

// Pre-fetch برای نمادهای رایج
async function preFetchPopularSymbols() {
  const popular = ['زر', 'شستا', 'فملی', ...];
  for (const symbol of popular) {
    const isin = await fetchIsin(symbol);
    symbolIsinCache.set(symbol, isin);
  }
}
```

**وضعیت**: ⏳ پیشنهادی

---

#### 3. **Connection Reuse** 🔗
**ایده**: استفاده از HTTP/2 multiplexing و نگه داشتن connection باز

**مزایا**:
- کاهش TCP handshake overhead
- کاهش latency
- بهبود throughput

**پیاده‌سازی**:
```typescript
// استفاده از HTTP/2 multiplexing
// نگه داشتن connection باز
// Connection pool برای multiple requests
```

**وضعیت**: ⏳ نیاز به تحقیق - آیا Playwright HTTP/2 پشتیبانی می‌کند؟

---

#### 4. **Payload Optimization** 📦
**ایده**: بهینه‌سازی payload size و pre-computation

**مزایا**:
- کاهش network overhead
- سریع‌تر شدن serialization
- کمتر bandwidth

**پیاده‌سازی**:
```typescript
// Pre-compute date format
const dateFormat = new Intl.DateTimeFormat('en-US', {
  month: 'numeric',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  hour12: true
});

// Minimize JSON payload size
// استفاده از compression (اگر API پشتیبانی کند)
```

**وضعیت**: ⏳ جزئی - در حال حاضر تا حدی انجام شده

---

#### 5. **Predictive Token Refresh** ⏰
**ایده**: Refresh token قبل از expire در background

**مزایا**:
- جلوگیری از blocking در moment critical
- Token همیشه fresh
- کاهش latency

**پیاده‌سازی**:
```typescript
// در TokenCache:
scheduleRefresh() {
  // Refresh 10 دقیقه قبل از expire
  const timeUntilRefresh = expiresAt - Date.now() - REFRESH_BEFORE_EXPIRE;
  setTimeout(() => {
    // Background refresh
    refreshTokenInBackground();
  }, timeUntilRefresh);
}
```

**وضعیت**: ⏳ جزئی پیاده شده - نیاز به تکمیل

---

### ساختار پیشنهادی فایل‌ها

```
src/brokerages/easy/buyActionAPI/
├── index.ts                    // Export مرکزی
├── models/
│   ├── standard.ts            // Model 5.1 (فعلی buyActionAPI.ts)
│   ├── fast.ts                // Model 5.2 (پیشنهادی)
│   ├── ultra.ts               // Model 5.3 (فعلی buyActionAPIUltra.ts)
│   ├── parallelPrefetch.ts    // Model 5.4 (پیشنهادی)
│   └── batchOptimized.ts      // Model 5.5 (آینده)
├── optimizers/
│   ├── tokenPreWarmer.ts      // Token pre-warming
│   ├── symbolIsinCache.ts     // ISIN caching
│   ├── connectionPool.ts      // Connection management
│   └── payloadOptimizer.ts    // Payload optimization
└── types.ts                    // Types مشترک
```

**وضعیت**: ⏳ پیشنهادی - نیاز به refactoring

---

### فازبندی پیاده‌سازی

#### فاز 1: Refactoring (1 هفته)
- ✅ جدا کردن Model 5.1 و 5.3 (Standard و Ultra)
- ✅ ایجاد base class برای shared logic
- ✅ اضافه کردن configuration system
- ✅ تست backward compatibility

#### فاز 2: Optimizations (2 هفته)
- ⏳ پیاده‌سازی Token Pre-warmer
- ⏳ پیاده‌سازی Symbol ISIN Cache
- ⏳ بهبود Connection Management
- ⏳ پیاده‌سازی Model 5.2 (Fast)

#### فاز 3: Advanced Models (3-4 هفته)
- ⏳ پیاده‌سازی Model 5.4 (Parallel Pre-fetch)
- ⏳ تحقیق درباره API batching
- ⏳ پیاده‌سازی Model 5.5 (Batch Optimized) - اگر ممکن باشد
- ⏳ تست performance هر زیرمدل

---

### سوالات باز

#### درباره زیرمدل‌ها
- [ ] کدام زیرمدل اولویت دارد؟ (5.2 Fast یا 5.4 Parallel?)
- [ ] آیا Model 5.5 (Batch) امکان‌پذیر است؟ (API batching دارد؟)
- [ ] چطور در Dashboard انتخاب زیرمدل را handle کنیم؟
- [ ] آیا نیاز به auto-selection داریم؟ (بر اساس شرایط)

#### درباره بهینه‌سازی‌ها
- [ ] Token Pre-warmer چقدر مفید است؟ (چه درصد از زمان را save می‌کند؟)
- [ ] Symbol ISIN Cache برای چند نماد لازم است؟ (10? 50? 100?)
- [ ] آیا Connection Reuse امکان‌پذیر است با Playwright?
- [ ] Payload optimization چقدر تاثیر دارد؟

#### درباره Implementation
- [ ] آیا refactoring را الان انجام دهیم یا بعد از تست Model 6؟
- [ ] چطور backward compatibility را حفظ کنیم؟
- [ ] آیا نیاز به feature flag داریم برای enable/disable زیرمدل‌ها؟

---

### تصمیمات اولیه

#### ✅ تصمیم‌های قطعی
1. **Model 5.3 (Ultra) موجود است**: در واقع Model 6 فعلی
2. **نیاز به Refactoring**: ساختار فعلی نیاز به بهبود دارد
3. **رویکرد تدریجی**: پیاده‌سازی زیرمدل‌ها به صورت تدریجی

#### ⏳ تصمیم‌های در انتظار
1. **اولویت زیرمدل‌ها**: کدام را اول پیاده کنیم؟
2. **Timeline**: چه زمانی refactoring را شروع کنیم؟
3. **Model 5.5**: آیا امکان‌پذیر است یا نه؟

---

### Action Items

#### امروز (2025-01-08)
- [x] بحث و مستندسازی زیرمدل‌های Model 5
- [ ] اولویت‌بندی زیرمدل‌ها
- [ ] تصمیم درباره timeline

#### این هفته
- [ ] تست Model 5.3 (Ultra) در بازار
- [ ] تصمیم درباره شروع refactoring
- [ ] تحقیق درباره API batching (برای Model 5.5)

#### این ماه
- [ ] شروع refactoring (اگر تایید شد)
- [ ] پیاده‌سازی Token Pre-warmer
- [ ] پیاده‌سازی Symbol ISIN Cache
- [ ] پیاده‌سازی Model 5.2 (Fast)

---

## 2.2. استراتژی تست جامع (Comprehensive Testing Strategy)

### فلسفه و رویکرد

**اصل**: به جای تست‌های متعدد و جداگانه، تست‌های جامع طراحی کنیم که با یک اجرا به چندین سوال پاسخ دهند.

**مزایا**:
- ✅ صرفه‌جویی در زمان و منابع
- ✅ تست‌های واقع‌گرایانه‌تر (شرایط واقعی بازار)
- ✅ کشف مشکلاتی که در تست‌های جداگانه دیده نمی‌شوند
- ✅ کاهش پیچیدگی مدیریت تست‌ها
- ✅ تست‌هایی که نزدیک‌تر به استفاده واقعی هستند

---

### تست‌های جامع پیشنهادی

#### تست 1: API Comprehensive Endurance Test (ACET)

**هدف**: تست کامل API در شرایط مختلف و پیدا کردن پاسخ چندین سوال به صورت همزمان

**سوالاتی که پاسخ می‌دهد**:
1. ✅ TTL واقعی توکن چقدر است؟ (1 ساعت؟ 2 ساعت؟ 3 ساعت؟)
2. ✅ Token expiration چگونه handle می‌شود؟
3. ✅ Rate limiting دقیقاً چقدر است؟ (requests per second/minute)
4. ✅ رفتار API در طول زمان چگونه است؟ (آیا performance کاهش می‌یابد؟)
5. ✅ نرخ موفقیت API در شرایط مختلف چقدر است؟
6. ✅ Latency consistency چگونه است？
7. ✅ Error patterns چیست؟ (چه خطاهایی بیشتر رخ می‌دهد؟)
8. ✅ Session persistence چگونه کار می‌کند؟
9. ✅ Symbol ISIN cache چقدر مفید است؟
10. ✅ Performance degradation بعد از چند سفارش؟

**ساختار تست**:
```
1. راه‌اندازی (Setup)
   - Login و استخراج token اولیه
   - ثبت timestamp و token
   - راه‌اندازی metrics collection

2. فاز 1: تست اولیه (0-30 دقیقه)
   - 10 سفارش متوالی
   - اندازه‌گیری latency برای هر سفارش
   - بررسی success rate
   - تست token refresh (اگر لازم باشد)
   - تست Symbol ISIN cache hit rate

3. فاز 2: تست TTL (30 دقیقه - 4 ساعت)
   - نگه داشتن token (بدون refresh)
   - تست در فواصل زمانی مشخص:
     * 30 دقیقه: سفارش تست
     * 1 ساعت: سفارش تست
     * 1.5 ساعت: سفارش تست
     * 2 ساعت: سفارش تست
     * 2.5 ساعت: سفارش تست
     * 3 ساعت: سفارش تست
     * 3.5 ساعت: سفارش تست
     * 4 ساعت: سفارش تست
   - بررسی اینکه کدام تست موفق است و کدام خطا می‌دهد
   - تعیین TTL واقعی (اولین خطای 401 یا token expired)
   - ثبت error messages دقیق

4. فاز 3: تست Rate Limiting
   - شروع با 1 request/second
   - افزایش تدریجی: 2, 5, 10, 15, 20 requests/second
   - بررسی error responses (429 Too Many Requests)
   - تعیین limit دقیق (چند request در ثانیه/دقیقه/ساعت)
   - ثبت timeout و retry behavior

5. فاز 4: تست Load Prolonged (4-8 ساعت)
   - 50 سفارش در طول روز (با فواصل منطقی)
   - بررسی performance degradation
   - تست session persistence
   - بررسی memory leaks یا resource issues
   - تست token refresh خودکار

6. جمع‌بندی و تحلیل
   - تحلیل همه داده‌های collected
   - پاسخ به تمام سوالات
   - بهینه‌سازی TTL و rate limits
   - پیشنهادات برای بهبود
```

**خروجی**:
- گزارش جامع Markdown با پاسخ همه سوالات
- JSON export برای داده‌های خام
- نمودارهای performance و latency
- TTL بهینه برای token cache
- Rate limit دقیق و توصیه‌ها
- Performance benchmarks
- Error patterns و recommendations
- Action items برای بهینه‌سازی

**زمان تخمینی**: 4-8 ساعت (با توجه به فاز TTL که نیاز به صبر دارد)

---

#### تست 2: Model Comparison Comprehensive Test (MCCT)

**هدف**: مقایسه همه مدل‌ها در شرایط یکسان و پیدا کردن بهترین مدل برای هر شرایط

**سوالاتی که پاسخ می‌دهد**:
1. ✅ کدام مدل در شرایط مختلف بهتر است؟
2. ✅ چه زمانی باید از Model 5 استفاده کنیم vs Model 4?
3. ✅ کدام زیرمدل Model 5 بهتر است؟ (5.1, 5.3)
4. ✅ Fallback strategy چیست؟ (چه زمانی fallback کنیم؟)
5. ✅ Trade-off بین speed و reliability چیست؟
6. ✅ کدام مدل برای خرید کوچک بهتر است؟ برای خرید بزرگ؟
7. ✅ کدام مدل در ساعات شلوغی بهتر کار می‌کند؟

**ساختار تست**:
```
1. Setup
   - آماده‌سازی همه مدل‌ها (1, 3, 4, 5.1, 5.3, 6)
   - تعریف order های مختلف (کم، متوسط، زیاد)
   - تعریف شرایط مختلف (صبح، ظهر، شب)

2. تست مدل‌ها با همان order
   - هر مدل با همان order تست می‌شود
   - اندازه‌گیری: speed, success rate, reliability
   - ثبت errors و edge cases

3. تست در شرایط مختلف
   - تست در ساعات مختلف (شروع بازار، وسط، پایان)
   - تست با مقادیر مختلف (1 سهم، 10 سهم، 100 سهم)
   - تست با نمادهای مختلف (پرطرفدار، کم‌طرفدار)

4. تست در شرایط خطا
   - Network issues (simulated)
   - API errors (simulated)
   - Timeout scenarios
   - بررسی recovery behavior

5. تحلیل و رتبه‌بندی
   - رتبه‌بندی مدل‌ها بر اساس معیارهای مختلف
   - پیشنهاد بهترین مدل برای هر شرایط
   - توصیه fallback strategy
```

**خروجی**:
- جدول مقایسه‌ای همه مدل‌ها
- نمودارهای performance comparison
- Decision tree: چه زمانی از کدام مدل استفاده کنیم؟
- Fallback strategy recommendations

**زمان تخمینی**: 2-3 ساعت

---

#### تست 3: Edge Cases & Error Handling Test (ECET)

**هدف**: پیدا کردن همه edge cases و تست error handling

**سوالاتی که پاسخ می‌دهد**:
1. ✅ همه نوع خطاهای ممکن چیست؟
2. ✅ Error handling چگونه کار می‌کند؟
3. ✅ Recovery mechanisms چیست؟
4. ✅ چه edge cases وجود دارد؟
5. ✅ آیا همه خطاها به درستی handle می‌شوند؟
6. ✅ User experience در صورت خطا چگونه است؟

**ساختار تست**:
```
1. تست مقادیر نامعتبر
   - نماد نامعتبر
   - قیمت خارج از محدوده (خیلی بالا، خیلی پایین، منفی)
   - تعداد نامعتبر (صفر، منفی، خیلی زیاد)
   - مقادیر null/undefined

2. تست Network Issues
   - Timeout scenarios
   - Connection refused
   - Slow network
   - Intermittent connectivity

3. تست API Errors
   - 400 Bad Request
   - 401 Unauthorized
   - 403 Forbidden
   - 429 Too Many Requests
   - 500 Internal Server Error
   - 503 Service Unavailable

4. تست Concurrent Scenarios
   - چند سفارش همزمان
   - Race conditions
   - Token refresh همزمان
   - Multiple sessions

5. تست Edge Cases
   - سفارش دقیقاً در زمان expire token
   - سفارش در آخرین ثانیه بازار
   - سفارش با موجودی دقیقاً برابر
   - سفارش با قیمت دقیقاً برابر حد

6. تحلیل
   - لیست همه خطاها
   - بررسی handling هر خطا
   - پیشنهادات برای بهبود
```

**خروجی**:
- لیست کامل edge cases
- Error handling evaluation
- Recommendations برای بهبود error handling
- Test cases برای regression testing

**زمان تخمینی**: 1-2 ساعت

---

### مقایسه رویکردها

| رویکرد | تعداد تست‌ها | زمان اجرا | پوشش | پیچیدگی مدیریت | کیفیت نتایج |
|--------|--------------|-----------|------|-----------------|-------------|
| تست‌های جداگانه | 15-20 تست | 5-10 ساعت | متوسط | بالا | متوسط |
| تست‌های جامع | 3-5 تست | 4-8 ساعت | **بالا** | **پایین** | **عالی** |

**نکته**: با تست‌های جامع، نه تنها زمان کمتری صرف می‌شود، بلکه نتایج باکیفیت‌تر و واقع‌گرایانه‌تر هستند.

---

### پیاده‌سازی پیشنهادی

#### ساختار فایل‌ها:
```
tests/comprehensive/
├── api-endurance-test.ts      # ACET - تست استقامت API
├── model-comparison-test.ts   # MCCT - مقایسه مدل‌ها
├── edge-cases-test.ts         # ECET - تست edge cases
└── utils/
    ├── test-runner.ts         # Runner مشترک برای همه تست‌ها
    ├── metrics-collector.ts   # جمع‌آوری و ذخیره metrics
    ├── report-generator.ts    # تولید گزارش Markdown/JSON
    └── config.ts              # Configuration مشترک
```

#### Features هر تست:
- ✅ **Automatic metrics collection**: جمع‌آوری خودکار همه metrics
- ✅ **Real-time progress tracking**: نمایش پیشرفت در real-time
- ✅ **Comprehensive reporting**: گزارش کامل Markdown + JSON
- ✅ **Error recovery و retry**: مدیریت خودکار خطاها
- ✅ **Configurable parameters**: پارامترهای قابل تنظیم
- ✅ **Export results**: خروجی JSON/CSV/Markdown
- ✅ **Visualization**: نمودارهای performance (اگر ممکن باشد)
- ✅ **Resume capability**: قابلیت ادامه از جایی که قطع شده

#### مثال ساختار ACET:
```typescript
// tests/comprehensive/api-endurance-test.ts

interface ACETConfig {
  testDuration: number; // ساعت
  ordersPerPhase: number;
  ttlTestIntervals: number[]; // [30, 60, 90, ...] دقیقه
  rateLimitTestMax: number; // max requests per second
}

interface ACETResult {
  tokenTTL: number; // دقیقه
  rateLimit: number; // requests per second
  averageLatency: number;
  successRate: number;
  errorPatterns: ErrorPattern[];
  recommendations: string[];
}

async function runACET(config: ACETConfig): Promise<ACETResult> {
  // Implementation
}
```

---

### Action Items

#### فاز 1: طراحی (این هفته)
- [ ] طراحی دقیق ساختار ACET (API Comprehensive Endurance Test)
- [ ] طراحی دقیق ساختار MCCT (Model Comparison Comprehensive Test)
- [ ] طراحی دقیق ساختار ECET (Edge Cases & Error Handling Test)
- [ ] لیست کامل سوالات برای هر تست
- [ ] Metrics که باید collect شوند
- [ ] ساختار گزارش‌ها و خروجی‌ها

#### فاز 2: پیاده‌سازی Infrastructure (1 هفته)
- [ ] پیاده‌سازی `test-runner.ts` (Runner مشترک)
- [ ] پیاده‌سازی `metrics-collector.ts`
- [ ] پیاده‌سازی `report-generator.ts`
- [ ] پیاده‌سازی `config.ts`
- [ ] ساختار دایرکتوری و فایل‌ها

#### فاز 3: پیاده‌سازی تست‌ها (1-2 هفته)
- [ ] پیاده‌سازی ACET
- [ ] پیاده‌سازی MCCT
- [ ] پیاده‌سازی ECET
- [ ] تست هر کدام به صورت جداگانه
- [ ] اصلاحات و بهبودها

#### فاز 4: اجرا و تحلیل (2-3 هفته)
- [ ] اجرای تست‌های جامع در محیط واقعی
- [ ] تحلیل نتایج
- [ ] بهینه‌سازی بر اساس نتایج (TTL, rate limits, etc.)
- [ ] مستندسازی یافته‌ها
- [ ] به‌روزرسانی code بر اساس نتایج

---

### نکات مهم

#### ⚠️ ملاحظات
- تست‌های جامع زمان‌بر هستند اما اطلاعات بیشتری می‌دهند
- باید در زمان تعطیلی بازار اجرا شوند (یا با حساب تست/دمو)
- نیاز به monitoring و logging قوی داریم
- باید results را persist کنیم برای تحلیل بعدی
- ACET نیاز به 4-8 ساعت زمان دارد (به دلیل تست TTL)

#### ✅ مزایای کلیدی
- **یک تست، چندین پاسخ**: با یک اجرا به ده‌ها سوال پاسخ می‌دهیم
- **واقع‌گرایانه**: تست‌هایی که نزدیک به استفاده واقعی هستند
- **کشف مشکلات پنهان**: مشکلاتی که در تست‌های جداگانه دیده نمی‌شوند
- **بهینه‌سازی بهتر**: داده‌های جامع‌تر برای تصمیم‌گیری بهتر

#### 📊 مثال: یک اجرای ACET
```
با یک اجرای 6 ساعته ACET می‌توانیم به این سوالات پاسخ دهیم:
✅ TTL واقعی: 2.5 ساعت (نه 2 ساعت!)
✅ Rate limit: 12 requests/second (نه 10!)
✅ Performance degradation: بعد از 100 سفارش 15% کاهش
✅ Error pattern: 70% خطاها مربوط به rate limiting است
✅ Symbol cache: 85% hit rate برای 10 نماد پرطرفدار
✅ Session: پایدار تا 8 ساعت
```

**نتیجه**: با یک تست، به 10+ سوال پاسخ دادیم که نیاز به 10+ تست جداگانه داشت!

---

## 3. مسائل فنی

### چالش: Dashboard Button Text Update ✅ حل شده

#### مشکل
- دکمه خرید/فروش هنگام تغییر dropdown به‌روز نمی‌شد
- معاملات کار نمی‌کرد
- JavaScript قبل از آماده شدن DOM اجرا می‌شد

#### راه‌حل اعمال شده
- ✅ تمام کد داخل `DOMContentLoaded` قرار گرفت
- ✅ Null checks برای تمام DOM elements اضافه شد
- ✅ پورت به 3002 تغییر کرد (دور زدن cache مرورگر)
- ✅ Instrumentation logs برای debugging اضافه شد

#### وضعیت
✅ **حل شده** - نیاز به تست نهایی در بازار

---

### چالش: Rate Limiting

#### سوال
چطور از Rate Limiting API جلوگیری کنیم و با آن مقابله کنیم؟

#### راه‌حل فعلی
- ✅ Basic Rate Limiter (Token Bucket) پیاده‌سازی شده
- ✅ Default: 10 requests/second
- ✅ Exponential backoff در retry logic
- ⏳ نیاز به تنظیم دقیق‌تر بر اساس API limits

#### سوالات باز
- [ ] محدودیت دقیق API چیست؟ (requests per second/minute/hour)
- [ ] آیا rate limit errors را به درستی handle می‌کنیم؟
- [ ] آیا نیاز به dynamic rate limiting داریم؟ (adapt بر اساس response)
- [ ] چطور multiple sessions را rate limit کنیم؟ (global vs per-session)

#### پیشنهادات
- [ ] تست برای پیدا کردن actual limits
- [ ] اضافه کردن rate limit detection از error messages
- [ ] اضافه کردن adaptive rate limiting
- [ ] Monitoring و alerting برای rate limit hits

---

### چالش: Session Management

#### وضعیت فعلی
- ✅ Session persistence در `.user-data/`
- ✅ Auto-login برای session موجود
- ⚠️ Single session فقط

#### سوالات و چالش‌ها
- [ ] آیا نیاز به multiple sessions داریم؟ (چند حساب کاربری؟)
- [ ] چطور session expiration را handle کنیم؟
- [ ] آیا نیاز به session health check داریم؟
- [ ] چطور concurrent sessions را manage کنیم؟

#### پیشنهادات آینده
- [ ] Multi-session support
- [ ] Session rotation برای load balancing
- [ ] Automatic session refresh
- [ ] Session monitoring و alerting

---

### چالش: Error Handling

#### وضعیت فعلی
- ✅ Basic error handling در API calls
- ✅ Retry logic با exponential backoff
- ✅ Error logging

#### سوالات باز
- [ ] آیا error messages کاربرپسند هستند؟
- [ ] آیا نیاز به error categorization داریم؟ (retryable vs non-retryable)
- [ ] چطور error recovery را handle کنیم؟
- [ ] آیا نیاز به circuit breaker pattern داریم؟

---

## 4. بهبودهای آینده

### Features پیشنهادی

#### 1. Multi-Session Support
**اولویت**: متوسط  
**وضعیت**: پیشنهادی

- [ ] امکان چند session همزمان
- [ ] Load balancing بین sessions
- [ ] Session health monitoring
- [ ] Auto-failover بین sessions

**سوالات**:
- آیا کاربران نیاز به چند حساب دارند؟
- چطور session selection را handle کنیم؟

---

#### 2. Advanced Order Management
**اولویت**: بالا  
**وضعیت**: پیشنهادی

- [ ] Order queuing system (صف سفارشات)
- [ ] Order cancellation
- [ ] Order modification (تغییر قیمت/تعداد)
- [ ] Order history tracking
- [ ] Order status monitoring (real-time)

**سوالات**:
- آیا API از order cancellation پشتیبانی می‌کند؟
- آیا نیاز به queue برای orders داریم؟ (اگر API busy باشد)

---

#### 3. Real-time Monitoring
**اولویت**: متوسط  
**وضعیت**: پیشنهادی

- [ ] WebSocket connection برای real-time updates
- [ ] Live order status
- [ ] Market data integration
- [ ] Dashboard real-time updates

**سوالات**:
- آیا ایزی‌تریدر WebSocket API دارد؟
- یا باید polling استفاده کنیم؟

---

#### 4. Analytics & Reporting
**اولویت**: پایین  
**وضعیت**: پیشنهادی

- [ ] Performance analytics dashboard
- [ ] Success rate tracking
- [ ] Latency monitoring و histogram
- [ ] Error analysis و trending
- [ ] Daily/weekly/monthly reports

**سوالات**:
- آیا نیاز به database داریم؟
- یا localStorage/file-based کافی است؟

---

#### 5. Smart Order Routing
**اولویت**: پایین  
**وضعیت**: ایده

- [ ] انتخاب خودکار بهترین مدل بر اساس شرایط
- [ ] Load balancing بین API endpoints (اگر وجود دارد)
- [ ] Adaptive model selection

---

#### 6. Testing & CI/CD
**اولویت**: متوسط  
**وضعیت**: پیشنهادی

- [ ] Unit tests برای API functions
- [ ] Integration tests
- [ ] Automated testing در CI/CD
- [ ] Performance benchmarks

---

### سوالات کلی درباره Features

- [ ] اولویت‌بندی features چیست؟ (چه چیزی اول؟)
- [ ] آیا نیاز به WebSocket داریم یا polling کافی است؟
- [ ] چطور analytics را implement کنیم؟ (Database? File-based?)
- [ ] آیا نیاز به separate backend service داریم؟ (یا current dashboard کافی است؟)

---

## 5. سوالات باز (Open Questions)

### فنی

#### Database & Storage
- [ ] آیا نیاز به database برای ذخیره orders داریم؟ (PostgreSQL? SQLite? MongoDB?)
- [ ] یا file-based storage (JSON) کافی است؟
- [ ] چطور session data را persist کنیم؟ (encrypted?)

#### Architecture
- [ ] آیا نیاز به queue system برای orders داریم؟ (Redis? BullMQ?)
- [ ] چطور concurrent orders را handle کنیم؟
- [ ] آیا نیاز به separate worker processes داریم؟

#### Performance
- [ ] آیا می‌توانیم به <50ms برسیم؟ چه بهینه‌سازی‌هایی لازم است؟
- [ ] چطور multiple symbols را بهینه handle کنیم؟
- [ ] آیا نیاز به caching layer داریم؟ (Redis?)

---

### عملکرد (Performance)

#### Latency
- [ ] هدف نهایی latency چیست؟ (<50ms? <100ms?)
- [ ] چطور می‌توانیم consistency را بهبود دهیم؟
- [ ] آیا variance در latency مهم است؟

#### Throughput
- [ ] حداکثر orders per second چقدر است؟
- [ ] آیا نیاز به batching داریم؟
- [ ] چطور concurrent requests را handle کنیم؟

---

### امنیت (Security)

#### Token Management
- [ ] چطور tokens را به صورت secure ذخیره کنیم؟ (encryption?)
- [ ] آیا نیاز به token rotation داریم؟
- [ ] چطور token leakage را detect کنیم؟

#### Session Security
- [ ] چطور session hijacking را جلوگیری کنیم?
- [ ] آیا نیاز به session timeout داریم؟
- [ ] چطور multiple device login را handle کنیم؟

#### Data Security
- [ ] آیا نیاز به encryption برای cached data داریم؟
- [ ] چطور sensitive data را handle کنیم؟ (order history?)
- [ ] آیا نیاز به audit logging داریم؟

---

### عملیاتی (Operational)

#### Monitoring
- [ ] چه metrics مهم هستند؟ (success rate, latency, error rate?)
- [ ] چطور alerts را setup کنیم؟
- [ ] آیا نیاز به dashboard monitoring داریم؟

#### Maintenance
- [ ] چطور API changes را detect کنیم؟
- [ ] آیا نیاز به versioning برای API client داریم؟
- [ ] چطور backward compatibility را handle کنیم؟

---

## 6. تصمیمات اتخاذ شده

### ✅ تصمیمات قطعی

#### 2025-01-08
1. **Dashboard Port Change**: تغییر پورت از 3000 به 3002 برای دور زدن cache
2. **JavaScript Structure**: بازسازی ساختار JavaScript با DOMContentLoaded
3. **Model Strategy**: نگه داشتن همه مدل‌ها تا تست کامل API
4. **Documentation**: ایجاد فایل discussions برای مستندسازی بحث‌ها

#### تاریخ‌های قبلی
- (برای تکمیل بعداً)

---

### ⏳ تصمیمات در انتظار

1. **حذف Model 1-4**: بعد از تست کامل API (1-2 هفته)
2. **Model 4 Fallback**: نیاز به تصمیم درباره نگه داشتن به عنوان fallback
3. **Features Prioritization**: اولویت‌بندی features آینده
4. **Rate Limiting Strategy**: تنظیم دقیق rate limits
5. **Token Management**: تصمیم درباره pre-extraction و background refresh

---

## 7. نکات و یادداشت‌ها

### تنظیمات فعلی

- **Token Cache TTL**: 2 ساعت (قابل تنظیم)
- **Rate Limiter**: 10 requests/second (پیش‌فرض)
- **API Timeout**: 5 seconds
- **Retry Attempts**: 3 با exponential backoff
- **Dashboard Port**: 3002

### نکات فنی مهم

#### API Endpoints
- Place Order: `POST /core/api/v2/order`
- Get Orders: `GET /core/api/order`
- Queue Position: `GET /ms/api/MarketSheet/order-place`

#### Token Extraction
- از ترافیک شبکه استخراج می‌شود
- Cached در `.cache/token.json`
- Auto-refresh (در حال توسعه)

#### Session Management
- Session در `.user-data/easy/` ذخیره می‌شود
- Auto-login برای session موجود
- Manual login برای اولین بار

---

### منابع مفید

- [API Documentation](./api/easytrader-api-spec.md)
- [Transaction Analysis Reports](./reports/)
- [Performance Benchmarks](./reports/speed-report.md)
- [Dashboard Guide](./guides/dashboard-guide.md)

---

### یادداشت‌های مهم

- ⚠️ **API Changes**: اگر ایزی‌تریدر API را تغییر دهد، باید سریع adapt کنیم
- ⚠️ **Rate Limiting**: هنوز دقیقاً نمی‌دانیم limits چیست - نیاز به تست
- ✅ **Token Cache**: کار می‌کند اما می‌تواند بهتر شود
- ⏳ **Performance**: هدف <100ms برای Model 6 - در حال بهینه‌سازی

---

## 8. Action Items

### امروز (2025-01-08)
- [x] بحث درباره حذف/نگه‌داری مدل‌ها
- [x] مستندسازی چالش‌ها و سوالات
- [x] بحث و مستندسازی زیرمدل‌های Model 5
- [x] استراتژی تست جامع و طراحی ACET/MCCT/ECET
- [ ] اولویت‌بندی features برای آینده
- [ ] تکمیل checklist تست API
- [ ] اولویت‌بندی زیرمدل‌های Model 5

### این هفته
- [ ] تست کامل API (Model 5 & 6) در بازار
- [ ] جمع‌آوری آمار عملکرد (success rate, latency)
- [ ] تصمیم‌گیری درباره Model 4 fallback
- [ ] تست rate limiting و پیدا کردن actual limits
- [ ] طراحی دقیق ساختار تست‌های جامع (ACET, MCCT, ECET)

### این ماه
- [ ] پیاده‌سازی features اولویت‌دار
- [ ] بهبود rate limiting strategy
- [ ] Analytics dashboard (اگر اولویت دارد)
- [ ] بهبود token management (pre-extraction, background refresh)
- [ ] پیاده‌سازی تست‌های جامع (ACET, MCCT, ECET)
- [ ] اجرای تست‌های جامع و تحلیل نتایج

### آینده (3-6 ماه)
- [ ] تصمیم درباره حذف کامل UI models
- [ ] Multi-session support (اگر نیاز باشد)
- [ ] Advanced order management
- [ ] Real-time monitoring (اگر WebSocket در دسترس باشد)

---

## 9. جلسات و بحث‌ها

### جلسه 2025-01-08
**موضوع**: بررسی مدل‌ها و استراتژی آینده

**شرکت‌کنندگان**: (تکمیل شود)

**نکات کلیدی**:
- تصمیم گرفتیم رویکرد تدریجی برای حذف UI models
- نیاز به تست کامل API قبل از هر تصمیم
- Model 4 ممکن است به عنوان fallback نگه داشته شود
- امکان ایجاد زیرمدل‌های مختلف برای Model 5 (API) تایید شد
- **تصمیم مهم**: استفاده از تست‌های جامع به جای تست‌های جداگانه

**تصمیمات**:
- نگه داشتن همه مدل‌ها تا تست کامل
- ایجاد این فایل برای مستندسازی
- امکان ایجاد 5 زیرمدل مختلف برای Model 5 (5.1 تا 5.5)
- رویکرد تدریجی برای پیاده‌سازی زیرمدل‌ها
- **استراتژی تست جامع**: طراحی 3 تست جامع (ACET, MCCT, ECET) که به چندین سوال پاسخ می‌دهند

**Action Items**:
- تکمیل checklist تست API
- شروع تست‌ها در بازار باز
- اولویت‌بندی زیرمدل‌های Model 5
- تصمیم درباره timeline refactoring
- طراحی و پیاده‌سازی تست‌های جامع (ACET, MCCT, ECET)

---

**نکته**: این فایل باید به صورت منظم به‌روزرسانی شود و تصمیمات جدید در آن ثبت شوند.

**نحوه استفاده**:
- برای هر بحث جدید، بخش جدید اضافه کنید
- سوالات را در بخش "سوالات باز" ثبت کنید
- تصمیمات را در بخش "تصمیمات اتخاذ شده" ثبت کنید
- Action items را به‌روز کنید
