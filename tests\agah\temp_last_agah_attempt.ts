/**
 * آخرین تلاش برای آساتریدر (بر اساس فایل 5)
 */

import { BrowserManager } from '../src/core/browser';

async function lastAgahAttempt() {
  const browserManager = new BrowserManager();

  try {
    console.log('========================================');
    console.log('🎯 آخرین تلاش برای آساتریدر (عیار)');
    console.log('========================================\n');

    const page = await browserManager.launch(false);

    console.log('📍 رفتن به پورتفوی...');
    await page.goto('https://online.agah.com/auth/portfolio/asset', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });

    console.log('⏳ صبر برای بارگذاری کامل جدول...');
    await page.waitForSelector('.ag-row', { timeout: 20000 });
    await page.waitForTimeout(3000);

    console.log('🔍 جستجوی ردیف نماد "عیار"...');
    // پیدا کردن ردیف عیار
    const ayarRow = page.locator('.ag-row').filter({ hasText: 'عیار' }).first();
    
    if (await ayarRow.count() === 0) {
      console.log('❌ نماد عیار در پورتفوی پیدا نشد!');
      return;
    }

    console.log('🖱️ تلاش برای کلیک روی آیکون خرید...');
    // استفاده از کلاس دقیقی که فرستادید: small-icon fa fa-cart-shopping
    // و فیلتر کردن برای آیکون سبز (خرید)
    const buyIcon = ayarRow.locator('i.fa-cart-shopping.small-icon').first();
    
    // پیدا کردن دکمه والد آیکون
    const buyButton = page.locator('button').filter({ has: buyIcon }).first();

    console.log('   هایلایت کردن دکمه...');
    await buyButton.highlight();
    await page.waitForTimeout(1000);

    console.log('   کلیک روی دکمه خرید...');
    await buyButton.click({ force: true });

    console.log('⏳ انتظار برای دیالوگ خرید (p-dynamicdialog)...');
    try {
      await page.waitForSelector('p-dynamicdialog', { timeout: 15000 });
      console.log('✅✅✅ تبریک! دیالوگ خرید باز شد!');
      
      // تست وارد کردن حجم (بر اساس فایل 5)
      console.log('⌨️ تست وارد کردن حجم (20)...');
      const quantityInput = page.locator('p-dynamicdialog input').nth(1); // معمولا اینپوت دوم حجم است
      await quantityInput.click({ clickCount: 3 });
      await page.keyboard.press('Backspace');
      await quantityInput.fill('20');
      console.log('✅ حجم وارد شد.');

    } catch (e) {
      console.log('❌ دیالوگ باز نشد. شاید به خاطر ساعت معاملاتی باشد.');
    }

    console.log('\n⏳ ۵ ثانیه برای مشاهده نهایی...');
    await page.waitForTimeout(5000);

  } catch (error: any) {
    console.error('\n❌ خطا در اجرای تست:', error.message);
  } finally {
    await browserManager.close();
  }
}

lastAgahAttempt();

