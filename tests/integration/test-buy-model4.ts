import { BrowserManager } from '../../src/core/browser';
import { executeUltraBuy } from '../../src/brokerages/easy/buyActionUltra';
import { logger } from '../../src/core/advancedLogger';

/**
 * تست یکپارچگی: فرآیند کامل خرید با مدل 4
 */
async function testBuyModel4() {
  console.log('========================================');
  console.log('🧪 تست یکپارچگی: خرید با مدل 4 (Ultra)');
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

    logger.info('test-buy-model4', 'Browser launched', { headless: false });

    // تست با مقادیر ثابت (محدودیت: فقط زر، 2 واحد، 590000)
    const order = {
      symbol: 'زر',
      price: '590000',
      quantity: '2'
    };

    console.log(`\n📝 تست خرید با مدل 4`);
    console.log(`   نماد: ${order.symbol}, قیمت: ${order.price}, تعداد: ${order.quantity}`);

    try {
      logger.info('test-buy-model4', 'Starting integration test', { order });

      const duration = await executeUltraBuy(page, order);

      console.log(`✅ تست موفق: زمان اجرا ${duration}ms`);
      logger.logBuy(`integration-test-model4`, order, { success: true, duration }, duration);
      logger.logPerformance('integration-test-model4', duration, { order });

    } catch (error: any) {
      console.log(`❌ تست ناموفق: ${error.message}`);
      logger.error('test-buy-model4', 'Integration test failed', error, { order });
      throw error;
    }

    const totalTime = Date.now() - startTime;
    console.log(`\n✅✅✅ تست یکپارچگی مدل 4 تکمیل شد!`);
    console.log(`⏱️ زمان کل: ${totalTime}ms`);
    logger.logPerformance('integration-test-model4-total', totalTime, { order });

  } catch (error: any) {
    console.error('\n❌ خطا در تست یکپارچگی مدل 4:', error.message);
    logger.error('test-buy-model4', 'Integration test error', error);
    throw error;
  } finally {
    if (page) {
      await browserManager.close();
    }
  }
}

testBuyModel4();

