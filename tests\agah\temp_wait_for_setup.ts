/**
 * اسکریپت انتظار برای تنظیمات دستی
 * مرورگر را باز کرده و منتظر می‌ماند تا کاربر نماد را اضافه کند
 */

import { BrowserManager } from '../src/core/browser';

async function waitForSetup() {
  const browserManager = new BrowserManager();

  try {
    console.log('========================================');
    console.log('⏰ باز کردن مرورگر و انتظار');
    console.log('========================================\n');

    const page = await browserManager.launch(false);

    console.log('📍 در حال رفتن به صفحه دیده‌بان...');
    await page.goto('https://online.agah.com/auth/marketWatch', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    await page.waitForTimeout(3000);
    console.log('✅ صفحه بارگذاری شد.\n');

    console.log('👉 حالا شما می‌توانید:');
    console.log('   1. نماد مورد نظرتان را در دیده‌بان اضافه کنید');
    console.log('   2. تنظیمات دلخواه خود را انجام دهید');
    console.log('   3. بعد از اتمام، در ترمینال Enter بزنید\n');

    // انتظار برای Enter
    console.log('⌨️  برای بستن مرورگر، Enter بزنید...\n');
    
    await new Promise<void>((resolve) => {
      process.stdin.once('data', () => {
        resolve();
      });
    });

    console.log('\n✅ تنظیمات ذخیره شد!');
    
  } catch (error: any) {
    console.error('\n❌ خطا:', error.message);
  } finally {
    await browserManager.close();
    console.log('🔒 مرورگر بسته شد.');
  }
}

waitForSetup();

