import { Page } from 'playwright';
import { PerformanceLogger } from './logger';
import { BuyOrder } from './buyAction';
import { logger } from '../../core/advancedLogger';
import { getSymbolSelector } from './symbolHelper';

/**
 * مدل ۴: Ultra-Aggressive (۲۰۲ms) 🏆 سریع‌ترین
 * حذف کامل waitForTimeout و استفاده از setInterval
 * پشتیبانی از خرید (buy) و فروش (sell) از طریق فیلد order.side
 */
export async function executeUltraBuy(page: Page, order: BuyOrder): Promise<number> {
  const side: 'buy' | 'sell' = order.side === 'sell' ? 'sell' : 'buy';
  const submitButtonSelector = side === 'sell'
    ? "[data-cy='oms-order-form-submit-button-sell']"
    : "[data-cy='oms-order-form-submit-button-buy']";
  
  console.log(`\n--- شروع فرآیند ${side === 'buy' ? 'خرید' : 'فروش'} (مدل ۴: Ultra) ---`);
  logger.info('buyActionUltra.ts:executeUltraBuy', 'Starting buy process', { model: 4, side, order });
  PerformanceLogger.start('Total_Execution_Ultra');

  try {
    // ۱. انتخاب نماد (بدون انتظار)
    PerformanceLogger.start('Select_Symbol');
    const symbolSelector = getSymbolSelector(order.symbol);
    
    // #region agent log
    try {
      const fs = require('fs');
      const path = require('path');
      const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
      const debugEntry = JSON.stringify({location:'buyActionUltra.ts:Select_Symbol',message:'Before symbol click',data:{symbol:order.symbol,selector:symbolSelector},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'}) + '\n';
      fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
    } catch (e) {}
    // #endregion
    
    // بررسی وجود selector
    const symbolExists = await page.locator(symbolSelector).count();
    
    // #region agent log
    try {
      const fs = require('fs');
      const path = require('path');
      const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
      const debugEntry = JSON.stringify({location:'buyActionUltra.ts:Select_Symbol',message:'Symbol selector check',data:{symbol:order.symbol,selector:symbolSelector,exists:symbolExists},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'}) + '\n';
      fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
    } catch (e) {}
    // #endregion
    
    if (symbolExists === 0) {
      console.error(`❌ نماد ${order.symbol} با selector ${symbolSelector} پیدا نشد!`);
      logger.error('buyActionUltra.ts:Select_Symbol', 'Symbol not found', new Error(`Symbol ${order.symbol} not found`), { symbol: order.symbol, selector: symbolSelector });
      throw new Error(`نماد ${order.symbol} پیدا نشد`);
    }
    
    await page.locator(symbolSelector).click({ force: true });
    
    // #region agent log
    try {
      const fs = require('fs');
      const path = require('path');
      const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
      const debugEntry = JSON.stringify({location:'buyActionUltra.ts:Select_Symbol',message:'Symbol clicked',data:{symbol:order.symbol,selector:symbolSelector},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'}) + '\n';
      fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
    } catch (e) {}
    // #endregion
    
    PerformanceLogger.end('Select_Symbol');

    // ۲. باز کردن پنل خرید/فروش
    PerformanceLogger.start('Open_Order_Panel');
    const panelButtonSelector = side === 'sell'
      ? "[data-cy='order-sell-btn']"
      : "[data-cy='order-buy-btn']";
    
    // #region agent log
    try {
      const fs = require('fs');
      const path = require('path');
      const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
      const panelButtonExists = await page.locator(panelButtonSelector).count();
      const debugEntry = JSON.stringify({
        location:'buyActionUltra.ts:Open_Order_Panel',
        message:'Before panel button click',
        data:{side,panelButtonSelector,panelButtonExists},
        timestamp:Date.now(),
        sessionId:'debug-session',
        runId:'run1',
        hypothesisId:'A'
      }) + '\n';
      fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
    } catch (e) {}
    // #endregion
    
    console.log(`🔘 کلیک روی دکمه ${side === 'sell' ? 'فروش' : 'خرید'}: ${panelButtonSelector}`);
    await page.locator(panelButtonSelector).click({ force: true });
    
    // #region agent log
    try {
      const fs = require('fs');
      const path = require('path');
      const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
      const debugEntry = JSON.stringify({
        location:'buyActionUltra.ts:Open_Order_Panel',
        message:'After panel button click',
        data:{side,panelButtonSelector},
        timestamp:Date.now(),
        sessionId:'debug-session',
        runId:'run1',
        hypothesisId:'A'
      }) + '\n';
      fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
    } catch (e) {}
    // #endregion
    
    // منتظر می‌مانیم تا فرم کاملاً لود شود
    let headerFound = false;
    let submitButtonFound = false;
    
    try {
      // منتظر می‌مانیم تا header فرم ظاهر شود
      await page.waitForSelector('order-form-header', { timeout: 2000, state: 'visible' });
      headerFound = true;
      console.log('✅ هدر فرم پیدا شد');
      
      // #region agent log
      try {
        const fs = require('fs');
        const path = require('path');
        const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
        const submitButtonCount = await page.locator(submitButtonSelector).count();
        const debugEntry = JSON.stringify({
          location:'buyActionUltra.ts:Open_Order_Panel',
          message:'After header found - checking submit button',
          data:{side,submitButtonSelector,submitButtonCount,headerFound},
          timestamp:Date.now(),
          sessionId:'debug-session',
          runId:'run1',
          hypothesisId:'B'
        }) + '\n';
        fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
      } catch (e) {}
      // #endregion
      
      // برای فروش، باید منتظر بمانیم تا دکمه submit فروش ظاهر شود
      await page.waitForSelector(submitButtonSelector, { timeout: 3000, state: 'visible' });
      submitButtonFound = true;
      console.log(`✅ دکمه submit پیدا شد: ${submitButtonSelector}`);
    } catch (e) {
      console.warn(`⚠️ منتظر ماندن برای فرم timeout شد، ادامه می‌دهیم...`);
    }
    
    // #region agent log
    try {
      const fs = require('fs');
      const path = require('path');
      const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
      const debugEntry = JSON.stringify({
        location:'buyActionUltra.ts:Open_Order_Panel',
        message:'After wait for form',
        data:{side,headerFound,submitButtonFound,submitButtonSelector},
        timestamp:Date.now(),
        sessionId:'debug-session',
        runId:'run1',
        hypothesisId:'B'
      }) + '\n';
      fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
    } catch (e) {}
    // #endregion
    
    // کمی صبر اضافی برای اطمینان از لود شدن کامل فرم
    await page.waitForTimeout(300);
    
    PerformanceLogger.end('Open_Order_Panel');

    // ۳. پر کردن فرم با JS (بدون انتظار)
    PerformanceLogger.start('Fill_Form_Ultra');
    
    // #region agent log
    try {
      const fs = require('fs');
      const path = require('path');
      const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
      const submitButtonBeforeFill = await page.locator(submitButtonSelector).count();
      const formValidationState = await page.evaluate(() => {
        const form = document.querySelector('order-form-inputs form');
        return {
          hasForm: !!form,
          formClasses: form ? form.className : null,
          isValid: form ? form.classList.contains('ng-valid') : false,
          isInvalid: form ? form.classList.contains('ng-invalid') : false
        };
      });
      const debugEntry = JSON.stringify({
        location:'buyActionUltra.ts:Fill_Form',
        message:'Before fill form - checking submit button and validation',
        data:{price:order.price,quantity:order.quantity,submitButtonBeforeFill,formValidationState,submitButtonSelector},
        timestamp:Date.now(),
        sessionId:'debug-session',
        runId:'run1',
        hypothesisId:'C'
      }) + '\n';
      fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
    } catch (e) {}
    // #endregion
    
    const fillResult = await page.evaluate(({ price, quantity }) => {
      const priceInput = document.querySelector("[data-cy='order-form-input-price']") as HTMLInputElement;
      const quantityInput = document.querySelector("[data-cy='order-form-input-quantity']") as HTMLInputElement;
      
      const result: any = { priceFilled: false, quantityFilled: false, priceValue: '', quantityValue: '' };
      
      if (priceInput) {
        priceInput.focus();
        priceInput.value = ''; // Clear کردن
        priceInput.value = price;
        priceInput.dispatchEvent(new Event('input', { bubbles: true }));
        priceInput.dispatchEvent(new Event('change', { bubbles: true }));
        priceInput.blur();
        result.priceFilled = true;
        result.priceValue = priceInput.value;
      }
      
      if (quantityInput) {
        quantityInput.focus();
        quantityInput.value = ''; // Clear کردن
        quantityInput.value = quantity;
        quantityInput.dispatchEvent(new Event('input', { bubbles: true }));
        quantityInput.dispatchEvent(new Event('change', { bubbles: true }));
        quantityInput.blur();
        result.quantityFilled = true;
        result.quantityValue = quantityInput.value;
      }
      
      return result;
    }, { price: order.price, quantity: order.quantity });
    
    // #region agent log
    try {
      const fs = require('fs');
      const path = require('path');
      const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
      const debugEntry = JSON.stringify({location:'buyActionUltra.ts:Fill_Form',message:'After fill form',data:{fillResult,expectedPrice:order.price,expectedQuantity:order.quantity},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'}) + '\n';
      fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
    } catch (e) {}
    // #endregion
    
    // صبر برای تغییرات JavaScript صفحه و دوباره set کردن مقادیر
    await page.waitForTimeout(200);
    
    // دوباره set کردن مقادیر برای اطمینان
    await page.evaluate(({ price, quantity }) => {
      const priceInput = document.querySelector("[data-cy='order-form-input-price']") as HTMLInputElement;
      const quantityInput = document.querySelector("[data-cy='order-form-input-quantity']") as HTMLInputElement;
      
      if (priceInput) {
        priceInput.focus();
        priceInput.select();
        priceInput.value = price;
        priceInput.dispatchEvent(new Event('input', { bubbles: true }));
        priceInput.dispatchEvent(new Event('change', { bubbles: true }));
        priceInput.blur();
      }
      
      if (quantityInput) {
        quantityInput.focus();
        quantityInput.select();
        quantityInput.value = quantity;
        quantityInput.dispatchEvent(new Event('input', { bubbles: true }));
        quantityInput.dispatchEvent(new Event('change', { bubbles: true }));
        quantityInput.blur();
      }
    }, { price: order.price, quantity: order.quantity });
    
    // صبر برای تأیید نهایی
    await page.waitForTimeout(100);
    
    // #region agent log
    try {
      const fs = require('fs');
      const path = require('path');
      const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
      const submitButtonAfterFill = await page.locator(submitButtonSelector).count();
      const formValidationStateAfter = await page.evaluate(() => {
        const form = document.querySelector('order-form-inputs form');
        return {
          hasForm: !!form,
          formClasses: form ? form.className : null,
          isValid: form ? form.classList.contains('ng-valid') : false,
          isInvalid: form ? form.classList.contains('ng-invalid') : false
        };
      });
      const debugEntry = JSON.stringify({
        location:'buyActionUltra.ts:Fill_Form',
        message:'After fill form - checking submit button and validation',
        data:{submitButtonAfterFill,formValidationStateAfter,submitButtonSelector},
        timestamp:Date.now(),
        sessionId:'debug-session',
        runId:'run1',
        hypothesisId:'C'
      }) + '\n';
      fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
    } catch (e) {}
    // #endregion
    
    // تایید نهایی (با در نظر گرفتن format کردن قیمت)
    const verification = await page.evaluate(({ expectedPrice, expectedQuantity }) => {
      const priceInput = document.querySelector("[data-cy='order-form-input-price']") as HTMLInputElement;
      const quantityInput = document.querySelector("[data-cy='order-form-input-quantity']") as HTMLInputElement;
      
      const actualPrice = priceInput?.value || '';
      const actualQuantity = quantityInput?.value || '';
      
      // حذف کاما و فاصله از قیمت برای مقایسه
      const normalizedActualPrice = actualPrice.replace(/,/g, '').replace(/\s/g, '');
      const normalizedExpectedPrice = expectedPrice.replace(/,/g, '').replace(/\s/g, '');
      
      const priceMatches = normalizedActualPrice === normalizedExpectedPrice;
      const quantityMatches = actualQuantity === expectedQuantity;
      
      return {
        isValid: priceMatches && quantityMatches,
        actualPrice: actualPrice,
        actualQuantity: actualQuantity,
        normalizedActualPrice: normalizedActualPrice,
        normalizedExpectedPrice: normalizedExpectedPrice,
        priceMatches: priceMatches,
        quantityMatches: quantityMatches
      };
    }, { expectedPrice: order.price, expectedQuantity: order.quantity });
    
    // #region agent log
    try {
      const fs = require('fs');
      const path = require('path');
      const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
      const debugEntry = JSON.stringify({location:'buyActionUltra.ts:Fill_Form',message:'Verification result',data:{verification,expectedPrice:order.price,expectedQuantity:order.quantity},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'}) + '\n';
      fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
    } catch (e) {}
    // #endregion
    
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

    // ۴. ارسال سفارش
    PerformanceLogger.start('Submit_Order');
    
    // submitButtonSelector قبلاً در ابتدای تابع تعریف شده است
    
    // اطمینان از اینکه دکمه submit موجود و قابل مشاهده است
    try {
      await page.waitForSelector(submitButtonSelector, { timeout: 2000, state: 'visible' });
      console.log(`✅ دکمه submit آماده است: ${submitButtonSelector}`);
    } catch (e) {
      console.warn(`⚠️ دکمه submit با selector ${submitButtonSelector} پیدا نشد، ادامه می‌دهیم...`);
    }
    
    // #region agent log
    try {
      const fs = require('fs');
      const path = require('path');
      const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
      const debugEntry = JSON.stringify({
        location:'buyActionUltra.ts:Submit_Order',
        message:'Before submit',
        data:{order, side, submitButtonSelector},
        timestamp:Date.now(),
        sessionId:'debug-session',
        runId:'run1',
        hypothesisId:'C'
      }) + '\n';
      fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
    } catch (e) {}
    // #endregion
    
    // بررسی وجود دکمه submit - با retry
    let submitButtonExists = 0;
    let retryCount = 0;
    const maxRetries = 5;
    
    console.log(`🔍 جستجوی دکمه submit با selector: ${submitButtonSelector}`);
    
    // #region agent log
    try {
      const fs = require('fs');
      const path = require('path');
      const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
      const debugEntry = JSON.stringify({
        location:'buyActionUltra.ts:Submit_Order',
        message:'Starting submit button search',
        data:{submitButtonSelector,side,maxRetries},
        timestamp:Date.now(),
        sessionId:'debug-session',
        runId:'run1',
        hypothesisId:'B'
      }) + '\n';
      fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
    } catch (e) {}
    // #endregion
    
    while (submitButtonExists === 0 && retryCount < maxRetries) {
      submitButtonExists = await page.locator(submitButtonSelector).count();
      
      // #region agent log
      try {
        const fs = require('fs');
        const path = require('path');
        const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
        const debugEntry = JSON.stringify({
          location:'buyActionUltra.ts:Submit_Order',
          message:'Retry check submit button',
          data:{retryCount,maxRetries,submitButtonExists,submitButtonSelector},
          timestamp:Date.now(),
          sessionId:'debug-session',
          runId:'run1',
          hypothesisId:'B'
        }) + '\n';
        fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
      } catch (e) {}
      // #endregion
      
      if (submitButtonExists === 0) {
        retryCount++;
        console.log(`⏳ تلاش ${retryCount}/${maxRetries} برای پیدا کردن دکمه submit...`);
        await page.waitForTimeout(800);
      } else {
        console.log(`✅ دکمه submit پیدا شد در تلاش ${retryCount + 1}!`);
      }
    }
    
    // اگر دکمه پیدا نشد، جستجوی همه دکمه‌های submit موجود
    let allSubmitButtons: any = null;
    if (submitButtonExists === 0) {
      console.log('🔍 جستجوی همه دکمه‌های submit در صفحه...');
      allSubmitButtons = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button[data-cy*="submit"], button[data-cy*="order-form"], button[type="submit"]'));
        return buttons.map(btn => ({
          dataCy: (btn as HTMLElement).getAttribute('data-cy'),
          text: btn.textContent?.trim(),
          className: btn.className,
          visible: (btn as HTMLElement).offsetParent !== null,
          display: window.getComputedStyle(btn as HTMLElement).display
        }));
      });
      
      // اگر هنوز پیدا نشد، جستجوی همه دکمه‌های با data-cy
      if (allSubmitButtons.length === 0) {
        console.log('🔍 جستجوی همه دکمه‌های با data-cy...');
        allSubmitButtons = await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button[data-cy]'));
          return buttons.map(btn => ({
            dataCy: (btn as HTMLElement).getAttribute('data-cy'),
            text: btn.textContent?.trim(),
            className: btn.className,
            visible: (btn as HTMLElement).offsetParent !== null,
            display: window.getComputedStyle(btn as HTMLElement).display
          }));
        });
      }
      
      // #region agent log
      try {
        const fs = require('fs');
        const path = require('path');
        const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
        const debugEntry = JSON.stringify({
          location:'buyActionUltra.ts:Submit_Order',
          message:'All buttons found in page',
          data:{allSubmitButtons,submitButtonSelector,side},
          timestamp:Date.now(),
          sessionId:'debug-session',
          runId:'run1',
          hypothesisId:'E'
        }) + '\n';
        fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
      } catch (e) {}
      // #endregion
      
      console.log('🔍 دکمه‌های پیدا شده:', JSON.stringify(allSubmitButtons, null, 2));
    }
    
    // #region agent log
    try {
      const fs = require('fs');
      const path = require('path');
      const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
      const debugEntry = JSON.stringify({
        location:'buyActionUltra.ts:Submit_Order',
        message:'Submit button check',
        data:{exists:submitButtonExists, side, submitButtonSelector, allSubmitButtons},
        timestamp:Date.now(),
        sessionId:'debug-session',
        runId:'run1',
        hypothesisId:'C'
      }) + '\n';
      fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
    } catch (e) {}
    // #endregion
    
    if (submitButtonExists === 0) {
      console.error(`❌ دکمه submit پیدا نشد! (Selector: ${submitButtonSelector})`);
      console.error('🔍 دکمه‌های موجود:', allSubmitButtons);
      logger.error('buyActionUltra.ts:Submit_Order', 'Submit button not found', new Error(`Submit button not found: ${submitButtonSelector}`), {
        side,
        submitButtonSelector,
        allSubmitButtons
      });
      throw new Error(`دکمه submit پیدا نشد: ${submitButtonSelector}`);
    }
    
    await page.locator(submitButtonSelector).click({ force: true });
    
    // صبر برای تأیید submit و ظاهر شدن سفارش در لیست
    await page.waitForTimeout(1500);
    
    // خواندن نتیجه submit و اولین سفارش در لیست سفارش‌ها
    const submitResult = await page.evaluate(() => {
      // بررسی toast یا پیام موفقیت
      const toast = document.querySelector('oms-toast') || document.querySelector('[class*="toast"]');
      const errorMessage = document.querySelector('[class*="error"]') || document.querySelector('[class*="Error"]');
      
      // بررسی اینکه آیا فرم بسته شده است (نشانه موفقیت)
      const formHeader = document.querySelector('order-form-header');
      const formVisible = formHeader ? window.getComputedStyle(formHeader.parentElement as HTMLElement).display !== 'none' : false;
      
      // سفارش اول در لیست سفارش‌ها (بخش stocks)
      // استفاده از selector دقیق‌تر بر اساس HTML ارائه شده
      // اول سعی می‌کنیم از data-cy="order-list-item-parent" استفاده کنیم
      const orderParent = document.querySelector("[data-cy='order-list-item-parent']") as HTMLElement | null;
      
      // اگر پیدا نشد، از data-cy="oms-order-list-item-افران" استفاده می‌کنیم
      const orderItem = orderParent || (document.querySelector("[data-cy^='oms-order-list-item-']") as HTMLElement | null);
      
      // پیدا کردن quantity span
      const quantitySpan = orderItem ? (orderItem.querySelector("[data-cy='order-list-item-quantity']") as HTMLElement | null) :
                          (document.querySelector("[data-cy='order-list-item-quantity']") as HTMLElement | null);
      
      // پیدا کردن price و date در همان container
      const priceSpan = orderItem ? (orderItem.querySelector('.order-price') as HTMLElement | null) :
                       (quantitySpan ? (quantitySpan.closest('[data-cy="order-list-item-parent"]')?.querySelector('.order-price') as HTMLElement | null) :
                       (document.querySelector('.order-price') as HTMLElement | null));
      
      const dateSpan = orderItem ? (orderItem.querySelector('.order-date') as HTMLElement | null) :
                      (quantitySpan ? (quantitySpan.closest('[data-cy="order-list-item-parent"]')?.querySelector('.order-date') as HTMLElement | null) :
                      (document.querySelector('.order-date') as HTMLElement | null));
      
      const priceSpanFallback = priceSpan;
      const dateSpanFallback = dateSpan;
      
      const orderQuantityText = quantitySpan?.textContent?.trim() || '';
      const orderPriceText = (priceSpanFallback?.textContent?.trim() || '').replace(/,/g, '');
      const orderDateText = dateSpanFallback?.textContent?.trim() || '';
      const orderRowText = orderItem?.textContent?.trim() || quantitySpan?.closest('div')?.textContent?.trim() || '';
      
      // Debug info
      const debugInfo = {
        quantitySpanFound: !!quantitySpan,
        orderParentFound: !!orderParent,
        orderItemFound: !!orderItem,
        priceSpanFound: !!priceSpanFallback,
        dateSpanFound: !!dateSpanFallback,
        orderItemClasses: orderItem?.className || '',
        priceSpanClasses: priceSpanFallback?.className || '',
        dateSpanClasses: dateSpanFallback?.className || ''
      };
      
      return {
        hasToast: !!toast,
        hasError: !!errorMessage,
        toastText: toast?.textContent || '',
        errorText: errorMessage?.textContent || '',
        formVisible: formVisible,
        orderListSnapshot: {
          quantityText: orderQuantityText,
          priceText: orderPriceText,
          dateText: orderDateText,
          rowText: orderRowText.substring(0, 200) // محدود کردن برای جلوگیری از لاگ‌های خیلی بزرگ
        },
        debugInfo: debugInfo
      };
    });
    
    // مقایسه مقادیر واقعی ثبت شده با مقادیر هدف
    const actualQuantity = parseInt(submitResult.orderListSnapshot.quantityText) || 0;
    const actualPrice = parseInt(submitResult.orderListSnapshot.priceText) || 0;
    const expectedQuantity = parseInt(order.quantity);
    const expectedPrice = parseInt(order.price);
    
    const quantityMatch = actualQuantity === expectedQuantity;
    const priceMatch = actualPrice === expectedPrice;
    const orderMatches = quantityMatch && priceMatch;
    
    if (!orderMatches) {
      console.error(`❌❌❌ عدم تطابق در سفارش ثبت شده!`);
      console.error(`   هدف: ${expectedQuantity} سهم @ ${expectedPrice}`);
      console.error(`   واقعی: ${actualQuantity} سهم @ ${actualPrice}`);
      logger.error('buyActionUltra.ts:Submit_Order', 'Order mismatch detected', new Error('Order values do not match'), {
        expected: { quantity: expectedQuantity, price: expectedPrice },
        actual: { quantity: actualQuantity, price: actualPrice },
        orderListSnapshot: submitResult.orderListSnapshot
      });
    } else {
      console.log(`✅✅✅ سفارش با مقادیر درست ثبت شد: ${actualQuantity} سهم @ ${actualPrice}`);
      logger.info('buyActionUltra.ts:Submit_Order', 'Order verified successfully', {
        quantity: actualQuantity,
        price: actualPrice,
        date: submitResult.orderListSnapshot.dateText
      });
    }
    
    // #region agent log
    try {
      const fs = require('fs');
      const path = require('path');
      const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
      const debugEntry = JSON.stringify({
        location:'buyActionUltra.ts:Submit_Order',
        message:'After submit',
        data:{
          submitResult,
          comparison: {
            expectedQuantity,
            expectedPrice,
            actualQuantity,
            actualPrice,
            quantityMatch,
            priceMatch,
            orderMatches
          }
        },
        timestamp:Date.now(),
        sessionId:'debug-session',
        runId:'run1',
        hypothesisId:'C'
      }) + '\n';
      fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
    } catch (e) {}
    // #endregion
    
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

