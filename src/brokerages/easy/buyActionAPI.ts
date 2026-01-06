import { Page } from 'playwright';
import { PerformanceLogger } from './logger';
import { BuyOrder } from './buyAction';
import { executeFastBuy } from './buyAction';

/**
 * دریافت هدرهای معتبر از ترافیک شبکه با استفاده از page.route()
 * این تابع از route interception استفاده می‌کند تا توکن را از درخواست‌های واقعی استخراج کند
 */
async function getAuthHeaders(page: Page): Promise<Record<string, string>> {
  console.log('🕵️ در حال استخراج توکن احراز هویت با page.route()...');
  
  // استفاده از page.route() برای intercept کردن درخواست‌ها
  let capturedHeaders: Record<string, string> | null = null;
  let requestFound = false;
  
  const routeHandler = async (route: any) => {
    const request = route.request();
    const url = request.url();
    const headers = request.headers();
    
    // بررسی اینکه آیا این درخواست به API اصلی است و توکن دارد
    if (url.includes('api-mts.orbis.easytrader.ir') && 
        url.includes('/api/v2/') &&
        request.method() !== 'OPTIONS' &&
        (headers['authorization'] || headers['Authorization'])) {
      
      if (!capturedHeaders) {
        capturedHeaders = { ...headers };
        requestFound = true;
        console.log('✅ توکن از درخواست API استخراج شد:', url);
      }
    }
    
    // ادامه درخواست
    await route.continue();
  };
  
  // فعال کردن route interception
  await page.route('**/*', routeHandler);
  
  try {
    // منتظر می‌مانیم تا یک درخواست با توکن پیدا شود
    console.log('⏳ منتظر درخواست API با توکن...');
    
    await page.waitForRequest(
      req => {
        const url = req.url();
        const headers = req.headers();
        return url.includes('api-mts.orbis.easytrader.ir') && 
               url.includes('/api/v2/') &&
               req.method() !== 'OPTIONS' &&
               !!(headers['authorization'] || headers['Authorization']);
      },
      { timeout: 10000 }
    );
    
    // کمی صبر می‌کنیم تا route handler اجرا شود
    await page.waitForTimeout(500);
    
    // غیرفعال کردن route interception
    await page.unroute('**/*', routeHandler);
    
    if (capturedHeaders) {
      const headers = capturedHeaders;
    
      console.log('🔑 هدرهای موجود:', Object.keys(headers).filter(k => 
        k.toLowerCase().includes('auth') || 
        k.toLowerCase().includes('token') ||
        k.toLowerCase().includes('cookie')
      ));
      
      // فیلتر کردن هدرهای مهم
      const authHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'fa',
        'Referer': 'https://d.easytrader.ir/',
        'Origin': 'https://d.easytrader.ir'
      };

      // کپی کردن توکن Authorization اگر وجود داشته باشد
      if (headers['authorization']) {
        authHeaders['Authorization'] = headers['authorization'];
        console.log('✅ توکن Authorization استخراج شد (lowercase).');
      } else if (headers['Authorization']) {
        authHeaders['Authorization'] = headers['Authorization'];
        console.log('✅ توکن Authorization استخراج شد (uppercase).');
      } else {
        console.warn('⚠️ توکن Authorization در هدرها پیدا نشد.');
        // تلاش برای استخراج از کوکی‌ها
        const cookies = await page.context().cookies();
        if (cookies.length > 0) {
          const cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ');
          authHeaders['Cookie'] = cookieString;
          console.log('✅ کوکی‌ها اضافه شدند.');
        }
      }
      
      // کپی کردن سایر هدرهای احتمالی امنیتی
      if (headers['x-requested-with']) authHeaders['X-Requested-With'] = headers['x-requested-with'];
      if (headers['x-csrf-token']) authHeaders['X-CSRF-Token'] = headers['x-csrf-token'];
      if (headers['cookie'] && !authHeaders['Cookie']) {
        authHeaders['Cookie'] = headers['cookie'];
      }
      
      return authHeaders;
    } else {
      throw new Error('توکن پیدا نشد');
    }

  } catch (e: any) {
    // غیرفعال کردن route interception در صورت خطا
    try {
      await page.unroute('**/*', routeHandler);
    } catch {}
    
    console.warn('⚠️ نتوانستیم هدرها را از شبکه استخراج کنیم:', e.message);
    console.warn('💡 از هدرهای پیش‌فرض + کوکی‌ها استفاده می‌شود.');
    
    // تلاش برای استفاده از کوکی‌های موجود
    const cookies = await page.context().cookies();
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/plain, */*',
      'Referer': 'https://d.easytrader.ir/',
      'Origin': 'https://d.easytrader.ir'
    };
    
    if (cookies.length > 0) {
      defaultHeaders['Cookie'] = cookies.map(c => `${c.name}=${c.value}`).join('; ');
      console.log('✅ کوکی‌ها اضافه شدند (fallback).');
    }
    
    return defaultHeaders;
  }
}

/**
 * ارسال مستقیم سفارش خرید از طریق API (سریع‌ترین روش)
 */
export async function executeAPIBuy(page: Page, order: BuyOrder) {
  console.log('\n--- شروع فرآیند خرید API مستقیم (نسخه اصلاح شده) ---');
  PerformanceLogger.start('Total_Execution_API');

  PerformanceLogger.start('Prepare_Headers');
  
  // استخراج هوشمند هدرها
  const headers = await getAuthHeaders(page);
  
  // ساخت payload دقیق
  const now = new Date();
  const createDateTime = now.toLocaleString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const payload = {
    order: {
      price: parseInt(order.price),
      quantity: parseInt(order.quantity),
      side: 0, // 0 = خرید
      validityType: 0, // 0 = روزانه
      createDateTime: createDateTime,
      commission: 0.0012,
      symbolIsin: "IRTKZARF0001", // ISIN نماد زر
      symbolName: order.symbol,
      orderModelType: 1,
      orderFrom: 34
    }
  };

  PerformanceLogger.end('Prepare_Headers');

  PerformanceLogger.start('API_Call');
  
  try {
    // استفاده از context request برای ارسال که کوکی‌ها را هم خودکار مدیریت می‌کند
    const response = await page.request.post('https://api-mts.orbis.easytrader.ir/core/api/v2/order', {
      headers: headers,
      data: payload
    });

    const status = response.status();
    let responseData: any = {};
    
    try {
      responseData = await response.json();
    } catch {
      const text = await response.text();
      console.log('Text Response:', text);
    }

    PerformanceLogger.end('API_Call');

    if (status === 200 && responseData.isSuccessful) {
      console.log(`✅✅✅ سفارش با موفقیت ثبت شد (API)! ID: ${responseData.id}`);
      const totalTime = PerformanceLogger.end('Total_Execution_API');
      return totalTime;
    } else {
      console.warn(`⚠️ خطا در API (Status: ${status}). پیام:`, JSON.stringify(responseData));
      
      // اگر خطا مربوط به محدوده قیمت/حجم باشد، یعنی احراز هویت درست بوده اما دیتا غلط است
      if (status === 400 || (responseData.message && responseData.message.includes('محدوده'))) {
         console.log('💡 نکته: احراز هویت موفق بود، اما پارامترهای سفارش رد شد.');
      }

      const apiTime = PerformanceLogger.end('Total_Execution_API');
      console.log(`🔄 فال‌بک به روش UI...`);
      const uiTime = await executeFastBuy(page, order);
      return apiTime + uiTime;
    }

  } catch (error: any) {
    console.error('❌ خطای ارتباطی در API:', error.message);
    return await executeFastBuy(page, order);
  }
}
