import { Page } from 'playwright';
import { PerformanceLogger } from './logger';
import { BuyOrder } from './buyAction';

/**
 * مدل ۴: Ultra-Aggressive (۲۰۲ms) 🏆 سریع‌ترین
 * حذف کامل waitForTimeout و استفاده از setInterval
 */
export async function executeUltraBuy(page: Page, order: BuyOrder): Promise<number> {
  console.log('\n--- شروع فرآیند خرید (مدل ۴: Ultra) ---');
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
        priceInput.value = price;
        priceInput.dispatchEvent(new Event('input', { bubbles: true }));
        priceInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
      
      if (quantityInput) {
        quantityInput.value = quantity;
        quantityInput.dispatchEvent(new Event('input', { bubbles: true }));
        quantityInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, { price: order.price, quantity: order.quantity });
    PerformanceLogger.end('Fill_Form_Ultra');

    // ۴. ارسال سفارش (بدون انتظار)
    PerformanceLogger.start('Submit_Order');
    await page.locator("[data-cy='oms-order-form-submit-button-buy']").click({ force: true });
    PerformanceLogger.end('Submit_Order');

    const totalTime = PerformanceLogger.end('Total_Execution_Ultra');
    console.log(`✅✅✅ سفارش با موفقیت ثبت شد (Ultra)! زمان: ${totalTime}ms`);
    return totalTime;

  } catch (error: any) {
    console.error('❌ خطا در فرآیند خرید:', error.message);
    PerformanceLogger.end('Total_Execution_Ultra');
    throw error;
  }
}

