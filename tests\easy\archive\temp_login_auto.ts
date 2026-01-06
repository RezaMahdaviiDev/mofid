/**
 * اسکریپت لاگین خودکار ایزی‌تریدر (بدون نیاز به Enter)
 */

import { BrowserManager } from '../../src/core/browser';

async function easyLoginAuto() {
  const browserManager = new BrowserManager('easy');

  try {
    console.log('========================================');
    console.log('🔑 اسکریپت لاگین خودکار ایزی‌تریدر');
    console.log('========================================\n');

    const page = await browserManager.launch(false);
    console.log('📍 در حال رفتن به صفحه لاگین...');
    
    // افزایش تایم‌اوت و تغییر استراتژی انتظار
    try {
      await page.goto('https://d.easytrader.ir/', { 
        waitUntil: 'commit', // به محض شروع دریافت پاسخ ادامه بده
        timeout: 90000      // ۹۰ ثانیه صبر
      });
    } catch (e) {
      console.log('⚠️ صفحه به کندی لود می‌شود، اما ادامه می‌دهیم...');
    }

    console.log('\n⏳ شما ۹۰ ثانیه زمان دارید تا لاگین کنید...');
    
    for (let i = 90; i > 0; i--) {
      process.stdout.write(`\r⏰ ${i} ثانیه باقی‌مانده...`);
      
      // چک کردن اینکه آیا لاگین انجام شده (مثلاً URL تغییر کرده یا المانی از داشبورد دیده می‌شود)
      const currentUrl = page.url();
      if (currentUrl.includes('/dashboard') || currentUrl.includes('/classic')) {
        console.log('\n\n✅ لاگین شناسایی شد! در حال ذخیره سشن...');
        await browserManager.saveSession();
        console.log('🎉 سشن با موفقیت ذخیره شد.');
        return;
      }
      
      await page.waitForTimeout(1000);
    }

    // اگر زمان تمام شد و لاگین شناسایی نشد، باز هم تلاش برای ذخیره سشن فعلی
    console.log('\n\n⌛ زمان به پایان رسید. تلاش نهایی برای ذخیره سشن...');
    await browserManager.saveSession();

  } catch (error: any) {
    console.error('\n❌ خطا:', error.message);
  } finally {
    await browserManager.close();
  }
}

easyLoginAuto();

