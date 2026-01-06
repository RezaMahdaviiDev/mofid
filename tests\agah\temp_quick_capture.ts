/**
 * اسکریپت Capture سریع دیالوگ
 * این اسکریپت بلافاصله بعد از کلیک، دیالوگ را capture می‌کند
 */

import { BrowserManager } from '../src/core/browser';

async function quickCapture() {
  const browserManager = new BrowserManager();

  try {
    console.log('========================================');
    console.log('⚡ اسکریپت Capture سریع');
    console.log('========================================\n');

    const page = await browserManager.launch(false);

    console.log('📍 در حال رفتن به صفحه دارایی‌ها...');
    await page.goto('https://online.agah.com/auth/portfolio/asset', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    console.log('⏳ صبر برای بارگذاری جدول...');
    await page.waitForSelector('tse-asset-list', { timeout: 15000 });
    await page.waitForTimeout(3000);

    console.log('✅ جدول بارگذاری شد.\n');

    // بستن ویجت بار
    try {
      const closeBtn = await page.locator('tse-widget-bar button').first();
      if (await closeBtn.count() > 0) {
        await closeBtn.click({ force: true });
        await page.waitForTimeout(500);
      }
    } catch (e) {
      // ignore
    }

    console.log('🖱️  در حال کلیک روی دکمه خرید...');
    const buyButton = await page.locator('button.green-c').first();
    
    // کلیک و بلافاصله شروع به گوش دادن
    await Promise.all([
      buyButton.click({ force: true }),
      page.waitForTimeout(500) // صبر کوتاه
    ]);

    console.log('⚡ بررسی فوری...');
    await page.waitForTimeout(1000);

    // بررسی همه چیز
    const selectors = [
      'p-dynamicdialog',
      '.p-dialog',
      '[role="dialog"]',
      'tse-order-entry-dialog',
      'div[class*="order"]',
      'div[id*="pn_id"]'
    ];

    let found = false;
    for (const sel of selectors) {
      const count = await page.locator(sel).count();
      if (count > 0) {
        console.log(`\n✅ یافت شد: ${sel}`);
        
        // گرفتن اطلاعات
        const element = page.locator(sel).first();
        const html = await element.innerHTML().catch(() => 'خطا در خواندن HTML');
        
        // پیدا کردن input ها
        const inputs = await page.locator(`${sel} input`).all();
        console.log(`   تعداد input: ${inputs.length}`);
        
        for (let i = 0; i < inputs.length; i++) {
          const ariaLabel = await inputs[i].getAttribute('aria-label');
          const placeholder = await inputs[i].getAttribute('placeholder');
          const id = await inputs[i].getAttribute('id');
          const name = await inputs[i].getAttribute('name');
          console.log(`\n   Input ${i + 1}:`);
          console.log(`     - aria-label: ${ariaLabel}`);
          console.log(`     - placeholder: ${placeholder}`);
          console.log(`     - id: ${id}`);
          console.log(`     - name: ${name}`);
        }
        
        found = true;
        break;
      }
    }

    if (!found) {
      console.log('\n❌ دیالوگ پیدا نشد!');
      console.log('🔍 لیست تمام div هایی که شامل "dialog" یا "order" هستند:');
      
      const allDivs = await page.locator('div').all();
      for (const div of allDivs.slice(0, 50)) { // فقط 50 تای اول
        const className = await div.getAttribute('class');
        if (className && (className.includes('dialog') || className.includes('order') || className.includes('modal'))) {
          console.log(`   - class: ${className}`);
        }
      }
    }

    console.log('\n⏳ 10 ثانیه صبر می‌کنیم تا شما دیالوگ را ببینید...');
    await page.waitForTimeout(10000);

  } catch (error: any) {
    console.error('\n❌ خطا:', error.message);
  } finally {
    await browserManager.close();
  }
}

quickCapture();

