import { Page } from 'playwright';
import { PerformanceLogger } from './logger';
import { BuyOrder } from './buyAction';

export async function executeKeyboardBuy(page: Page, order: BuyOrder) {
  console.log('\n--- شروع فرآیند خرید کیبورد-محور (مدل ۲) ---');
  PerformanceLogger.start('Total_Execution_M2');

  // ۱. انتخاب نماد (ماوس لازم است چون ردیف‌ها دکمه کیبوردی مستقیم ندارند)
  PerformanceLogger.start('Select_Symbol_M2');
  await page.locator('.ag-row').filter({ hasText: order.symbol }).first().click();
  PerformanceLogger.end('Select_Symbol_M2');

  // ۲. باز کردن پنل با کلید میان‌بر (اگر ایزی تریدر داشته باشد، در غیر این صورت کلیک)
  PerformanceLogger.start('Open_Order_Panel_M2');
  await page.locator("[data-cy='order-buy-btn']").click();
  PerformanceLogger.end('Open_Order_Panel_M2');

  // ۳. پر کردن فرم با استفاده از کیبورد (Tab و تایپ)
  PerformanceLogger.start('Fill_Form_M2');
  // فوکوس روی فیلد قیمت (اولین فیلد معمولا)
  await page.locator("[data-cy='order-form-input-price']").focus();
  await page.keyboard.press('Control+A');
  await page.keyboard.type(order.price);
  await page.keyboard.press('Tab');
  // حالا روی فیلد حجم هستیم
  await page.keyboard.press('Control+A');
  await page.keyboard.type(order.quantity);
  PerformanceLogger.end('Fill_Form_M2');

  // ۴. ارسال با Enter
  PerformanceLogger.start('Submit_Order_M2');
  await page.keyboard.press('Enter');
  PerformanceLogger.end('Submit_Order_M2');

  const totalTime = PerformanceLogger.end('Total_Execution_M2');
  return totalTime;
}

