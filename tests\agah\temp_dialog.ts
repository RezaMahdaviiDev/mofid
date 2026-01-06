/**
 * اسکریپت تست دیالوگ خرید (موقت)
 * کلیک روی دکمه خرید و پیدا کردن فیلدهای قیمت و حجم
 */

import { BrowserManager } from '../src/core/browser';

async function testBuyDialog() {
  const browserManager = new BrowserManager();

  try {
    console.log('========================================');
    console.log('💬 اسکریپت تست دیالوگ خرید');
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
    
    // بستن ویجت بار اگر باز است (که مانع کلیک می‌شود)
    try {
      const widgetBar = await page.locator('tse-widget-bar.open');
      if (await widgetBar.count() > 0) {
        console.log('🔽 بستن ویجت بار...');
        const closeButton = await page.locator('tse-widget-bar button[aria-label*="بستن"], tse-widget-bar button.close');
        if (await closeButton.count() > 0) {
          await closeButton.first().click();
          await page.waitForTimeout(500);
        }
      }
    } catch (e) {
      console.log('   ویجت بار پیدا نشد یا قبلاً بسته شده.');
    }

    console.log('\n🖱️  در حال کلیک روی دکمه خرید اولین نماد...');

    // کلیک روی اولین دکمه خرید با force
    const buyButton = await page.locator('button.green-c').first();
    await buyButton.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await buyButton.click({ force: true });

    console.log('✅ دکمه خرید کلیک شد.');
    console.log('⏳ صبر برای باز شدن دیالوگ یا پیام خطا...');
    
    // صبر برای باز شدن دیالوگ یا پیام خطا
    try {
      await page.waitForSelector('p-dynamicdialog, p-toast, .p-toast', { timeout: 15000 });
      await page.waitForTimeout(1000);
      
      // بررسی اینکه آیا Toast (پیام خطا) آمده یا دیالوگ باز شده
      const toastCount = await page.locator('p-toast, .p-toast').count();
      if (toastCount > 0) {
        const toastText = await page.locator('p-toast, .p-toast').textContent();
        console.log(`⚠️  پیام سیستم: ${toastText}`);
        console.log('   احتمالاً نماد در بازار نیست یا خرید امکان‌پذیر نیست.');
        return;
      }
    } catch (error: any) {
      console.error('❌ دیالوگ یا پیام خطا باز نشد.');
      throw error;
    }

    console.log('✅ دیالوگ خرید باز شد!');
    console.log('\n🔎 در حال جستجوی فیلد قیمت...');

    // پیدا کردن فیلد قیمت (input)
    const priceInputs = await page.locator('p-dynamicdialog input[type="text"]').all();
    console.log(`   یافت شد: ${priceInputs.length} فیلد ورودی.`);

    if (priceInputs.length > 0) {
      console.log('\n🎨 هایلایت کردن فیلد اول (احتمالاً قیمت)...');
      await priceInputs[0].evaluate((element: any) => {
        element.style.border = '3px solid blue';
        element.style.boxShadow = '0 0 10px blue';
      });

      // خواندن مقدار فعلی
      const currentValue = await priceInputs[0].inputValue();
      console.log(`   مقدار فعلی: ${currentValue}`);
    }

    console.log('\n⏳ 5 ثانیه صبر می‌کنیم تا دیالوگ را ببینید...');
    await page.waitForTimeout(5000);

    console.log('\n✅ تست دیالوگ خرید موفقیت‌آمیز بود!');
    console.log('   فیلدها پیدا شدند و می‌توان قیمت را وارد کرد.');

  } catch (error: any) {
    console.error('\n❌ خطا در تست دیالوگ:', error.message);
  } finally {
    await browserManager.close();
  }
}

// اجرای تست
testBuyDialog();

