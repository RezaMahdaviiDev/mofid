/**
 * اسکریپت شناسایی سلکتورهای ایزی‌تریدر (مفید)
 */

import { BrowserManager } from '../../src/core/browser';

async function easyDiscovery() {
  const browserManager = new BrowserManager('easy');

  try {
    console.log('========================================');
    console.log('🔍 شناسایی سلکتورها در ایزی‌تریدر');
    console.log('========================================\n');

    const page = await browserManager.launch(false);

    console.log('📍 در حال رفتن به پنل ایزی‌تریدر...');
    // استفاده از تایم‌اوت بیشتر برای لود شدن پنل
    await page.goto('https://d.easytrader.ir/', { 
      waitUntil: 'load',
      timeout: 60000 
    });

    // صبر برای بارگذاری کامل ویجت‌ها
    console.log('⏳ صبر برای بارگذاری کامل ویجت‌ها...');
    await page.waitForTimeout(10000);
    console.log('✅ صفحه بارگذاری شد.');

    // تلاش برای جستجوی نماد "عیار" اگر در صفحه نیست
    console.log('\n🔎 در حال جستجوی نماد "عیار"...');
    const searchBox = page.locator('input[placeholder*="جستجو"], input[aria-label*="جستجو"]').first();
    if (await searchBox.count() > 0) {
      await searchBox.fill('عیار');
      await page.waitForTimeout(3000);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(3000);
    }

    console.log('\n🔎 در حال جستجوی دکمه‌های خرید...');
    
    // در ایزی تریدر دکمه خرید معمولاً سبز است یا متن خرید دارد
    // بررسی دکمه‌های سبز رنگ (Success)
    const greenButtons = await page.locator('button.btn-success, button.green, .buy-button').all();
    console.log(`   یافت شد: ${greenButtons.length} دکمه با استایل خرید`);

    const buyTextButtons = await page.locator('button').filter({ hasText: /خرید/i }).all();
    console.log(`   یافت شد: ${buyTextButtons.length} دکمه با متن "خرید"`);

    const finalBuyButton = greenButtons.length > 0 ? greenButtons[0] : (buyTextButtons.length > 0 ? buyTextButtons[0] : null);

    if (finalBuyButton) {
      console.log('🎨 هایلایت کردن دکمه خرید...');
      await finalBuyButton.highlight();
      await page.waitForTimeout(2000);
      
      console.log('🖱️ کلیک برای باز شدن پنل خرید...');
      await finalBuyButton.click();
      await page.waitForTimeout(3000);

      // بررسی فیلدهای ورودی در پنل باز شده
      console.log('🔎 بررسی فیلدهای ورودی در پنل خرید...');
      const inputs = await page.locator('input').all();
      
      for (let i = 0; i < Math.min(inputs.length, 15); i++) {
        const placeholder = await inputs[i].getAttribute('placeholder');
        const ariaLabel = await inputs[i].getAttribute('aria-label');
        const value = await inputs[i].inputValue();
        const className = await inputs[i].getAttribute('class');
        console.log(`   Input ${i + 1}: label="${ariaLabel}", placeholder="${placeholder}", val="${value}", class="${className}"`);
      }
    } else {
      console.log('❌ دکمه خریدی پیدا نشد.');
      // اسکرین‌شات برای دیباگ (در صورت نیاز)
    }

    console.log('\n⏳ ۱۰ ثانیه برای مشاهده وضعیت...');
    await page.waitForTimeout(10000);

  } catch (error: any) {
    console.error('\n❌ خطا در شناسایی:', error.message);
  } finally {
    await browserManager.close();
  }
}

easyDiscovery();

