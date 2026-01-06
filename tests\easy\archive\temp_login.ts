/**
 * اسکریپت لاگین ایزی‌تریدر (مفید)
 */

import { BrowserManager } from '../../src/core/browser';

async function easyLogin() {
  // استفاده از 'easy' به عنوان نام کارگزاری برای تفکیک سشن‌ها
  const browserManager = new BrowserManager('easy');

  try {
    console.log('========================================');
    console.log('🔑 اسکریپت لاگین ایزی‌تریدر (مفید)');
    console.log('========================================\n');

    const page = await browserManager.launch(false);

    console.log('📍 در حال رفتن به صفحه لاگین ایزی‌تریدر...');
    await page.goto('https://d.easytrader.ir/', { waitUntil: 'domcontentloaded' });

    console.log('\n⏳ منتظر ورود دستی شما هستیم...');
    console.log('   بعد از اینکه وارد شدید و صفحه اصلی (داشبورد) را دیدید،');
    console.log('   در ترمینال Enter بزنید.\n');

    // انتظار برای Enter
    await new Promise<void>((resolve) => {
      process.stdin.once('data', () => {
        resolve();
      });
    });

    console.log('💾 در حال ذخیره سشن ایزی‌تریدر...');
    await browserManager.saveSession();
    console.log('✅ سشن با موفقیت در .user-data/easy/session.json ذخیره شد.');

  } catch (error: any) {
    console.error('\n❌ خطا در لاگین:', error.message);
  } finally {
    await browserManager.close();
  }
}

easyLogin();

