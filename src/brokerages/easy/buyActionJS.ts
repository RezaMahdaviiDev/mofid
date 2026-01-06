import { Page } from 'playwright';
import { PerformanceLogger } from './logger';
import { BuyOrder } from './buyAction';
import * as fs from 'fs';
import * as path from 'path';

const LOG_FILE = path.join(process.cwd(), '.cursor', 'debug.log');
function debugLog(location: string, message: string, data: any, hypothesisId: string) {
  try {
    const logEntry = JSON.stringify({
      location,
      message,
      data,
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'run1',
      hypothesisId
    }) + '\n';
    fs.appendFileSync(LOG_FILE, logEntry, 'utf8');
  } catch (e) {}
}

/**
 * مدل ۳: JS-Injection (۷۶۳ms) ⭐ توصیه می‌شود
 * تغییر مستقیم value اینپوت‌ها با page.evaluate()
 */
export async function executeJSInjectBuy(page: Page, order: BuyOrder): Promise<number> {
  console.log('\n--- شروع فرآیند خرید (مدل ۳: JS Injection) ---');
  // #region agent log
  debugLog('buyActionJS.ts:9', 'executeJSInjectBuy entry', { order }, 'A');
  // #endregion
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
    
    // #region agent log
    const beforeJSPrice = await page.evaluate(()=>(document.querySelector("[data-cy='order-form-input-price']")as HTMLInputElement)?.value||'').catch(()=>'');
    const beforeJSQuantity = await page.evaluate(()=>(document.querySelector("[data-cy='order-form-input-quantity']")as HTMLInputElement)?.value||'').catch(()=>'');
    debugLog('buyActionJS.ts:42', 'Before JS injection', { beforeJSPrice, beforeJSQuantity, expectedPrice: order.price, expectedQuantity: order.quantity }, 'F');
    // #endregion
    
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
    
    // تایید سریع (همسان با مدل 4)
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
    }
    
    PerformanceLogger.end('Fill_Form_JS');

    // ۴. ارسال سفارش
    PerformanceLogger.start('Submit_Order');
    
    // #region agent log
    const beforeSubmitPriceJS = await page.evaluate(()=>(document.querySelector("[data-cy='order-form-input-price']")as HTMLInputElement)?.value||'').catch(()=>'');
    const beforeSubmitQuantityJS = await page.evaluate(()=>(document.querySelector("[data-cy='order-form-input-quantity']")as HTMLInputElement)?.value||'').catch(()=>'');
    debugLog('buyActionJS.ts:115', 'Before submit JS', { beforeSubmitPriceJS, beforeSubmitQuantityJS, expectedPrice: order.price, expectedQuantity: order.quantity }, 'E');
    // #endregion
    
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

