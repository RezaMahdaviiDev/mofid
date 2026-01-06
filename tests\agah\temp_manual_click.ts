/**
 * اسکریپت تست دستی (موقت)
 * مرورگر را باز می‌کند و منتظر می‌ماند شما دستی دکمه خرید را بزنید
 * تا ببینیم دیالوگ چگونه باز می‌شود
 */

import { BrowserManager } from '../src/core/browser';

async function testManualClick() {
  const browserManager = new BrowserManager();

  try {
    console.log('========================================');
    console.log('👋 اسکریپت تست دستی');
    console.log('========================================\n');

    const page = await browserManager.launch(false);

    console.log('📍 در حال رفتن به صفحه دارایی‌ها...');
    await page.goto('https://online.agah.com/auth/portfolio/asset', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    console.log('⏳ صبر برای بارگذاری جدول...');
    await page.waitForSelector('tse-asset-list', { timeout: 15000 });
    await page.waitForTimeout(2000);

    console.log('✅ جدول بارگذاری شد.');
    console.log('\n👉 حالا شما 30 ثانیه وقت دارید:');
    console.log('   1. روی دکمه خرید یک نماد کلیک کنید');
    console.log('   2. منتظر بمانید تا دیالوگ باز شود\n');

    // صبر 30 ثانیه
    for (let i = 30; i > 0; i--) {
      process.stdout.write(`\r⏰ ${i} ثانیه باقی مانده...`);
      await page.waitForTimeout(1000);
    }

    console.log('\n\n🔎 بررسی عناصر موجود در صفحه...');

    // بررسی انواع مختلف دیالوگ
    const selectors = [
      'p-dynamicdialog',
      '.p-dialog',
      '[role="dialog"]',
      'tse-order-entry-dialog',
      '.order-dialog',
      'div[class*="dialog"]'
    ];

    let foundDialog = false;
    for (const selector of selectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        console.log(`✅ پیدا شد: ${selector} (تعداد: ${count})`);
        foundDialog = true;
        
        // پیدا کردن فیلدهای ورودی در این دیالوگ
        const inputs = await page.locator(`${selector} input`).all();
        console.log(`   تعداد فیلدهای ورودی: ${inputs.length}`);

        for (let i = 0; i < Math.min(inputs.length, 5); i++) {
          const placeholder = await inputs[i].getAttribute('placeholder');
          const ariaLabel = await inputs[i].getAttribute('aria-label');
          const type = await inputs[i].getAttribute('type');
          const value = await inputs[i].inputValue();
          console.log(`   فیلد ${i + 1}: type="${type}", placeholder="${placeholder}", aria-label="${ariaLabel}", value="${value}"`);
        }
        break;
      }
    }

    if (!foundDialog) {
      console.log('❌ هیچ دیالوگی با selector های شناخته شده پیدا نشد.');
      console.log('🔍 بررسی تمام input های موجود در صفحه...');
      
      const allInputs = await page.locator('input[type="text"], input[type="number"]').all();
      console.log(`   تعداد کل input ها: ${allInputs.length}`);
      
      for (let i = 0; i < Math.min(allInputs.length, 10); i++) {
        const ariaLabel = await allInputs[i].getAttribute('aria-label');
        const placeholder = await allInputs[i].getAttribute('placeholder');
        console.log(`   Input ${i + 1}: aria-label="${ariaLabel}", placeholder="${placeholder}"`);
      }
    }

    console.log('\n⏳ 5 ثانیه صبر می‌کنیم...');
    await page.waitForTimeout(5000);

  } catch (error: any) {
    console.error('\n❌ خطا:', error.message);
  } finally {
    await browserManager.close();
  }
}

// اجرای تست
testManualClick();

