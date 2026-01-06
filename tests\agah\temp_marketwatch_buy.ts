/**
 * اسکریپت تست خرید از صفحه MarketWatch (موقت)
 * این اسکریپت از صفحه دیده‌بان استفاده می‌کند که دیالوگ‌ها در آن کار می‌کنند
 */

import { BrowserManager } from '../src/core/browser';

async function testMarketWatchBuy() {
  const browserManager = new BrowserManager();

  try {
    console.log('========================================');
    console.log('📊 تست خرید از صفحه MarketWatch');
    console.log('========================================\n');

    const page = await browserManager.launch(false);

    console.log('📍 در حال رفتن به صفحه دیده‌بان (MarketWatch)...');
    await page.goto('https://online.agah.com/auth/marketWatch', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    console.log('⏳ صبر برای بارگذاری صفحه...');
    await page.waitForTimeout(3000);

    console.log('✅ صفحه بارگذاری شد.\n');

    // مرحله 1: جستجوی نماد (اختیاری - نماد عیار باید از قبل در لیست باشد)
    console.log('🔍 مرحله 1: بررسی جدول دیده‌بان...');
    await page.waitForTimeout(2000);
    console.log('✅ صفحه آماده است.');

    // مرحله 2: کلیک روی دکمه خرید در جدول
    console.log('\n🖱️  مرحله 2: جستجوی دکمه خرید در جدول...');
    
    // جستجوی دکمه با aria-label "خریدِ نماد"
    const buyButtons = await page.locator('button[aria-label*="خریدِ نماد"]').all();
    console.log(`   تعداد دکمه‌های خرید یافت شده: ${buyButtons.length}`);
    
    if (buyButtons.length > 0) {
      // گرفتن aria-label اولین دکمه
      const firstBtnLabel = await buyButtons[0].getAttribute('aria-label');
      console.log(`   اولین دکمه: ${firstBtnLabel}`);
      
      console.log('\n✅ دکمه خرید پیدا شد! کلیک می‌کنم...');
      await buyButtons[0].click();
      await page.waitForTimeout(2000);
      
      // مرحله 3: بررسی دیالوگ
      console.log('\n🔍 مرحله 3: بررسی دیالوگ خرید...');
      const dialogCount = await page.locator('p-dynamicdialog').count();
      
      if (dialogCount > 0) {
        console.log(`✅✅✅ دیالوگ باز شد! (تعداد: ${dialogCount})`);
        
        // پیدا کردن input های دیالوگ
        const inputs = await page.locator('p-dynamicdialog input').all();
        console.log(`   تعداد فیلدهای ورودی: ${inputs.length}\n`);

        for (let i = 0; i < Math.min(inputs.length, 5); i++) {
          const ariaLabel = await inputs[i].getAttribute('aria-label');
          const placeholder = await inputs[i].getAttribute('placeholder');
          const value = await inputs[i].inputValue();
          const id = await inputs[i].getAttribute('id');
          console.log(`   فیلد ${i + 1}:`);
          console.log(`     - aria-label: ${ariaLabel}`);
          console.log(`     - placeholder: ${placeholder}`);
          console.log(`     - id: ${id}`);
          console.log(`     - value: ${value}\n`);
        }

        console.log('\n🎉🎉🎉 موفقیت! دیالوگ خرید یافت شد!');
        console.log('⏳ 10 ثانیه صبر می‌کنیم تا دیالوگ را ببینید...');
        await page.waitForTimeout(10000);
        
      } else {
        console.log('❌ دیالوگ باز نشد.');
      }
      
    } else {
      console.log('❌ دکمه خرید در جدول پیدا نشد!');
      console.log('   احتمالاً نماد "عیار" در لیست دیده‌بان شما نیست.');
    }

  } catch (error: any) {
    console.error('\n❌ خطا:', error.message);
  } finally {
    await browserManager.close();
  }
}

testMarketWatchBuy();

