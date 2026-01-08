import { BrowserManager } from '../../src/core/browser';
import { executeUltraBuy } from '../../src/brokerages/easy/buyActionUltra';
import { logger } from '../../src/core/advancedLogger';

/**
 * تست سناریو: خرید پایه
 * محدودیت: فقط یک خرید با زر، 2 واحد، 590000
 */
async function testBasicBuy() {
  console.log('========================================');
  console.log('🧪 تست سناریو: خرید پایه');
  console.log('========================================\n');

  const browserManager = new BrowserManager('easy');
  let page: any = null;

  try {
    const startTime = Date.now();

    // راه‌اندازی مرورگر
    console.log('🚀 راه‌اندازی مرورگر...');
    page = await browserManager.launch(false);
    await page.goto('https://d.easytrader.ir/', { waitUntil: 'load' });
    await page.waitForTimeout(15000);

    logger.info('test-scenario-basic', 'Browser launched', { headless: false });

    // سناریو: خرید پایه با مقادیر ثابت
    const order = {
      symbol: 'زر',
      price: '590000',
      quantity: '2'
    };

    console.log(`\n📝 سناریو: خرید پایه`);
    console.log(`   نماد: ${order.symbol}`);
    console.log(`   قیمت: ${order.price}`);
    console.log(`   تعداد: ${order.quantity}`);

    logger.info('test-scenario-basic', 'Starting scenario test', { order });

    const duration = await executeUltraBuy(page, order);

    const totalTime = Date.now() - startTime;

    console.log(`\n✅ سناریو موفق: زمان اجرا ${duration}ms (کل: ${totalTime}ms)`);
    logger.logBuy(`scenario-basic-buy`, order, { success: true, duration, totalTime }, duration);
    logger.logPerformance('scenario-basic', duration, { order, totalTime });

    console.log('\n✅✅✅ تست سناریو تکمیل شد!');

  } catch (error: any) {
    console.error('\n❌ خطا در تست سناریو:', error.message);
    logger.error('test-scenario-basic', 'Scenario test error', error);
    throw error;
  } finally {
    if (page) {
      await browserManager.close();
    }
  }
}

testBasicBuy();




