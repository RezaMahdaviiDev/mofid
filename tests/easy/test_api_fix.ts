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
    console.log('⏳ در انتظار لود کامل و برقراری ارتباط با سرور (۱۵ ثانیه)...');
    
    // یک اسکرول کوچک یا تعامل برای اجبار به بارگذاری دیتا
    await page.waitForTimeout(5000);
    try {
        await page.mouse.wheel(0, 100);
    } catch {}
    await page.waitForTimeout(10000);

    const order = {
      symbol: 'زر',
      price: '590000', // قیمتی که احتمالاً در صف خرید نیست یا دور از بازار است برای تست
      quantity: '1'
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