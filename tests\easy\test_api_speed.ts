import { BrowserManager } from '../../src/core/browser';
import { executeAPIBuy } from '../../src/brokerages/easy/buyActionAPI';

async function testAPISpeed() {
  const browserManager = new BrowserManager('easy');

  try {
    const page = await browserManager.launch(false);
    
    console.log('📍 در حال ورود به ایزی‌تریدر...');
    await page.goto('https://d.easytrader.ir/', { waitUntil: 'load', timeout: 60000 });
    
    // صبر برای لود کامل و authentication
    console.log('⏳ در انتظار لود کامل و authentication (۱۰ ثانیه)...');
    await page.waitForTimeout(10000);

    const order = {
      symbol: 'زر',
      price: '590000',
      quantity: '2'
    };

    // اجرای خرید از طریق API
    const duration = await executeAPIBuy(page, order);

    console.log(`\n🚀 زمان کل عملیات خرید API: ${duration} میلی‌ثانیه`);
    
    console.log('\n⏳ ۳ ثانیه صبر برای مشاهده نتیجه...');
    await page.waitForTimeout(3000);

  } catch (error: any) {
    console.error('\n❌ خطا در تست API:', error.message);
  } finally {
    await browserManager.close();
  }
}

testAPISpeed();

