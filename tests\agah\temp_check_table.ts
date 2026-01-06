/**
 * بررسی محتویات جدول دیده‌بان
 */

import { BrowserManager } from '../src/core/browser';

async function checkTable() {
  const browserManager = new BrowserManager();

  try {
    console.log('========================================');
    console.log('🔍 بررسی جدول دیده‌بان');
    console.log('========================================\n');

    const page = await browserManager.launch(false);

    console.log('📍 در حال رفتن به صفحه دیده‌بان...');
    await page.goto('https://online.agah.com/auth/marketWatch', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    console.log('⏳ صبر برای بارگذاری...');
    await page.waitForTimeout(5000);
    console.log('✅ صفحه بارگذاری شد.\n');

    // بررسی ردیف‌های جدول
    console.log('🔍 بررسی ردیف‌های جدول AG-Grid...');
    const rows = await page.locator('.ag-center-cols-container .ag-row').all();
    console.log(`   تعداد ردیف‌ها: ${rows.length}\n`);

    if (rows.length === 0) {
      console.log('❌ جدول خالی است! لطفاً نماد اضافه کنید.');
    } else {
      console.log('✅ جدول دارای ردیف است!');
      
      // بررسی محتوای اولین ردیف
      console.log('\n📋 محتوای اولین ردیف:');
      const firstRow = rows[0];
      const html = await firstRow.innerHTML();
      console.log(html.substring(0, 500) + '...\n');
      
      // جستجوی تمام آیکون‌ها
      const icons = await page.locator('.ag-center-cols-container i.fa').all();
      console.log(`🔍 تعداد آیکون‌های FA: ${icons.length}`);
      
      for (let i = 0; i < Math.min(icons.length, 10); i++) {
        const className = await icons[i].getAttribute('class');
        console.log(`   ${i + 1}. class: ${className}`);
      }
    }

    console.log('\n⏳ 10 ثانیه صبر می‌کنیم...');
    await page.waitForTimeout(10000);

  } catch (error: any) {
    console.error('\n❌ خطا:', error.message);
  } finally {
    await browserManager.close();
  }
}

checkTable();

