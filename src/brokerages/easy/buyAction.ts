import { Page } from 'playwright';
import { PerformanceLogger } from './logger';

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
    await page.locator("[data-cy='order-form-input-price']").fill(order.price, { force: true });
    await page.waitForTimeout(50);
    await page.locator("[data-cy='order-form-input-quantity']").fill(order.quantity, { force: true });
    await page.waitForTimeout(50);
    PerformanceLogger.end('Fill_Form');

    // ۴. ارسال سفارش
    PerformanceLogger.start('Submit_Order');
    await page.locator("[data-cy='oms-order-form-submit-button-buy']").click({ force: true });
    await page.waitForTimeout(100);
    PerformanceLogger.end('Submit_Order');

    const totalTime = PerformanceLogger.end('Total_Execution');
    console.log(`✅✅✅ سفارش با موفقیت ثبت شد! زمان: ${totalTime}ms`);
    return totalTime;

  } catch (error: any) {
    console.error('❌ خطا در فرآیند خرید:', error.message);
    PerformanceLogger.end('Total_Execution');
    throw error;
  }
}

