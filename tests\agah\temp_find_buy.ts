/**
 * اسکریپت تست شناسایی دکمه خرید (موقت)
 * این فایل بررسی می‌کند که آیا می‌توانیم دکمه خرید را پیدا کنیم
 * و آن را هایلایت کنیم (بدون کلیک)
 */

import { BrowserManager } from '../src/core/browser';

async function testFindBuyButton() {
  const browserManager = new BrowserManager();

  try {
    console.log('========================================');
    console.log('🔎 اسکریپت تست شناسایی دکمه خرید');
    console.log('========================================\n');

    const page = await browserManager.launch(false);

    console.log('📍 در حال رفتن به صفحه دارایی‌ها...');
    await page.goto('https://online.agah.com/auth/portfolio/asset', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    console.log('⏳ صبر برای بارگذاری جدول دارایی‌ها...');
    await page.waitForSelector('tse-asset-list', { timeout: 15000 });
    console.log('✅ جدول دارایی‌ها بارگذاری شد.');

    // صبر کمی بیشتر برای اطمینان از بارگذاری کامل
    await page.waitForTimeout(2000);

    console.log('\n🔎 در حال جستجوی دکمه خرید...');
    
    // تلاش برای پیدا کردن دکمه با روش‌های مختلف
    let buyButton = null;

    // روش 1: جستجوی با CSS Selector (دکمه‌های سبز رنگ)
    try {
      console.log('   تلاش 1: جستجو با CSS Selector (button.green-c)...');
      buyButton = await page.locator('button.green-c').first();
      const count = await page.locator('button.green-c').count();
      console.log(`   ✅ ${count} دکمه خرید سبز رنگ یافت شد.`);
    } catch (error) {
      console.log('   ❌ دکمه با CSS Selector پیدا نشد.');
    }

    // روش 2: جستجو با aria-label
    if (!buyButton) {
      try {
        console.log('   تلاش 2: جستجو با ARIA Label...');
        buyButton = await page.getByRole('button', { name: /خرید/ }).first();
        console.log('   ✅ دکمه خرید با ARIA Label پیدا شد.');
      } catch (error) {
        console.log('   ❌ دکمه با ARIA Label پیدا نشد.');
      }
    }

    if (buyButton) {
      console.log('\n✅ دکمه خرید پیدا شد!');
      console.log('🎨 در حال هایلایت کردن دکمه...');
      
      // هایلایت کردن دکمه با یک border قرمز
      await buyButton.evaluate((element: any) => {
        element.style.border = '3px solid red';
        element.style.boxShadow = '0 0 10px red';
      });

      console.log('✅ دکمه هایلایت شد (با border قرمز).');
      console.log('\n⏳ 5 ثانیه صبر می‌کنیم تا دکمه را ببینید...');
      await page.waitForTimeout(5000);

      console.log('\n🎉 تست شناسایی دکمه موفقیت‌آمیز بود!');
    } else {
      console.error('\n❌ دکمه خرید پیدا نشد!');
      console.log('   لطفاً مطمئن شوید که در صفحه دارایی‌ها هستید.');
    }

  } catch (error: any) {
    console.error('\n❌ خطا در تست شناسایی:', error.message);
  } finally {
    await browserManager.close();
  }
}

// اجرای تست
testFindBuyButton();

