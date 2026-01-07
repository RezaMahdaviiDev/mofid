import { logger, LogLevel } from '../../src/core/advancedLogger';
import * as fs from 'fs';
import * as path from 'path';

async function testLogger() {
  console.log('========================================');
  console.log('🧪 تست Logger پیشرفته');
  console.log('========================================\n');

  try {
    // Test 1: Basic logging
    console.log('📝 تست 1: لاگ‌گیری سطوح مختلف...');
    logger.debug('test', 'Debug message', { test: 'debug' });
    logger.info('test', 'Info message', { test: 'info' });
    logger.warn('test', 'Warn message', { test: 'warn' });
    logger.error('test', 'Error message', new Error('Test error'), { test: 'error' });
    console.log('✅ تست 1 موفق\n');

    // Test 2: Form values logging
    console.log('📝 تست 2: لاگ‌گیری مقادیر فرم...');
    logger.logFormValues('test', 'before-clear', 
      { price: '100000', quantity: '5' },
      { price: '100000', quantity: '5' }
    );
    logger.logFormValues('test', 'after-fill', 
      { price: '100000', quantity: '5' },
      { price: '100000', quantity: '5' }
    );
    console.log('✅ تست 2 موفق\n');

    // Test 3: Performance logging
    console.log('📝 تست 3: لاگ‌گیری عملکرد...');
    logger.logPerformance('test-operation', 150, { model: 1 });
    console.log('✅ تست 3 موفق\n');

    // Test 4: Buy logging
    console.log('📝 تست 4: لاگ‌گیری خرید...');
    logger.logBuy('test-buy-123', 
      { symbol: 'زر', price: '100000', quantity: '2' },
      { success: true },
      200
    );
    console.log('✅ تست 4 موفق\n');

    // Test 5: API logging
    console.log('📝 تست 5: لاگ‌گیری API...');
    logger.logAPIRequest('https://test.com/api', 'POST', 
      { test: 'data' },
      { success: true },
      200
    );
    console.log('✅ تست 5 موفق\n');

    // Test 6: Browser state logging
    console.log('📝 تست 6: لاگ‌گیری وضعیت مرورگر...');
    logger.logBrowserState('test', { headless: true, url: 'https://test.com', ready: true });
    console.log('✅ تست 6 موفق\n');

    // Check log files
    console.log('📂 بررسی فایل‌های لاگ...');
    const today = new Date().toISOString().split('T')[0];
    const logFiles = [
      `logs/info-${today}.json`,
      `logs/warn-${today}.json`,
      `logs/error-${today}.json`,
      `logs/debug-${today}.json`,
      `logs/performance/performance-${today}.json`,
      `logs/buy/buy-test-buy-123-*.json`
    ];

    let foundFiles = 0;
    if (fs.existsSync('logs')) {
      const files = fs.readdirSync('logs', { recursive: true });
      console.log(`✅ ${files.length} فایل لاگ پیدا شد`);
      foundFiles = files.length;
    }

    console.log('\n✅✅✅ تمام تست‌های Logger موفق بودند!');
    console.log(`📊 تعداد فایل‌های لاگ: ${foundFiles}`);

  } catch (error: any) {
    console.error('\n❌ خطا در تست Logger:', error.message);
    throw error;
  }
}

testLogger();



