import { BrowserManager } from '../../src/core/browser';
import { executeUltraBuy } from '../../src/brokerages/easy/buyActionUltra';

async function testModel4() {
  const browserManager = new BrowserManager('easy');

  try {
    console.log('========================================');
    console.log('🚀 تست مدل ۴ (Ultra)');
    console.log('========================================\n');

    const page = await browserManager.launch(false);
    
    console.log('📍 در حال ورود به ایزی‌تریدر...');
    await page.goto('https://d.easytrader.ir/', { waitUntil: 'load' });
    await page.waitForTimeout(15000);
    
    const order = {
      symbol: 'زر',
      price: '590000',
      quantity: '2'
    };

    console.log('\n🚀 اجرای سفارش...');
    const duration = await executeUltraBuy(page, order);

    console.log(`\n⏱️ زمان کل اجرا: ${duration} میلی‌ثانیه`);
    
    await page.waitForTimeout(5000);

  } catch (error: any) {
    console.error('\n❌ خطا در تست:', error.message);
  } finally {
    await browserManager.close();
  }
}

testModel4();

