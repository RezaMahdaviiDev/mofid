import { Page } from 'playwright';
import { PerformanceLogger } from './logger';
import { BuyOrder } from './buyAction';

export async function executeJSInjectBuy(page: Page, order: BuyOrder) {
  console.log('\n--- شروع فرآیند تزریق JS (مدل ۳) ---');
  PerformanceLogger.start('Total_Execution_M3');

  // ۱. انتخاب مستقیم زر با سلکتور اختصاصی
  PerformanceLogger.start('Select_Symbol_M3');
  
  await page.locator("[data-cy='symbol-name-renderer-IRTKZARF0001']").click({ force: true });
  PerformanceLogger.end('Select_Symbol_M3');

  // ۲. باز کردن پنل با تایید هوشمند
  PerformanceLogger.start('Open_Order_Panel_M3');
  await page.locator("[data-cy='order-buy-btn']").click({ force: true });
  await page.waitForSelector("[data-cy='order-form-input-price']", { timeout: 5000 });
  
  // تایید سریع: مطمئن شویم پنل برای اطلس نیست
  const headerCheck = await page.evaluate(() => {
    const header = document.querySelector('order-form-header');
    return header?.textContent?.includes('اطلس') || false;
  });
  
  if (headerCheck) {
    console.log('⚠️ [M3] پنل برای اطلس باز شده، تلاش مجدد...');
    await page.locator("[data-cy='symbol-name-renderer-IRTKZARF0001']").click({ force: true });
    await page.waitForTimeout(300);
    await page.locator("[data-cy='order-buy-btn']").click({ force: true });
    await page.waitForSelector("[data-cy='order-form-input-price']", { timeout: 5000 });
  }
  
  PerformanceLogger.end('Open_Order_Panel_M3');

  // ۳. تزریق مستقیم مقادیر با JS (سریع‌ترین حالت)
  PerformanceLogger.start('Fill_Form_M3');
  await page.evaluate((data) => {
    const priceInput = document.querySelector("[data-cy='order-form-input-price']") as HTMLInputElement;
    const qtyInput = document.querySelector("[data-cy='order-form-input-quantity']") as HTMLInputElement;
    if (priceInput) priceInput.value = data.price;
    if (qtyInput) qtyInput.value = data.quantity;
    
    // شبیه‌سازی رویداد input برای اینکه سیستم متوجه تغییر شود
    priceInput?.dispatchEvent(new Event('input', { bubbles: true }));
    qtyInput?.dispatchEvent(new Event('input', { bubbles: true }));
  }, order);
  PerformanceLogger.end('Fill_Form_M3');

  // ۴. ارسال سفارش
  PerformanceLogger.start('Submit_Order_M3');
  
  const responsePromise = page.waitForResponse(response => 
    response.url().includes('/order') && response.request().method() === 'POST',
    { timeout: 10000 }
  ).catch(() => null);

  await page.locator("[data-cy='oms-order-form-submit-button-buy']").click();
  
  const response = await responsePromise;
  if (response) {
    console.log(`🌐 [M3] وضعیت پاسخ سرور: ${response.status()}`);
    const body = await response.json().catch(() => ({}));
    console.log('📄 [M3] محتوای پاسخ:', JSON.stringify(body));
  }

  await page.screenshot({ path: `logs/screenshot_model_3_${Date.now()}.png` });
  PerformanceLogger.end('Submit_Order_M3');

  const totalTime = PerformanceLogger.end('Total_Execution_M3');
  return totalTime;
}

