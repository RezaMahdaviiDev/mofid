/**
 * اسکریپت اسکن عمیق ایزی‌تریدر
 */

import { BrowserManager } from '../../src/core/browser';

async function deepScan() {
  const browserManager = new BrowserManager('easy');

  try {
    console.log('========================================');
    console.log('🔬 اسکن عمیق ساختار ایزی‌تریدر');
    console.log('========================================\n');

    const page = await browserManager.launch(false);
    await page.goto('https://d.easytrader.ir/', { waitUntil: 'load', timeout: 60000 });

    console.log('⏳ صبر ۱۵ ثانیه‌ای برای لود کامل تمام ماژول‌ها...');
    await page.waitForTimeout(15000);

    // گرفتن اسکرین‌شات برای تحلیل بصری
    console.log('📸 گرفتن اسکرین‌شات...');
    await page.screenshot({ path: 'easy_debug.png', fullPage: true });
    console.log('✅ اسکرین‌شات در easy_debug.png ذخیره شد.');

    // جستجوی تمام المان‌هایی که ممکن است دکمه خرید باشند
    console.log('\n🔍 جستجوی المان‌های مشکوک...');
    
    const candidates = await page.evaluate(() => {
      const results: any[] = [];
      // جستجو در تمام المان‌ها حتی داخل Shadow DOM
      const allElements = document.querySelectorAll('*');
      
      allElements.forEach(el => {
        const text = el.textContent?.trim() || '';
        const className = el.className || '';
        const color = window.getComputedStyle(el).backgroundColor;
        
        // اگر متن شامل خرید باشد یا رنگش سبز مایل به خرید باشد
        if (text === 'خرید' || text.includes('خرید') || className.toString().includes('buy') || color === 'rgb(0, 192, 115)' || color === 'rgb(46, 204, 113)') {
          results.push({
            tag: el.tagName,
            text: text.substring(0, 20),
            class: className.toString(),
            color: color
          });
        }
      });
      return results;
    });

    console.log(`🔎 یافت شد: ${candidates.length} المان مشکوک.`);
    candidates.slice(0, 10).forEach((c, i) => {
      console.log(`   ${i+1}. [${c.tag}] text="${c.text}", class="${c.class}", color="${c.color}"`);
    });

    // بررسی وجود فیلد جستجو
    const inputs = await page.locator('input').all();
    console.log(`\n⌨️ تعداد کل input ها: ${inputs.length}`);
    for (const input of inputs) {
        const ph = await input.getAttribute('placeholder');
        console.log(`   - Placeholder: ${ph}`);
    }

  } catch (error: any) {
    console.error('\n❌ خطا:', error.message);
  } finally {
    await browserManager.close();
  }
}

deepScan();

