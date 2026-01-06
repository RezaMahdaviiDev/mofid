/**
 * راهنمای اضافه کردن نماد به دیده‌بان
 */

import { BrowserManager } from '../src/core/browser';

async function addSymbolGuide() {
  const browserManager = new BrowserManager();

  try {
    console.log('========================================');
    console.log('📚 راهنمای اضافه کردن نماد');
    console.log('========================================\n');

    const page = await browserManager.launch(false);

    console.log('📍 در حال رفتن به صفحه دیده‌بان...');
    await page.goto('https://online.agah.com/auth/marketWatch', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    await page.waitForTimeout(3000);
    console.log('✅ صفحه بارگذاری شد.\n');

    console.log('👉 لطفاً این مراحل را انجام دهید:');
    console.log('   1. در قسمت بالا، روی دکمه "+" (افزودن نماد) کلیک کنید');
    console.log('   2. نام نماد (مثلاً "عیار" یا هر نماد دیگر) را وارد کنید');
    console.log('   3. نماد را به لیست اضافه کنید');
    console.log('   4. اطمینان حاصل کنید که نماد در جدول نمایش داده می‌شود');
    console.log('   5. بعد از اضافه کردن نماد، در ترمینال Enter بزنید\n');

    // انتظار برای Enter
    console.log('⌨️  بعد از اضافه کردن نماد، Enter بزنید...\n');
    
    await new Promise<void>((resolve) => {
      process.stdin.once('data', () => {
        resolve();
      });
    });

    console.log('\n🔍 در حال بررسی جدول...');
    await page.waitForTimeout(2000);
    
    const rows = await page.locator('.ag-center-cols-container .ag-row').all();
    console.log(`   تعداد ردیف‌ها: ${rows.length}`);
    
    if (rows.length > 0) {
      console.log('✅✅✅ عالی! نماد اضافه شد!');
      
      // جستجوی دکمه خرید
      const buyButtons = await page.locator('button[aria-label*="خرید"]').all();
      console.log(`   دکمه‌های خرید: ${buyButtons.length}`);
      
      if (buyButtons.length > 0) {
        console.log('✅ دکمه خرید هم پیدا شد!');
      }
    } else {
      console.log('❌ جدول هنوز خالی است. لطفاً نماد را اضافه کنید.');
    }
    
    console.log('\n⏳ 5 ثانیه دیگر صبر می‌کنیم...');
    await page.waitForTimeout(5000);

  } catch (error: any) {
    console.error('\n❌ خطا:', error.message);
  } finally {
    await browserManager.close();
    console.log('🔒 مرورگر بسته شد.');
  }
}

addSymbolGuide();

