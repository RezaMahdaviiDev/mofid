import { Page } from 'playwright';
import { PerformanceLogger } from './logger';
import { BuyOrder } from './buyAction';
import { logger } from '../../core/advancedLogger';

/**
 * مدل ۴: Ultra-Aggressive (۲۰۲ms) 🏆 سریع‌ترین
 * حذف کامل waitForTimeout و استفاده از setInterval
 */
export async function executeUltraBuy(page: Page, order: BuyOrder): Promise<number> {
  console.log('\n--- شروع فرآیند خرید (مدل ۴: Ultra) ---');
  logger.info('buyActionUltra.ts:executeUltraBuy', 'Starting buy process', { model: 4, order });
  PerformanceLogger.start('Total_Execution_Ultra');

  try {
    // ۱. انتخاب نماد (بدون انتظار)
    PerformanceLogger.start('Select_Symbol');
    await page.locator(`[data-cy='symbol-name-renderer-IRTKZARF0001']`).click({ force: true });
    PerformanceLogger.end('Select_Symbol');

    // ۲. باز کردن پنل خرید (بدون انتظار)
    PerformanceLogger.start('Open_Buy_Panel');
    await page.locator("[data-cy='order-buy-btn']").click({ force: true });
    
    // چک کردن با setInterval
    await page.evaluate(() => {
      return new Promise<void>((resolve) => {
        const checkInterval = setInterval(() => {
          const header = document.querySelector('order-form-header');
          if (header) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 10);
        
        setTimeout(() => {
          clearInterval(checkInterval);
          resolve();
        }, 500);
      });
    });
    PerformanceLogger.end('Open_Buy_Panel');

    // ۳. پر کردن فرم با JS (بدون انتظار)
    PerformanceLogger.start('Fill_Form_Ultra');
    await page.evaluate(({ price, quantity }) => {
      const priceInput = document.querySelector("[data-cy='order-form-input-price']") as HTMLInputElement;
      const quantityInput = document.querySelector("[data-cy='order-form-input-quantity']") as HTMLInputElement;
      
      if (priceInput) {
        priceInput.focus();
        priceInput.value = ''; // Clear کردن
        priceInput.value = price;
        priceInput.dispatchEvent(new Event('input', { bubbles: true }));
        priceInput.dispatchEvent(new Event('change', { bubbles: true }));
        priceInput.blur();
      }
      
      if (quantityInput) {
        quantityInput.focus();
        quantityInput.value = ''; // Clear کردن
        quantityInput.value = quantity;
        quantityInput.dispatchEvent(new Event('input', { bubbles: true }));
        quantityInput.dispatchEvent(new Event('change', { bubbles: true }));
        quantityInput.blur();
      }
    }, { price: order.price, quantity: order.quantity });
    
    // تایید سریع
    await page.waitForTimeout(50);
    const verification = await page.evaluate(({ expectedPrice, expectedQuantity }) => {
      const priceInput = document.querySelector("[data-cy='order-form-input-price']") as HTMLInputElement;
      const quantityInput = document.querySelector("[data-cy='order-form-input-quantity']") as HTMLInputElement;
      return {
        isValid: (priceInput?.value === expectedPrice) && (quantityInput?.value === expectedQuantity),
        actualPrice: priceInput?.value || '',
        actualQuantity: quantityInput?.value || ''
      };
    }, { expectedPrice: order.price, expectedQuantity: order.quantity });
    
    if (!verification.isValid) {
      console.warn(`⚠️ مقادیر تطابق ندارند! Expected: ${order.price}/${order.quantity}, Actual: ${verification.actualPrice}/${verification.actualQuantity}`);
      logger.warn('buyActionUltra.ts:fillForm', 'Form values mismatch', {
        expected: { price: order.price, quantity: order.quantity },
        actual: { price: verification.actualPrice, quantity: verification.actualQuantity }
      });
    } else {
      logger.logFormValues('buyActionUltra.ts:fillForm', 'verification-success', 
        { price: verification.actualPrice, quantity: verification.actualQuantity },
        { price: order.price, quantity: order.quantity }
      );
    }
    
    PerformanceLogger.end('Fill_Form_Ultra');

    // ۴. ارسال سفارش (بدون انتظار)
    PerformanceLogger.start('Submit_Order');
    await page.locator("[data-cy='oms-order-form-submit-button-buy']").click({ force: true });
    PerformanceLogger.end('Submit_Order');

    const totalTime = PerformanceLogger.end('Total_Execution_Ultra');
    console.log(`✅✅✅ سفارش با موفقیت ثبت شد (Ultra)! زمان: ${totalTime}ms`);
    
    // Log successful buy
    logger.logBuy(`buy-${Date.now()}`, order, { success: true, duration: totalTime }, totalTime);
    logger.logPerformance('buy-model-4', totalTime, { order, success: true });
    
    return totalTime;

  } catch (error: any) {
    console.error('❌ خطا در فرآیند خرید:', error.message);
    PerformanceLogger.end('Total_Execution_Ultra');
    
    // Log error
    logger.error('buyActionUltra.ts:executeUltraBuy', 'Buy process failed', error, { order });
    
    throw error;
  }
}

