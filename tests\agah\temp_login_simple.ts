/**
 * اسکریپت تست لاگین ساده (موقت)
 * مرورگر را باز می‌کند، 30 ثانیه صبر می‌کند و سپس Session را ذخیره می‌کند
 */

import { BrowserManager } from '../src/core/browser';

async function testLoginSimple() {
  const browserManager = new BrowserManager();

  try {
    console.log('========================================');
    console.log('🔑 اسکریپت تست لاگین (ساده)');
    console.log('========================================\n');

    // باز کردن مرورگر (در حالت گرافیکی)
    const page = await browserManager.launch(false);

    // رفتن به صفحه لاگین آساتریدر
    console.log('📍 در حال رفتن به صفحه لاگین آساتریدر...');
    await page.goto('https://online.agah.com/auth/login');

    console.log('\n⏳ شما 60 ثانیه وقت دارید:');
    console.log('   1. کپچا را حل کنید');
    console.log('   2. نام کاربری و رمز عبور را وارد کنید');
    console.log('   3. وارد حساب خود شوید');
    console.log('   4. به صفحه دارایی‌ها بروید\n');

    // صبر 60 ثانیه
    for (let i = 60; i > 0; i--) {
      process.stdout.write(`\r⏰ ${i} ثانیه باقی مانده...`);
      await page.waitForTimeout(1000);
    }

    console.log('\n\n💾 در حال ذخیره Session...');

    // ذخیره کردن Session
    await browserManager.saveSession();

    console.log('\n✅ Session با موفقیت ذخیره شد!');
    console.log('   از این به بعد دیگر نیازی به لاگین نیست.');
    console.log('\n🎉 تست لاگین به پایان رسید.');

    // 3 ثانیه صبر می‌کنیم تا کاربر پیام را ببیند
    await page.waitForTimeout(3000);

  } catch (error: any) {
    console.error('\n❌ خطا در فرآیند لاگین:', error.message);
  } finally {
    await browserManager.close();
  }
}

// اجرای تست
testLoginSimple();

