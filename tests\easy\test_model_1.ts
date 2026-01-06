import { BrowserManager } from '../../src/core/browser';
import { executeFastBuy, BuyOrder } from '../../src/brokerages/easy/buyAction';
import { PerformanceLogger } from '../../src/brokerages/easy/logger';

async function testModel1() {
  const browserManager = new BrowserManager('easy');
  const order: BuyOrder = {
    symbol: 'زر',
    price: '590000',
    quantity: '2'
  };

  try {
    console.log('🚀 شروع تست مدل ۱ (Standard)...');
    const page = await browserManager.launch(false);
    
    console.log('📍 در حال ورود به ایزی‌تریدر...');
    await page.goto('https://d.easytrader.ir/', { waitUntil: 'commit' });
    
    // انتظار برای لود اولیه
    await page.waitForTimeout(10000);

    const totalTime = await executeFastBuy(page, order);
    console.log(`\n✅ تست مدل ۱ با موفقیت انجام شد. زمان کل: ${totalTime}ms`);

  } catch (error) {
    console.error('❌ خطا در تست مدل ۱:', error);
  } finally {
    await browserManager.close();
  }
}

testModel1();

