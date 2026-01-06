/**
 * تست نهایی فاز ۳: باز کردن دیالوگ و وارد کردن قیمت در پورتفوی
 */

import { BrowserManager } from '../src/core/browser';

async function testFinalBuyDialog() {
  const browserManager = new BrowserManager();

  try {
    console.log('========================================');
    console.log('💎 تست نهایی: باز کردن دیالوگ خرید از پورتفوی');
    console.log('========================================\n');

    const page = await browserManager.launch(false);

    console.log('📍 رفتن به پورتفوی...');
    await page.goto('https://online.agah.com/auth/portfolio/asset', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);

    console.log('🔍 پیدا کردن ردیف عیار...');
    const ayarRow = page.locator('.ag-row').filter({ hasText: 'عیار' }).first();
    
    // اسکرول به ردیف
    await ayarRow.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    console.log('🖱️ کلیک روی دکمه خرید سبز...');
    // جستجوی دقیق‌تر دکمه داخل ردیف
    const buyBtn = ayarRow.locator('button').filter({ has: page.locator('i.green-c') }).first();
    
    await buyBtn.hover();
    await buyBtn.click({ force: true });

    console.log('⏳ انتظار برای دیالوگ خرید...');
    await page.waitForSelector('p-dynamicdialog, .p-dialog', { timeout: 10000 });
    console.log('✅ دیالوگ باز شد!');

    // پیدا کردن فیلد قیمت
    // بر اساس Recording، فیلد قیمت اولین اینپوت است
    console.log('⌨️ تلاش برای وارد کردن قیمت تست (42730)...');
    const priceInput = page.locator('p-dynamicdialog input[type="text"], .p-dialog input').first();
    
    await priceInput.click({ clickCount: 3 }); // انتخاب تمام متن فعلی
    await page.keyboard.press('Backspace');
    await priceInput.fill('42730');
    
    console.log('✅ قیمت وارد شد.');

    console.log('\n⏳ ۵ ثانیه صبر برای مشاهده نتیجه...');
    await page.waitForTimeout(5000);

    console.log('\n🎉 تست با موفقیت انجام شد!');

  } catch (error: any) {
    console.error('\n❌ خطا:', error.message);
  } finally {
    await browserManager.close();
  }
}

testFinalBuyDialog();

