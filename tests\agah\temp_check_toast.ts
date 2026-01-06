/**
 * اسکریپت بررسی Toast/پیام خطا
 */

import { BrowserManager } from '../src/core/browser';

async function checkToast() {
  const browserManager = new BrowserManager();

  try {
    console.log('========================================');
    console.log('🔔 بررسی پیام‌های سیستم (Toast)');
    console.log('========================================\n');

    const page = await browserManager.launch(false);

    console.log('📍 در حال رفتن به صفحه دارایی‌ها...');
    await page.goto('https://online.agah.com/auth/portfolio/asset', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    console.log('⏳ صبر برای بارگذاری...');
    await page.waitForSelector('tse-asset-list', { timeout: 15000 });
    await page.waitForTimeout(3000);

    console.log('✅ صفحه بارگذاری شد.\n');

    // بستن ویجت
    try {
      await page.locator('tse-widget-bar button').first().click({ force: true, timeout: 2000 });
      await page.waitForTimeout(500);
    } catch (e) {}

    console.log('🖱️  کلیک روی دکمه خرید...');
    
    // شروع listening برای console و network
    page.on('console', msg => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        console.log(`[مرورگر] ${msg.type()}: ${msg.text()}`);
      }
    });

    const buyButton = page.locator('button.green-c').first();
    await buyButton.click({ force: true });
    
    console.log('⏳ صبر برای پاسخ...');
    await page.waitForTimeout(3000);

    // بررسی Toast
    const toastSelectors = [
      'p-toast',
      '.p-toast',
      '.p-toast-message',
      '[role="alert"]',
      '.toast',
      'tse-toast',
      '.notification',
      '.alert'
    ];

    console.log('\n🔍 بررسی Toast/پیام‌ها:');
    let foundToast = false;
    
    for (const sel of toastSelectors) {
      const count = await page.locator(sel).count();
      if (count > 0) {
        console.log(`\n✅ یافت شد: ${sel} (تعداد: ${count})`);
        const text = await page.locator(sel).first().textContent();
        console.log(`   محتوا: ${text}`);
        foundToast = true;
      }
    }

    if (!foundToast) {
      console.log('❌ هیچ Toast/پیامی پیدا نشد.');
    }

    console.log('\n⏳ 5 ثانیه دیگر صبر می‌کنیم...');
    await page.waitForTimeout(5000);

  } catch (error: any) {
    console.error('\n❌ خطا:', error.message);
  } finally {
    await browserManager.close();
  }
}

checkToast();

