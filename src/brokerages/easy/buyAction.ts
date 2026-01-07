import { Page } from 'playwright';
import { PerformanceLogger } from './logger';
import { logger } from '../../core/advancedLogger';
import { getSymbolSelector } from './symbolHelper';

export interface BuyOrder {
  symbol: string;
  price: string;
  quantity: string;
  /**
   * نوع سفارش: خرید یا فروش
   * پیش‌فرض: 'buy'
   */
  side?: 'buy' | 'sell';
}

/**
 * تبدیل اعداد فارسی به انگلیسی
 */
function persianToEnglish(text: string): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  
  let result = text;
  for (let i = 0; i < persianDigits.length; i++) {
    result = result.replace(new RegExp(persianDigits[i], 'g'), englishDigits[i]);
  }
  return result;
}

/**
 * استخراج موجودی نقدی از صفحه کارگزاری
 * 
 * @param page - صفحه Playwright
 * @returns موجودی نقدی به ریال یا null در صورت خطا
 */
export async function getCashBalance(page: Page): Promise<number | null> {
  try {
    // #region agent log
    try {
      const fs = require('fs');
      const path = require('path');
      const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
      const debugEntry = JSON.stringify({location:'buyAction.ts:getCashBalance',message:'Starting balance extraction',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'}) + '\n';
      fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
    } catch (e) {}
    // #endregion
    
    // استفاده از selector ui-number
    const selector = 'ui-number';
    
    // #region agent log
    try {
      const fs = require('fs');
      const path = require('path');
      const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
      const debugEntry = JSON.stringify({location:'buyAction.ts:getCashBalance',message:'Looking for ui-number element',data:{selector},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'}) + '\n';
      fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
    } catch (e) {}
    // #endregion
    
    const balanceText = await page.evaluate(() => {
      // استفاده از XPath: //*[@id="root"]/main/div[3]/div/div/div/desktop-footer/div/div[2]/div/div
      const xpath = "//*[@id='root']/main/div[3]/div/div/div/desktop-footer/div/div[2]/div/div";
      const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
      const xpathElement = result.singleNodeValue as HTMLElement;
      
      if (xpathElement) {
        const text = xpathElement.textContent || xpathElement.innerText || '';
        if (text && text.trim() !== '') {
          return { text, source: 'xpath' };
        }
      }
      
      // Fallback 1: جستجو در desktop-footer با selector CSS
      const footer = document.querySelector('desktop-footer');
      if (footer) {
        // مسیر: desktop-footer > div > div[2] > div > div
        const divs = footer.querySelectorAll('div');
        if (divs.length >= 2) {
          const targetDiv = Array.from(divs).find(div => {
            const parent = div.parentElement;
            if (parent && parent.children.length >= 2) {
              const index = Array.from(parent.children).indexOf(div);
              return index === 1; // div[2] یعنی index 1
            }
            return false;
          });
          if (targetDiv) {
            const innerDiv = targetDiv.querySelector('div > div') as HTMLElement;
            if (innerDiv) {
              const text = innerDiv.textContent || innerDiv.innerText || '';
              if (text && text.trim() !== '') {
                return { text, source: 'footer-selector' };
              }
            }
          }
        }
        
        // Fallback در footer: ui-number
        const uiNumbers = footer.querySelectorAll('ui-number');
        if (uiNumbers.length > 0) {
          const lastUiNumber = uiNumbers[uiNumbers.length - 1] as HTMLElement;
          const text = lastUiNumber.textContent || lastUiNumber.innerText || '';
          if (text && text.trim() !== '') {
            return { text, source: 'footer-ui-number' };
          }
        }
      }
      
      // Fallback 2: جستجوی تمام ui-number در صفحه
      const allUiNumbers = document.querySelectorAll('ui-number');
      if (allUiNumbers.length > 0) {
        const lastUiNumber = allUiNumbers[allUiNumbers.length - 1] as HTMLElement;
        const text = lastUiNumber.textContent || lastUiNumber.innerText || '';
        if (text && text.trim() !== '') {
          return { text, source: 'all-ui-number' };
        }
      }
      
      return { text: '', source: 'none' };
    });
    
    const extractedText = typeof balanceText === 'string' ? balanceText : balanceText.text;
    const source = typeof balanceText === 'string' ? 'unknown' : balanceText.source;
    
    // #region agent log
    try {
      const fs = require('fs');
      const path = require('path');
      const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
      const debugEntry = JSON.stringify({location:'buyAction.ts:getCashBalance',message:'Extraction result',data:{extractedText,source,isEmpty:!extractedText || extractedText.trim()===''},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'}) + '\n';
      fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
    } catch (e) {}
    // #endregion
    
    // #region agent log
    try {
      const fs = require('fs');
      const path = require('path');
      const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
      const debugEntry = JSON.stringify({location:'buyAction.ts:getCashBalance',message:'Balance text extracted',data:{extractedText,source,isEmpty:!extractedText || extractedText.trim()===''},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'}) + '\n';
      fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
    } catch (e) {}
    // #endregion
    
    if (!extractedText || extractedText.trim() === '') {
      logger.warn('buyAction.ts:getCashBalance', 'Balance element not found or empty', { selector });
      // #region agent log
      try {
        const fs = require('fs');
        const path = require('path');
        const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
        const debugEntry = JSON.stringify({location:'buyAction.ts:getCashBalance',message:'Balance not found',data:{selector},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'}) + '\n';
        fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
      } catch (e) {}
      // #endregion
      return null;
    }
    
    // تبدیل اعداد فارسی به انگلیسی
    let cleaned = persianToEnglish(extractedText);
    
    // #region agent log
    try {
      const fs = require('fs');
      const path = require('path');
      const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
      const debugEntry = JSON.stringify({location:'buyAction.ts:getCashBalance',message:'After persian to english',data:{original:extractedText,cleaned},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'}) + '\n';
      fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
    } catch (e) {}
    // #endregion
    
    // حذف "قدرت خرید:"، "ریال" و سایر واحدها
    cleaned = cleaned.replace(/قدرت\s*خرید\s*:?/gi, '')
                     .replace(/ریال/gi, '')
                     .replace(/rial/gi, '')
                     .replace(/[﷼\uFDFC]/g, '') // نماد ریال
                     .trim();
    
    // #region agent log
    try {
      const fs = require('fs');
      const path = require('path');
      const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
      const debugEntry = JSON.stringify({location:'buyAction.ts:getCashBalance',message:'After removing labels',data:{cleaned},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F1'}) + '\n';
      fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
    } catch (e) {}
    // #endregion
    
    // استخراج عدد (با حفظ کاما برای تشخیص میلیون‌ها)
    // اول حذف تمام کاراکترهای غیرعددی به جز کاما و نقطه
    let numberOnly = cleaned.replace(/[^0-9,.]/g, '');
    
    // #region agent log
    try {
      const fs = require('fs');
      const path = require('path');
      const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
      const debugEntry = JSON.stringify({location:'buyAction.ts:getCashBalance',message:'Number extraction',data:{numberOnly},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F2'}) + '\n';
      fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
    } catch (e) {}
    // #endregion
    
    // حذف جداکننده‌ها (کاما، فاصله) اما حفظ نقطه برای اعشار
    cleaned = numberOnly.replace(/[,،٫\s]/g, '');
    
    // #region agent log
    try {
      const fs = require('fs');
      const path = require('path');
      const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
      const debugEntry = JSON.stringify({location:'buyAction.ts:getCashBalance',message:'After cleaning',data:{cleaned},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'}) + '\n';
      fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
    } catch (e) {}
    // #endregion
    
    // Parse کردن عدد
    const balance = parseFloat(cleaned);
    
    // #region agent log
    try {
      const fs = require('fs');
      const path = require('path');
      const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
      const debugEntry = JSON.stringify({location:'buyAction.ts:getCashBalance',message:'Parse result',data:{balance,isNaN:isNaN(balance)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'}) + '\n';
      fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
    } catch (e) {}
    // #endregion
    
    if (isNaN(balance) || balance < 0) {
      logger.warn('buyAction.ts:getCashBalance', 'Failed to parse balance', { balanceText, cleaned });
      return null;
    }
    
    logger.info('buyAction.ts:getCashBalance', 'Balance extracted successfully', { balance });
    return balance;
    
  } catch (error: any) {
    // #region agent log
    try {
      const fs = require('fs');
      const path = require('path');
      const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
      const debugEntry = JSON.stringify({location:'buyAction.ts:getCashBalance',message:'Error caught',data:{errorMessage:error.message,errorStack:error.stack?.substring(0,200)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'}) + '\n';
      fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
    } catch (e) {}
    // #endregion
    logger.error('buyAction.ts:getCashBalance', 'Error extracting balance', error, {});
    return null;
  }
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
    const symbolSelector = getSymbolSelector(order.symbol);
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

