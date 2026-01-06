import { Page } from 'playwright';
import { PerformanceLogger } from './logger';
import { BuyOrder } from './buyAction';

/**
 * مدل ۳: JS-Injection (۷۶۳ms) ⭐ توصیه می‌شود
 * تغییر مستقیم value اینپوت‌ها با page.evaluate()
 */
export async function executeJSInjectBuy(page: Page, order: BuyOrder): Promise<number> {
  console.log('\n--- شروع فرآیند خرید (مدل ۳: JS Injection) ---');
  PerformanceLogger.start('Total_Execution_JS');

  try {
    // ۱. انتخاب نماد
    PerformanceLogger.start('Select_Symbol');
    const symbolSelector = `[data-cy='symbol-name-renderer-IRTKZARF0001']`;
    await page.locator(symbolSelector).click({ force: true });
    await page.waitForTimeout(50);
    PerformanceLogger.end('Select_Symbol');

    // ۲. باز کردن پنل خرید
    PerformanceLogger.start('Open_Buy_Panel');
    await page.locator("[data-cy='order-buy-btn']").click({ force: true });
    await page.waitForTimeout(100);
    
    // تایید هوشمند
    const headerCheck = await page.evaluate(() => {
      const header = document.querySelector('order-form-header');
      return header?.textContent?.includes('اطلس') || false;
    });

    if (headerCheck) {
      await page.locator(symbolSelector).click({ force: true });
      await page.waitForTimeout(50);
      await page.locator("[data-cy='order-buy-btn']").click({ force: true });
      await page.waitForTimeout(100);
    }
    PerformanceLogger.end('Open_Buy_Panel');

    // ۳. پر کردن فرم با JS Injection
    PerformanceLogger.start('Fill_Form_JS');
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
    await page.waitForTimeout(50);
    PerformanceLogger.end('Fill_Form_JS');

    // ۴. ارسال سفارش
    PerformanceLogger.start('Submit_Order');
    await page.locator("[data-cy='oms-order-form-submit-button-buy']").click({ force: true });
    await page.waitForTimeout(100);
    PerformanceLogger.end('Submit_Order');

    const totalTime = PerformanceLogger.end('Total_Execution_JS');
    console.log(`✅✅✅ سفارش با موفقیت ثبت شد (JS)! زمان: ${totalTime}ms`);
    return totalTime;

  } catch (error: any) {
    console.error('❌ خطا در فرآیند خرید:', error.message);
    PerformanceLogger.end('Total_Execution_JS');
    throw error;
  }
}

