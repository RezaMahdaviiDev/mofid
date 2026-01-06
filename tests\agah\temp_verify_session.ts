/**
 * اسکریپت تست بازنشانی Session (موقت)
 * این فایل بررسی می‌کند که آیا Session ذخیره شده کار می‌کند
 * و بدون لاگین مجدد به پنل دسترسی داریم یا نه.
 */

import { BrowserManager } from '../src/core/browser';

async function verifySession() {
  const browserManager = new BrowserManager();

  try {
    console.log('========================================');
    console.log('🔍 اسکریپت تست بازنشانی Session');
    console.log('========================================\n');

    // باز کردن مرورگر با Session ذخیره شده
    const page = await browserManager.launch(false);

    console.log('📍 در حال رفتن به صفحه پورتفولیو...');
    await page.goto('https://online.agah.com/auth/portfolio/asset', {
      waitUntil: 'networkidle'
    });

    // چک کردن اینکه آیا در صفحه لاگین هستیم یا در پنل؟
    const currentUrl = page.url();
    
    if (currentUrl.includes('/auth/login')) {
      console.error('\n❌ Session منقضی شده است! شما به صفحه لاگین منتقل شدید.');
      console.log('   لطفاً دوباره اسکریپت temp_login را اجرا کنید.');
    } else if (currentUrl.includes('/auth/portfolio')) {
      console.log('✅ Session معتبر است! شما بدون لاگین وارد پنل شدید.');
      console.log(`   URL فعلی: ${currentUrl}`);
      
      // تلاش برای خواندن یک عنصر در صفحه
      try {
        await page.waitForSelector('tse-asset-list', { timeout: 10000 });
        console.log('✅ جدول دارایی‌ها بارگذاری شد.');
      } catch {
        console.log('⚠️  جدول دارایی‌ها بارگذاری نشد، اما Session معتبر است.');
      }

      console.log('\n🎉 تست بازنشانی Session موفقیت‌آمیز بود!');
    } else {
      console.log(`⚠️  URL غیرمنتظره: ${currentUrl}`);
    }

    // 3 ثانیه صبر می‌کنیم تا کاربر صفحه را ببیند
    await page.waitForTimeout(3000);

  } catch (error: any) {
    console.error('\n❌ خطا در تست بازنشانی:', error.message);
  } finally {
    await browserManager.close();
  }
}

// اجرای تست
verifySession();

