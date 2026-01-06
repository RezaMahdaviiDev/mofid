import { Page } from 'playwright';
import { PerformanceLogger } from './logger';
import { BuyOrder } from './buyAction';

export async function executeUltraBuy(page: Page, order: BuyOrder) {
  console.log('\n--- شروع فرآیند فرا-سریع (مدل ۴) ---');
  PerformanceLogger.start('Total_Execution_M4');

  // ترکیبی از JS Inject و ارسال مستقیم بدون انتظار برای استقرار المان
  PerformanceLogger.start('Action_Chain_M4');
  
  const responsePromise = page.waitForResponse(response => 
    response.url().includes('/order') && response.request().method() === 'POST',
    { timeout: 10000 }
  ).catch(() => null);

  // اجرای زنجیره‌ای دستورات بدون وقفه با سلکتور اختصاصی
  await Promise.all([
    page.locator("[data-cy='symbol-name-renderer-IRTKZARF0001']").click({ force: true }),
    page.locator("[data-cy='order-buy-btn']").click({ force: true }),
    page.evaluate((data) => {
        // این بخش را داخل یک اینتروال کوتاه می‌گذاریم تا به محض لود شدن پنل خرید اجرا شود
        const interval = setInterval(() => {
            const header = document.querySelector('order-form-header');
            const headerText = header?.textContent || '';
            
            // تایید: فقط اگر پنل برای نماد درست است، ادامه بده
            if (!headerText.includes(data.symbol)) {
                return; // منتظر بمان تا پنل برای نماد درست باز شود
            }
            
            const priceInput = document.querySelector("[data-cy='order-form-input-price']") as HTMLInputElement;
            const qtyInput = document.querySelector("[data-cy='order-form-input-quantity']") as HTMLInputElement;
            const submitBtn = document.querySelector("[data-cy='oms-order-form-submit-button-buy']") as HTMLButtonElement;

            if (priceInput && qtyInput && submitBtn) {
                priceInput.value = data.price;
                qtyInput.value = data.quantity;
                priceInput.dispatchEvent(new Event('input', { bubbles: true }));
                qtyInput.dispatchEvent(new Event('input', { bubbles: true }));
                submitBtn.click();
                clearInterval(interval);
            }
        }, 10); // چک کردن هر ۱۰ میلی ثانیه
        
        // تایم اوت برای جلوگیری از لوپ بی‌پایان
        setTimeout(() => clearInterval(interval), 5000);
    }, order)
  ]);

  const response = await responsePromise;
  if (response) {
    console.log(`🌐 [M4] وضعیت پاسخ سرور: ${response.status()}`);
    const body = await response.json().catch(() => ({}));
    console.log('📄 [M4] محتوای پاسخ:', JSON.stringify(body));
  }

  await page.screenshot({ path: `logs/screenshot_model_4_${Date.now()}.png` });
  PerformanceLogger.end('Action_Chain_M4');

  const totalTime = PerformanceLogger.end('Total_Execution_M4');
  return totalTime;
}

