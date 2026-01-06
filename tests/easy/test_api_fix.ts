import { BrowserManager } from '../../src/core/browser';
import { executeAPIBuy } from '../../src/brokerages/easy/buyActionAPI';

async function testAPIFix() {
  const browserManager = new BrowserManager('easy');

  try {
    console.log('========================================');
    console.log('🛠️ تست عیب‌یابی و تعمیر API Client');
    console.log('========================================\n');

    const page = await browserManager.launch(false);
    
    console.log('📍 در حال ورود به ایزی‌تریدر...');
    await page.goto('https://d.easytrader.ir/', { waitUntil: 'domcontentloaded' });
    
    // صبر می‌کنیم تا صفحه لود شود و ترافیک شبکه برقرار شود
    // این باعث می‌شود تابع getAuthHeaders بتواند توکن را شکار کند
    console.log('⏳ در انتظار لود کامل و برقراری ارتباط با سرور...');
    
    // شنود درخواست‌های API قبل از فراخوانی getAuthHeaders
    let apiRequestFound = false;
    const requestListener = (request: any) => {
      const url = request.url();
      if (url.includes('api-mts.orbis.easytrader.ir') && 
          request.method() !== 'OPTIONS' &&
          url.includes('/api/v2/')) {
        console.log('✅ درخواست API پیدا شد:', url);
        apiRequestFound = true;
      }
    };
    
    page.on('request', requestListener);
    
    // صبر می‌کنیم تا حداقل یک درخواست API ارسال شود
    await page.waitForTimeout(3000);
    
    // تلاش برای تعامل با صفحه برای تحریک درخواست‌های API
    try {
      await page.mouse.wheel(0, 100);
      await page.waitForTimeout(2000);
      await page.mouse.wheel(0, -100);
      await page.waitForTimeout(2000);
    } catch {}
    
    // اگر هنوز درخواستی پیدا نشده، بیشتر صبر می‌کنیم
    if (!apiRequestFound) {
      console.log('⏳ منتظر درخواست‌های API بیشتر...');
      await page.waitForTimeout(10000);
    }
    
    // حذف listener برای جلوگیری از memory leak
    page.off('request', requestListener);

    const order = {
      symbol: 'زر',
      price: '590000', // قیمتی که احتمالاً در صف خرید نیست یا دور از بازار است برای تست
      quantity: '2'
    };

    console.log('\n🚀 اجرای سفارش API...');
    const duration = await executeAPIBuy(page, order);

    console.log(`\n⏱️ زمان اجرا: ${duration} میلی‌ثانیه`);
    
    console.log('\n⏳ ۵ ثانیه صبر برای مشاهده نتیجه...');
    await page.waitForTimeout(5000);

  } catch (error: any) {
    console.error('\n❌ خطا در تست:', error.message);
  } finally {
    await browserManager.close();
  }
}

testAPIFix();