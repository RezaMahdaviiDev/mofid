import { BrowserManager } from '../../src/core/browser';
import { executeFastBuy } from '../../src/brokerages/easy/buyAction';
import { executeUltraBuy } from '../../src/brokerages/easy/buyActionUltra';
import { executeAPIBuy } from '../../src/brokerages/easy/buyActionAPI';
import { logger } from '../../src/core/advancedLogger';

/**
 * تست عملکرد: بنچمارک سرعت مدل‌های مختلف
 * محدودیت: فقط یک خرید با زر، 2 واحد، 590000
 */
async function testBenchmark() {
  console.log('========================================');
  console.log('🧪 تست عملکرد: بنچمارک سرعت مدل‌ها');
  console.log('========================================\n');

  const order = {
    symbol: 'زر',
    price: '590000',
    quantity: '2'
  };

  const results: Array<{ model: string; duration: number; success: boolean }> = [];

  // تست مدل 1
  console.log('📝 تست مدل 1 (Standard)...');
  const browserManager1 = new BrowserManager('easy');
  try {
    const page1 = await browserManager1.launch(false);
    await page1.goto('https://d.easytrader.ir/', { waitUntil: 'load' });
    await page1.waitForTimeout(15000);

    const start1 = Date.now();
    const duration1 = await executeFastBuy(page1, order);
    const total1 = Date.now() - start1;

    results.push({ model: 'Model 1 (Standard)', duration: duration1, success: true });
    console.log(`✅ مدل 1: ${duration1}ms (کل: ${total1}ms)`);
    logger.logPerformance('benchmark-model1', duration1, { order, total: total1 });

    await browserManager1.close();
  } catch (error: any) {
    console.log(`❌ مدل 1 ناموفق: ${error.message}`);
    results.push({ model: 'Model 1 (Standard)', duration: 0, success: false });
    logger.error('benchmark-model1', 'Benchmark failed', error);
    await browserManager1.close().catch(() => {});
  }

  await new Promise(resolve => setTimeout(resolve, 3000)); // صبر بین تست‌ها

  // تست مدل 4
  console.log('\n📝 تست مدل 4 (Ultra)...');
  const browserManager4 = new BrowserManager('easy');
  try {
    const page4 = await browserManager4.launch(false);
    await page4.goto('https://d.easytrader.ir/', { waitUntil: 'load' });
    await page4.waitForTimeout(15000);

    const start4 = Date.now();
    const duration4 = await executeUltraBuy(page4, order);
    const total4 = Date.now() - start4;

    results.push({ model: 'Model 4 (Ultra)', duration: duration4, success: true });
    console.log(`✅ مدل 4: ${duration4}ms (کل: ${total4}ms)`);
    logger.logPerformance('benchmark-model4', duration4, { order, total: total4 });

    await browserManager4.close();
  } catch (error: any) {
    console.log(`❌ مدل 4 ناموفق: ${error.message}`);
    results.push({ model: 'Model 4 (Ultra)', duration: 0, success: false });
    logger.error('benchmark-model4', 'Benchmark failed', error);
    await browserManager4.close().catch(() => {});
  }

  await new Promise(resolve => setTimeout(resolve, 3000)); // صبر بین تست‌ها

  // تست مدل 5
  console.log('\n📝 تست مدل 5 (API)...');
  const browserManager5 = new BrowserManager('easy');
  try {
    const page5 = await browserManager5.launch(false);
    await page5.goto('https://d.easytrader.ir/', { waitUntil: 'load' });
    await page5.waitForTimeout(15000);

    const start5 = Date.now();
    const duration5 = await executeAPIBuy(page5, order);
    const total5 = Date.now() - start5;

    results.push({ model: 'Model 5 (API)', duration: duration5, success: true });
    console.log(`✅ مدل 5: ${duration5}ms (کل: ${total5}ms)`);
    logger.logPerformance('benchmark-model5', duration5, { order, total: total5 });

    await browserManager5.close();
  } catch (error: any) {
    console.log(`❌ مدل 5 ناموفق: ${error.message}`);
    results.push({ model: 'Model 5 (API)', duration: 0, success: false });
    logger.error('benchmark-model5', 'Benchmark failed', error);
    await browserManager5.close().catch(() => {});
  }

  // خلاصه نتایج
  console.log('\n========================================');
  console.log('📊 خلاصه نتایج بنچمارک:');
  console.log('========================================\n');

  const successfulResults = results.filter(r => r.success);
  if (successfulResults.length > 0) {
    successfulResults.sort((a, b) => a.duration - b.duration);
    
    successfulResults.forEach((result, index) => {
      console.log(`${index + 1}. ${result.model}: ${result.duration}ms`);
    });

    const fastest = successfulResults[0];
    console.log(`\n🏆 سریع‌ترین: ${fastest.model} با ${fastest.duration}ms`);
    
    logger.info('benchmark-summary', 'Benchmark results', {
      results,
      fastest: fastest,
      order
    });
  } else {
    console.log('❌ هیچ مدلی موفق نبود!');
  }

  console.log('\n✅✅✅ تست بنچمارک تکمیل شد!');
}

testBenchmark();

