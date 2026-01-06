import { Page } from 'playwright';
import { PerformanceLogger } from './logger';
import { logger } from '../../core/advancedLogger';

export interface BuyOrder {
  symbol: string;
  price: string;
  quantity: string;
}

/**
 * مدل ۱: Standard-Fast (۹۶۰ms)
 * استفاده از Playwright Locators استاندارد
 */
export async function executeFastBuy(page: Page, order: BuyOrder): Promise<number> {
  console.log('\n--- شروع فرآیند خرید (مدل ۱: Standard) ---');
  logger.info('buyAction.ts:executeFastBuy', 'Starting buy process', { model: 1, order });
  PerformanceLogger.start('Total_Execution');

  try {
    // ۱. انتخاب نماد
    PerformanceLogger.start('Select_Symbol');
    const symbolSelector = `[data-cy='symbol-name-renderer-IRTKZARF0001']`;
    await page.locator(symbolSelector).click({ force: true });
    await page.waitForTimeout(100);
    PerformanceLogger.end('Select_Symbol');

    // ۲. باز کردن پنل خرید
    PerformanceLogger.start('Open_Buy_Panel');
    await page.locator("[data-cy='order-buy-btn']").click({ force: true });
    await page.waitForTimeout(200);
    
    // تایید هوشمند: چک کردن هدر پنل
    const headerCheck = await page.evaluate(() => {
      const header = document.querySelector('order-form-header');
      return header?.textContent?.includes('اطلس') || false;
    });

    if (headerCheck) {
      console.log('⚠️ پنل برای اطلس باز شده. کلیک مجدد روی زر...');
      await page.locator(symbolSelector).click({ force: true });
      await page.waitForTimeout(100);
      await page.locator("[data-cy='order-buy-btn']").click({ force: true });
      await page.waitForTimeout(200);
    }
    PerformanceLogger.end('Open_Buy_Panel');

    // ۳. پر کردن فرم
    PerformanceLogger.start('Fill_Form');
    
    // Log form values before clear
    const beforeClearPrice = await page.locator("[data-cy='order-form-input-price']").inputValue().catch(()=>'');
    const beforeClearQuantity = await page.locator("[data-cy='order-form-input-quantity']").inputValue().catch(()=>'');
    logger.logFormValues('buyAction.ts:fillForm', 'before-clear', 
      { price: beforeClearPrice, quantity: beforeClearQuantity },
      { price: order.price, quantity: order.quantity }
    );
    
    // Clear کردن فیلدها قبل از پر کردن
    await page.locator("[data-cy='order-form-input-price']").clear();
    await page.locator("[data-cy='order-form-input-quantity']").clear();
    await page.waitForTimeout(50);
    
    // Log form values after clear
    const afterClearPrice = await page.locator("[data-cy='order-form-input-price']").inputValue().catch(()=>'');
    const afterClearQuantity = await page.locator("[data-cy='order-form-input-quantity']").inputValue().catch(()=>'');
    logger.logFormValues('buyAction.ts:fillForm', 'after-clear', 
      { price: afterClearPrice, quantity: afterClearQuantity }
    );
    
    // پر کردن فیلد قیمت
    await page.locator("[data-cy='order-form-input-price']").fill(order.price, { force: true });
    await page.waitForTimeout(100);
    
    // Log after filling price
    const afterFillPrice = await page.locator("[data-cy='order-form-input-price']").inputValue().catch(()=>'');
    logger.logFormValues('buyAction.ts:fillForm', 'after-fill-price', 
      { price: afterFillPrice },
      { price: order.price }
    );
    
    // پر کردن فیلد تعداد
    await page.locator("[data-cy='order-form-input-quantity']").fill(order.quantity, { force: true });
    await page.waitForTimeout(100);
    
    // Log after filling quantity
    const afterFillQuantity = await page.locator("[data-cy='order-form-input-quantity']").inputValue().catch(()=>'');
    logger.logFormValues('buyAction.ts:fillForm', 'after-fill-quantity', 
      { quantity: afterFillQuantity },
      { quantity: order.quantity }
    );
    
    // تایید مقادیر
    const actualPrice = await page.locator("[data-cy='order-form-input-price']").inputValue();
    const actualQuantity = await page.locator("[data-cy='order-form-input-quantity']").inputValue();
    
    // Log verification result
    logger.logFormValues('buyAction.ts:fillForm', 'verification', 
      { price: actualPrice, quantity: actualQuantity },
      { price: order.price, quantity: order.quantity }
    );
    
    if (actualPrice !== order.price || actualQuantity !== order.quantity) {
      console.warn(`⚠️ مقادیر تطابق ندارند! Expected: ${order.price}/${order.quantity}, Actual: ${actualPrice}/${actualQuantity}`);
      // Retry: clear و fill مجدد
      await page.locator("[data-cy='order-form-input-price']").clear();
      await page.locator("[data-cy='order-form-input-quantity']").clear();
      await page.waitForTimeout(50);
      await page.locator("[data-cy='order-form-input-price']").fill(order.price, { force: true });
      await page.waitForTimeout(50);
      await page.locator("[data-cy='order-form-input-quantity']").fill(order.quantity, { force: true });
      await page.waitForTimeout(100);
    } else {
      console.log(`✅ مقادیر تایید شد: قیمت=${actualPrice}, تعداد=${actualQuantity}`);
    }
    
    PerformanceLogger.end('Fill_Form');

    // ۴. ارسال سفارش
    PerformanceLogger.start('Submit_Order');
    
    // Log before submit
    const beforeSubmitPrice = await page.locator("[data-cy='order-form-input-price']").inputValue().catch(()=>'');
    const beforeSubmitQuantity = await page.locator("[data-cy='order-form-input-quantity']").inputValue().catch(()=>'');
    logger.logFormValues('buyAction.ts:submit', 'before-submit', 
      { price: beforeSubmitPrice, quantity: beforeSubmitQuantity },
      { price: order.price, quantity: order.quantity }
    );
    
    // Intercept form submission to capture actual values
    let submittedValues: any = null;
    page.once('request', async (request) => {
      if (request.url().includes('api-mts.orbis.easytrader.ir') && request.method() === 'POST') {
        try {
          const postData = request.postDataJSON();
          logger.logAPIRequest(request.url(), request.method(), postData);
          submittedValues = postData;
        } catch (e: any) {
          logger.error('buyAction.ts:intercept', 'Failed to parse API request', e);
        }
      }
    });
    
    await page.locator("[data-cy='oms-order-form-submit-button-buy']").click({ force: true });
    await page.waitForTimeout(100);
    PerformanceLogger.end('Submit_Order');

    const totalTime = PerformanceLogger.end('Total_Execution');
    console.log(`✅✅✅ سفارش با موفقیت ثبت شد! زمان: ${totalTime}ms`);
    
    // Log successful buy
    logger.logBuy(`buy-${Date.now()}`, order, { success: true, duration: totalTime }, totalTime);
    logger.logPerformance('buy-model-1', totalTime, { order, success: true });
    
    return totalTime;

  } catch (error: any) {
    console.error('❌ خطا در فرآیند خرید:', error.message);
    PerformanceLogger.end('Total_Execution');
    
    // Log error
    logger.error('buyAction.ts:executeFastBuy', 'Buy process failed', error, { order });
    
    throw error;
  }
}

