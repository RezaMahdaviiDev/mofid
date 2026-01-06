/**
 * تست سرعت و عملکرد نهایی (۳ عدد عیار)
 */
import { BrowserManager } from '../../src/core/browser';
import { executeFastBuy } from '../../src/brokerages/easy/buyAction';

async function performanceTest() {
  const browserManager = new BrowserManager('easy');

  try {
    const page = await browserManager.launch(false);
    
    console.log('📍 در حال ورود به ایزی‌تریدر...');
    await page.goto('https://d.easytrader.ir/', { waitUntil: 'load', timeout: 60000 });
    
    // صبر برای لود کامل ماژول‌ها
    console.log('⏳ در انتظار لود کامل ویجت‌ها (۱۵ ثانیه)...');
    await page.waitForTimeout(15000);

    const order = {
      symbol: 'زر',
      price: '590000',
      quantity: '2'
    };

    // اجرای خرید بهینه با لاگ‌گیری
    const duration = await executeFastBuy(page, order);

    console.log(`\n🚀 زمان کل عملیات خرید: ${duration} میلی‌ثانیه`);
    
    console.log('\n⏳ ۵ ثانیه صبر برای مشاهده پیام سیستم...');
    await page.waitForTimeout(5000);

  } catch (error: any) {
    console.error('\n❌ خطا در تست عملکرد:', error.message);
  } finally {
    await browserManager.close();
  }
}

performanceTest();

