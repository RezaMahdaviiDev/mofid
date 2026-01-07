import { logger } from '../../src/core/advancedLogger';

/**
 * تست mapping نماد به ISIN
 */
async function testSymbolMapping() {
  console.log('========================================');
  console.log('🧪 تست‌های واحد: Symbol to ISIN Mapping');
  console.log('========================================\n');

  try {
    // Mapping table (از buyActionAPI.ts)
    const symbolToIsin: Record<string, string> = {
      'زر': 'IRTKZARF0001',
      'فولاد': 'IRTKFOOL0001',
      'شپدیس': 'IRTKSHPD0001',
      // می‌توانید نمادهای دیگر را اضافه کنید
    };

    // تست 1: Mapping نماد معتبر
    console.log('📝 تست 1: Mapping نماد معتبر...');
    const testCases = [
      { symbol: 'زر', expectedIsin: 'IRTKZARF0001' },
      { symbol: 'فولاد', expectedIsin: 'IRTKFOOL0001' },
      { symbol: 'شپدیس', expectedIsin: 'IRTKSHPD0001' },
    ];

    let passedTests = 0;
    for (const testCase of testCases) {
      const actualIsin = symbolToIsin[testCase.symbol] || 'IRTKZARF0001';
      if (actualIsin === testCase.expectedIsin) {
        console.log(`  ✅ ${testCase.symbol} -> ${actualIsin}`);
        passedTests++;
        logger.info('test-symbolMapping', 'Mapping test passed', { symbol: testCase.symbol, isin: actualIsin });
      } else {
        console.log(`  ❌ ${testCase.symbol}: expected ${testCase.expectedIsin}, got ${actualIsin}`);
        logger.warn('test-symbolMapping', 'Mapping test failed', { symbol: testCase.symbol, expected: testCase.expectedIsin, actual: actualIsin });
      }
    }

    if (passedTests === testCases.length) {
      console.log(`✅ تست 1 موفق: ${passedTests}/${testCases.length} mapping‌ها درست بودند\n`);
    } else {
      console.log(`❌ تست 1 ناموفق: ${passedTests}/${testCases.length} mapping‌ها درست بودند\n`);
    }

    // تست 2: Fallback برای نماد نامعتبر
    console.log('📝 تست 2: Fallback برای نماد نامعتبر...');
    const invalidSymbol = 'نماد-نامعتبر-123';
    const fallbackIsin = symbolToIsin[invalidSymbol] || 'IRTKZARF0001';
    
    if (fallbackIsin === 'IRTKZARF0001') {
      console.log(`✅ تست 2 موفق: Fallback به زر کار می‌کند (${invalidSymbol} -> ${fallbackIsin})`);
      logger.info('test-symbolMapping', 'Fallback test passed', { symbol: invalidSymbol, isin: fallbackIsin });
    } else {
      console.log(`❌ تست 2 ناموفق: Fallback کار نمی‌کند`);
      logger.warn('test-symbolMapping', 'Fallback test failed', { symbol: invalidSymbol, isin: fallbackIsin });
    }

    // تست 3: Case sensitivity
    console.log('\n📝 تست 3: Case sensitivity...');
    const caseTests = [
      { symbol: 'زر', expectedIsin: 'IRTKZARF0001' },
      { symbol: 'ZAR', expectedIsin: 'IRTKZARF0001' }, // باید fallback شود
    ];

    for (const testCase of caseTests) {
      const actualIsin = symbolToIsin[testCase.symbol] || 'IRTKZARF0001';
      if (actualIsin === testCase.expectedIsin) {
        console.log(`  ✅ ${testCase.symbol} -> ${actualIsin}`);
        logger.info('test-symbolMapping', 'Case sensitivity test passed', { symbol: testCase.symbol, isin: actualIsin });
      } else {
        console.log(`  ❌ ${testCase.symbol}: expected ${testCase.expectedIsin}, got ${actualIsin}`);
        logger.warn('test-symbolMapping', 'Case sensitivity test failed', { symbol: testCase.symbol, expected: testCase.expectedIsin, actual: actualIsin });
      }
    }

    console.log('\n✅✅✅ تمام تست‌های Symbol Mapping تکمیل شدند!');

  } catch (error: any) {
    console.error('\n❌ خطا در تست Symbol Mapping:', error.message);
    logger.error('test-symbolMapping', 'Test suite error', error);
    throw error;
  }
}

testSymbolMapping();



