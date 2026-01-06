import { BrowserManager } from '../../src/core/browser';
import { executeJSInjectBuy } from '../../src/brokerages/easy/buyActionJS';

async function testModel3() {
  const browserManager = new BrowserManager('easy');

  try {
    const page = await browserManager.launch(false);
    await page.goto('https://d.easytrader.ir/', { waitUntil: 'load', timeout: 60000 });
    await page.waitForTimeout(15000);

    const order = {
      symbol: 'زر',
      price: '590000',
      quantity: '2'
    };

    const duration = await executeJSInjectBuy(page, order);
    console.log(`\n🚀 زمان کل مدل ۳: ${duration} میلی‌ثانیه`);
    await page.waitForTimeout(5000);

  } catch (error: any) {
    console.error('\n❌ خطا در تست مدل ۳:', error.message);
  } finally {
    await browserManager.close();
  }
}

testModel3();

