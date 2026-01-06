/**
 * اسکریپت جستجوی هوشمند و خودکار نماد
 * تلاش برای پیدا کردن "عیار" بدون دخالت کاربر
 */

import { BrowserManager } from '../src/core/browser';

async function omniSearch() {
  const browserManager = new BrowserManager();

  try {
    console.log('========================================');
    console.log('🔍 اسکریپت جستجوی خودکار نماد "عیار"');
    console.log('========================================\n');

    const page = await browserManager.launch(false);

    // --- روش ۱: جستجو در دیده‌بان (MarketWatch) ---
    console.log('📡 روش ۱: جستجو در صفحه دیده‌بان...');
    await page.goto('https://online.agah.com/auth/marketWatch', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);

    const searchBox = page.locator('tse-instrument-toolbar input, .instrument-search input, input[placeholder*="جستجو"]').first();
    
    if (await searchBox.count() > 0) {
      console.log('   ⌨️ تایپ کردن "عیار" در کادر جستجو...');
      await searchBox.click();
      await searchBox.fill('عیار');
      await page.waitForTimeout(3000);

      // تلاش برای پیدا کردن و کلیک روی نتیجه در دراپ‌داون
      console.log('   🖱️ جستجو برای نتیجه در لیست پیشنهادی...');
      const results = page.locator('.p-autocomplete-panel li, .search-result-item, .ag-row').filter({ hasText: 'عیار' });
      
      if (await results.count() > 0) {
        console.log(`   ✅ ${await results.count()} نتیجه پیدا شد. کلیک روی اولی...`);
        await results.first().click();
        await page.waitForTimeout(3000);
      } else {
        console.log('   ❌ در لیست پیشنهادی چیزی پیدا نشد.');
      }
    }

    // بررسی اینکه آیا به جدول اضافه شد؟
    const rows = await page.locator('.ag-row').filter({ hasText: 'عیار' }).count();
    if (rows > 0) {
      console.log('🎉 موفقیت! نماد عیار در دیده‌بان پیدا شد.');
      await captureBuyButton(page);
      return;
    }

    // --- روش ۲: جستجو در هدر اصلی (Header Search) ---
    console.log('\n📡 روش ۲: جستجو در هدر اصلی سایت...');
    const headerSearch = page.locator('tse-instrument-search-box input').first();
    if (await headerSearch.count() > 0) {
      await headerSearch.click();
      await headerSearch.fill('عیار');
      await page.waitForTimeout(2000);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(5000);
      
      if (page.url().includes('instrument')) {
        console.log('🎉 موفقیت! وارد صفحه مستقیم نماد شدیم.');
        return;
      }
    }

    // --- روش ۳: بررسی پورتفوی (Portfolio) ---
    console.log('\n📡 روش ۳: بررسی در صفحه دارایی‌ها...');
    await page.goto('https://online.agah.com/auth/portfolio/asset');
    await page.waitForTimeout(5000);
    const portfolioRows = await page.locator('.ag-row').filter({ hasText: 'عیار' }).count();
    
    if (portfolioRows > 0) {
      console.log('🎉 موفقیت! نماد عیار در پورتفوی شما موجود است.');
      await captureBuyButton(page);
      return;
    }

    console.log('\n❌ متاسفانه نماد "عیار" با هیچ روشی پیدا نشد.');
    console.log('🚨 پیشنهاد: تغییر کارگزاری به EasyTrader');

  } catch (error: any) {
    console.error('\n❌ خطا در فرآیند جستجو:', error.message);
  } finally {
    await browserManager.close();
  }
}

async function captureBuyButton(page: any) {
  console.log('\n🎯 در حال تلاش برای شناسایی دکمه خرید...');
  const buyBtn = page.locator('button[aria-label*="خرید"], button.green-c, .fa-cart-shopping.green-c').first();
  if (await buyBtn.count() > 0) {
    console.log('✅ دکمه خرید با موفقیت شناسایی شد!');
    await buyBtn.highlight();
    await page.waitForTimeout(2000);
  } else {
    console.log('❌ دکمه خرید در این صفحه پیدا نشد.');
  }
}

omniSearch();

