/**
 * تست هوشمند ایزی‌تریدر با استفاده از data-cy (بر اساس فایل 6)
 */

import { BrowserManager } from '../../src/core/browser';

async function easySmartTest() {
  const browserManager = new BrowserManager('easy');

  try {
    console.log('========================================');
    console.log('🚀 تست هوشمند ایزی‌تریدر (Selector Data-CY)');
    console.log('========================================\n');

    const page = await browserManager.launch(false);

    console.log('📍 در حال رفتن به ایزی‌تریدر...');
    await page.goto('https://d.easytrader.ir/', { waitUntil: 'load', timeout: 60000 });

    // صبر برای لود اولیه
    await page.waitForTimeout(10000);

    // ۱. بررسی وضعیت لاگین
    const url = page.url();
    if (url.includes('login') || url.includes('account.emofid.com')) {
      console.error('❌ خطا: شما لاگین نیستید! لطفاً ابتدا npm run test:easy:login:auto را اجرا کنید.');
      return;
    }
    console.log('✅ وضعیت لاگین تایید شد.');

    // ۲. پیدا کردن نماد عیار در لیست (اگر وجود دارد)
    console.log('🔍 در حال جستجوی ردیف "عیار"...');
    const ayarRow = page.locator('.ag-row').filter({ hasText: 'عیار' }).first();
    
    if (await ayarRow.count() > 0) {
      console.log('✅ ردیف عیار پیدا شد. کلیک برای فعال‌سازی...');
      await ayarRow.click();
      await page.waitForTimeout(2000);
    } else {
      console.log('⚠️ ردیف عیار در لیست فعلی پیدا نشد. لطفاً آن را به دیده‌بان اضافه کنید.');
    }

    // ۳. کلیک روی دکمه خرید (با استفاده از data-cy)
    console.log('🖱️ تلاش برای کلیک روی دکمه خرید اصلی [data-cy="order-buy-btn"]...');
    const buyBtn = page.locator("[data-cy='order-buy-btn']");
    
    if (await buyBtn.count() > 0) {
      await buyBtn.highlight();
      await buyBtn.click();
      console.log('✅ دکمه خرید کلیک شد.');
      await page.waitForTimeout(2000);

      // ۴. بررسی فیلد حجم
      console.log('🔎 بررسی فیلد حجم [data-cy="order-form-input-quantity"]...');
      const quantityInput = page.locator("[data-cy='order-form-input-quantity']");
      if (await quantityInput.count() > 0) {
        console.log('✅ فیلد حجم پیدا شد.');
        await quantityInput.highlight();
        const val = await quantityInput.inputValue();
        console.log(`   مقدار فعلی حجم: ${val}`);
      }

      // ۵. بررسی دکمه ارسال نهایی
      const submitBtn = page.locator("[data-cy='oms-order-form-submit-button-buy']");
      console.log(`🔎 دکمه ارسال نهایی: ${await submitBtn.count() > 0 ? '✅ یافت شد' : '❌ یافت نشد'}`);

    } else {
      console.log('❌ دکمه خرید [data-cy="order-buy-btn"] پیدا نشد.');
    }

    console.log('\n⏳ ۱۰ ثانیه صبر برای مشاهده...');
    await page.waitForTimeout(10000);

  } catch (error: any) {
    console.error('\n❌ خطا:', error.message);
  } finally {
    await browserManager.close();
  }
}

easySmartTest();

