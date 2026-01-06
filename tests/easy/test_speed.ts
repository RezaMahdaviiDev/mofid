import { BrowserManager } from '../../src/core/browser';
import { executeFastBuy } from '../../src/brokerages/easy/buyAction';

async function testSpeed() {
  const browserManager = new BrowserManager('easy');

  try {
    console.log('========================================');
    console.log('🚀 تست سرعت مدل ۱ (Standard)');
    console.log('========================================\n');

    const page = await browserManager.launch(false);
    
    console.log('📍 در حال ورود به ایزی‌تریدر...');
    await page.goto('https://d.easytrader.ir/', { waitUntil: 'load' });
    await page.waitForTimeout(15000); // انتظار برای لود کامل
    
    const order = {
      symbol: 'زر',
      price: '590000',
      quantity: '2'
    };

    console.log('\n🚀 اجرای سفارش...');
    const duration = await executeFastBuy(page, order);

    console.log(`\n⏱️ زمان کل اجرا: ${duration} میلی‌ثانیه`);
    
    console.log('\n⏳ ۵ ثانیه صبر برای مشاهده نتیجه...');
    await page.waitForTimeout(5000);

  } catch (error: any) {
    console.error('\n❌ خطا در تست:', error.message);
  } finally {
    await browserManager.close();
  }
}

testSpeed();

