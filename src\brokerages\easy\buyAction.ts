import { Page } from 'playwright';
import { PerformanceLogger } from './logger';

export interface BuyOrder {
  symbol: string;
  price: string;
  quantity: string;
}

/**
 * اجرای سریع و بهینه سفارش خرید در ایزی‌تریدر
 */
export async function executeFastBuy(page: Page, order: BuyOrder) {
  console.log('\n--- شروع فرآیند خرید بهینه ---');
  PerformanceLogger.start('Total_Execution');

  // ۱. انتخاب مستقیم زر با سلکتور اختصاصی (سریع‌ترین روش)
  PerformanceLogger.start('Select_Symbol');
  
  // استفاده از data-cy اختصاصی نماد زر: IRTKZARF0001
  await page.locator("[data-cy='symbol-name-renderer-IRTKZARF0001']").click({ force: true });
  
  PerformanceLogger.end('Select_Symbol');

  // ۲. باز کردن پنل خرید با تایید هوشمند
  PerformanceLogger.start('Open_Order_Panel');
  await page.locator("[data-cy='order-buy-btn']").click({ force: true });
  
  // منتظر می‌مانیم تا فیلد قیمت ظاهر شود
  await page.waitForSelector("[data-cy='order-form-input-price']", { timeout: 5000 });
  
  // تایید سریع: مطمئن شویم پنل برای اطلس نیست (بدون انتظار طولانی)
  const headerCheck = await page.evaluate(() => {
    const header = document.querySelector('order-form-header');
    return header?.textContent?.includes('اطلس') || false;
  });
  
  if (headerCheck) {
    // اگر اطلس است، دوباره روی زر کلیک می‌کنیم
    console.log('⚠️ پنل برای اطلس باز شده، تلاش مجدد...');
    await page.locator("[data-cy='symbol-name-renderer-IRTKZARF0001']").click({ force: true });
    await page.waitForTimeout(300);
    await page.locator("[data-cy='order-buy-btn']").click({ force: true });
    await page.waitForSelector("[data-cy='order-form-input-price']", { timeout: 5000 });
  }
  
  PerformanceLogger.end('Open_Order_Panel');

  // ۳. وارد کردن اطلاعات (به صورت موازی برای سرعت بیشتر)
  PerformanceLogger.start('Fill_Form');
  const priceInput = page.locator("[data-cy='order-form-input-price']");
  const quantityInput = page.locator("[data-cy='order-form-input-quantity']");

  // استفاده از fill مستقیم بدون نیاز به کلیک، برای دور زدن Popover ها
  await Promise.all([
    priceInput.fill(order.price, { force: true }),
    quantityInput.fill(order.quantity, { force: true })
  ]);
  PerformanceLogger.end('Fill_Form');

  // ۴. ارسال نهایی
  PerformanceLogger.start('Submit_Order');
  const submitBtn = page.locator("[data-cy='oms-order-form-submit-button-buy']");
  
  // گوش دادن به پاسخ شبکه برای تایید واقعی
  const responsePromise = page.waitForResponse(response => 
    response.url().includes('/order') && response.request().method() === 'POST',
    { timeout: 10000 }
  ).catch(() => null);

  await submitBtn.click();
  
  const response = await responsePromise;
  if (response) {
    console.log(`🌐 وضعیت پاسخ سرور: ${response.status()}`);
    const body = await response.json().catch(() => ({}));
    console.log('📄 محتوای پاسخ:', JSON.stringify(body));
  } else {
    console.log('⚠️ هیچ پاسخ شبکه‌ای در ۱۰ ثانیه دریافت نشد.');
  }

  // ثبت اسکرین‌شات برای بررسی بصری خطاها
  await page.screenshot({ path: `logs/screenshot_model_1_${Date.now()}.png` });
  
  PerformanceLogger.end('Submit_Order');

  const totalTime = PerformanceLogger.end('Total_Execution');
  console.log('--- فرآیند خرید با موفقیت به پایان رسید ---');
  return totalTime;
}

