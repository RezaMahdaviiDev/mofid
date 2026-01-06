/**
 * اسکریپت عملیاتی: خرید ۱۰ عدد عیار به قیمت ۳۷۹,۰۰۰
 */

import { BrowserManager } from '../../src/core/browser';

async function executeRealBuy() {
  const browserManager = new BrowserManager('easy');

  try {
    console.log('========================================');
    console.log('⚡ در حال اجرای سفارش خرید واقعی');
    console.log('📈 نماد: عیار | تعداد: 10 | قیمت: 379,000');
    console.log('========================================\n');

    const page = await browserManager.launch(false);

    console.log('📍 ورود به ایزی‌تریدر...');
    await page.goto('https://d.easytrader.ir/', { waitUntil: 'load', timeout: 60000 });
    await page.waitForTimeout(10000);

    // ۱. انتخاب نماد عیار
    console.log('🔍 انتخاب ردیف عیار...');
    const ayarRow = page.locator('.ag-row').filter({ hasText: 'عیار' }).first();
    await ayarRow.scrollIntoViewIfNeeded();
    await ayarRow.click();
    await page.waitForTimeout(2000);

    // ۲. باز کردن پنل خرید
    console.log('🖱️ باز کردن پنل خرید...');
    await page.locator("[data-cy='order-buy-btn']").click();
    await page.waitForTimeout(2000);

    // ۳. وارد کردن قیمت (۳۷۹,۰۰۰)
    console.log('⌨️ وارد کردن قیمت: 379,000');
    const priceInput = page.locator("[data-cy='order-form-input-price']"); // بر اساس الگوی data-cy
    if (await priceInput.count() === 0) {
        // اگر data-cy مستقیم کار نکرد، اولین اینپوت معمولا قیمت است
        await page.locator('input').first().fill('379000');
    } else {
        await priceInput.click({ clickCount: 3 });
        await priceInput.fill('379000');
    }

    // ۴. وارد کردن حجم (۱۰)
    console.log('⌨️ وارد کردن حجم: 10');
    const quantityInput = page.locator("[data-cy='order-form-input-quantity']");
    await quantityInput.click({ clickCount: 3 });
    await quantityInput.fill('10');

    await page.waitForTimeout(1000);

    // ۵. کلیک نهایی روی ارسال خرید
    console.log('🚀 ارسال نهایی سفارش...');
    const submitBtn = page.locator("[data-cy='oms-order-form-submit-button-buy']");
    
    // در این مرحله سفارش ارسال می‌شود
    await submitBtn.click();
    
    console.log('\n✅ سفارش ارسال شد!');
    console.log('⏳ ۱۰ ثانیه صبر برای مشاهده پیام سیستم...');
    await page.waitForTimeout(10000);

  } catch (error: any) {
    console.error('\n❌ خطا در اجرای سفارش:', error.message);
  } finally {
    await browserManager.close();
  }
}

executeRealBuy();

