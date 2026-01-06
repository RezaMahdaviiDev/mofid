/**
 * لیست کردن تمام دکمه‌ها با aria-label
 */

import { BrowserManager } from '../src/core/browser';

async function listAllButtons() {
  const browserManager = new BrowserManager();

  try {
    console.log('========================================');
    console.log('📋 لیست تمام دکمه‌ها با aria-label');
    console.log('========================================\n');

    const page = await browserManager.launch(false);

    console.log('📍 در حال رفتن به صفحه دیده‌بان...');
    await page.goto('https://online.agah.com/auth/marketWatch', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    console.log('⏳ صبر برای بارگذاری جدول AG-Grid...');
    
    try {
      await page.waitForSelector('.ag-center-cols-container', { timeout: 15000 });
      console.log('✅ جدول پیدا شد.');
    } catch (e) {
      console.log('⚠️  جدول پیدا نشد، ادامه می‌دهیم...');
    }
    
    await page.waitForTimeout(5000);
    console.log('✅ صفحه بارگذاری شد.\n');

    // جستجوی آیکون سبد خرید سبز
    console.log('🔍 جستجوی آیکون سبد خرید (fa-cart-shopping.green-c)...');
    const cartIcons = await page.locator('i.fa-cart-shopping.green-c').all();
    console.log(`   یافت شد: ${cartIcons.length} آیکون\n`);

    if (cartIcons.length > 0) {
      console.log('✅ آیکون‌های سبد خرید پیدا شدند!');
      // دکمه parent آیکون اول را پیدا کن
      const firstIcon = cartIcons[0];
      const parentButton = page.locator('button').filter({ has: firstIcon });
      const btnCount = await parentButton.count();
      console.log(`   دکمه parent: ${btnCount > 0 ? '✅ یافت شد' : '❌ یافت نشد'}`);
      
      if (btnCount > 0) {
        const ariaLabel = await parentButton.getAttribute('aria-label');
        console.log(`   aria-label: "${ariaLabel}"`);
      }
    }

    // لیست تمام دکمه‌ها با aria-label
    console.log('\n📋 دکمه‌های با aria-label:\n');
    const allButtons = await page.locator('button[aria-label]').all();
    console.log(`تعداد: ${allButtons.length}\n`);

    for (let i = 0; i < Math.min(allButtons.length, 10); i++) {
      const ariaLabel = await allButtons[i].getAttribute('aria-label');
      console.log(`${i + 1}. "${ariaLabel}"`);
    }
    
    console.log('\n⏳ 10 ثانیه صبر می‌کنیم...');
    await page.waitForTimeout(10000);

  } catch (error: any) {
    console.error('\n❌ خطا:', error.message);
  } finally {
    await browserManager.close();
  }
}

listAllButtons();

