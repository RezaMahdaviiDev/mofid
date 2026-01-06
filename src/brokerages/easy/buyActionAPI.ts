import { Page } from 'playwright';
import { PerformanceLogger } from './logger';
import { BuyOrder } from './buyAction';
import { executeFastBuy } from './buyAction';

/**
 * دریافت هدرهای معتبر از ترافیک شبکه
 * این تابع منتظر می‌ماند تا یک درخواست به API ارسال شود و هدرهای آن را کپی می‌کند
 */
async function getAuthHeaders(page: Page): Promise<Record<string, string>> {
  console.log('🕵️ در حال شنود شبکه برای استخراج توکن احراز هویت...');
  
  try {
    // منتظر می‌مانیم تا یک درخواست به API اصلی ارسال شود (مثلاً دریافت مانده یا پورتفوی)
    // معمولا درخواست‌هایی که به /api/v2/ می‌روند حاوی توکن هستند
    const request = await page.waitForRequest(
      req => req.url().includes('api-mts.orbis.easytrader.ir') && 
             req.method() !== 'OPTIONS',
      { timeout: 5000 }
    );

    const headers = request.headers();
    
    // فیلتر کردن هدرهای مهم
    const authHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'fa'
    };

    // کپی کردن توکن Authorization اگر وجود داشته باشد
    if (headers['authorization']) {
      authHeaders['Authorization'] = headers['authorization'];
      console.log('✅ توکن Authorization استخراج شد.');
    }
    
    // کپی کردن سایر هدرهای احتمالی امنیتی
    if (headers['x-requested-with']) authHeaders['X-Requested-With'] = headers['x-requested-with'];
    
    return authHeaders;

  } catch (e) {
    console.warn('⚠️ نتوانستیم هدرها را از شبکه استخراج کنیم. از هدرهای پیش‌فرض استفاده می‌شود.');
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/plain, */*',
      'Referer': 'https://d.easytrader.ir/'
    };
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