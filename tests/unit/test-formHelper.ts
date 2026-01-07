import { BrowserManager } from '../../src/core/browser';
import { clearFormFields, verifyFormValues } from '../../src/brokerages/easy/formHelper';
import { logger } from '../../src/core/advancedLogger';

/**
 * تست‌های واحد برای formHelper
 */
async function testFormHelper() {
  console.log('========================================');
  console.log('🧪 تست‌های واحد: Form Helper');
  console.log('========================================\n');

  const browserManager = new BrowserManager('easy');
  let page: any = null;

  try {
    // راه‌اندازی مرورگر
    console.log('🚀 راه‌اندازی مرورگر...');
    page = await browserManager.launch(false);
    await page.goto('https://d.easytrader.ir/', { waitUntil: 'load' });
    await page.waitForTimeout(15000);

    // انتخاب نماد و باز کردن پنل خرید
    console.log('📝 باز کردن پنل خرید...');
    const symbolSelector = `[data-cy='symbol-name-renderer-IRTKZARF0001']`;
    await page.locator(symbolSelector).click({ force: true });
    await page.waitForTimeout(100);
    await page.locator("[data-cy='order-buy-btn']").click({ force: true });
    await page.waitForTimeout(500);

    // تست 1: Clear کردن فیلدها
    console.log('\n📝 تست 1: Clear کردن فیلدها...');
    try {
      // پر کردن فیلدها با مقادیر تست
      await page.locator("[data-cy='order-form-input-price']").fill('100000');
      await page.locator("[data-cy='order-form-input-quantity']").fill('5');
      await page.waitForTimeout(200);

      // Clear کردن
      await clearFormFields(page);
      await page.waitForTimeout(200);

      // بررسی اینکه فیلدها خالی شده‌اند
      const priceAfterClear = await page.locator("[data-cy='order-form-input-price']").inputValue().catch(() => '');
      const quantityAfterClear = await page.locator("[data-cy='order-form-input-quantity']").inputValue().catch(() => '');

      if (priceAfterClear === '' && quantityAfterClear === '') {
        console.log('✅ تست 1 موفق: فیلدها با موفقیت clear شدند');
        logger.info('test-formHelper', 'Test 1 passed: Fields cleared successfully');
      } else {
        console.log(`❌ تست 1 ناموفق: فیلدها clear نشدند (price=${priceAfterClear}, quantity=${quantityAfterClear})`);
        logger.warn('test-formHelper', 'Test 1 failed: Fields not cleared', { priceAfterClear, quantityAfterClear });
      }
    } catch (error: any) {
      console.log(`❌ تست 1 خطا: ${error.message}`);
      logger.error('test-formHelper', 'Test 1 error', error);
    }

    // تست 2: Verify کردن مقادیر
    console.log('\n📝 تست 2: Verify کردن مقادیر...');
    try {
      // پر کردن فیلدها
      await page.locator("[data-cy='order-form-input-price']").fill('200000');
      await page.locator("[data-cy='order-form-input-quantity']").fill('3');
      await page.waitForTimeout(200);

      // Verify کردن
      const result = await verifyFormValues(page, '200000', '3');

      if (result.isValid) {
        console.log('✅ تست 2 موفق: مقادیر با موفقیت verify شدند');
        logger.info('test-formHelper', 'Test 2 passed: Values verified successfully', result);
      } else {
        console.log(`❌ تست 2 ناموفق: مقادیر تطابق ندارند`);
        console.log(`  Expected: price=200000, quantity=3`);
        console.log(`  Actual: price=${result.actualPrice}, quantity=${result.actualQuantity}`);
        logger.warn('test-formHelper', 'Test 2 failed: Values do not match', result);
      }
    } catch (error: any) {
      console.log(`❌ تست 2 خطا: ${error.message}`);
      logger.error('test-formHelper', 'Test 2 error', error);
    }

    // تست 3: Verify با مقادیر نادرست
    console.log('\n📝 تست 3: Verify با مقادیر نادرست...');
    try {
      // پر کردن فیلدها با مقادیر خاص
      await page.locator("[data-cy='order-form-input-price']").fill('300000');
      await page.locator("[data-cy='order-form-input-quantity']").fill('4');
      await page.waitForTimeout(200);

      // Verify کردن با مقادیر نادرست
      const result = await verifyFormValues(page, '300000', '5'); // quantity اشتباه

      if (!result.isValid) {
        console.log('✅ تست 3 موفق: سیستم مقادیر نادرست را تشخیص داد');
        logger.info('test-formHelper', 'Test 3 passed: Invalid values detected', result);
      } else {
        console.log('❌ تست 3 ناموفق: سیستم مقادیر نادرست را تشخیص نداد');
        logger.warn('test-formHelper', 'Test 3 failed: Invalid values not detected', result);
      }
    } catch (error: any) {
      console.log(`❌ تست 3 خطا: ${error.message}`);
      logger.error('test-formHelper', 'Test 3 error', error);
    }

    console.log('\n✅✅✅ تمام تست‌های Form Helper تکمیل شدند!');

  } catch (error: any) {
    console.error('\n❌ خطا در تست Form Helper:', error.message);
    logger.error('test-formHelper', 'Test suite error', error);
    throw error;
  } finally {
    if (page) {
      await browserManager.close();
    }
  }
}

testFormHelper();



