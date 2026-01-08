import { LogAnalyzer } from '../src/utils/logAnalyzer';

/**
 * تست Log Analyzer
 */
async function testAnalyzer() {
  console.log('========================================');
  console.log('🧪 تست Log Analyzer');
  console.log('========================================\n');

  try {
    const analyzer = new LogAnalyzer();

    // تحلیل لاگ‌های امروز
    console.log('📊 تحلیل لاگ‌های امروز...\n');
    const analysis = analyzer.analyze();

    console.log('📈 خلاصه نتایج:');
    console.log(`  - کل خریدها: ${analysis.summary.totalBuys}`);
    console.log(`  - خریدهای موفق: ${analysis.summary.successfulBuys}`);
    console.log(`  - خریدهای ناموفق: ${analysis.summary.failedBuys}`);
    console.log(`  - نرخ موفقیت: ${analysis.summary.successRate.toFixed(2)}%`);
    console.log(`  - میانگین زمان: ${analysis.summary.averageDuration}ms`);
    console.log(`  - کمترین زمان: ${analysis.summary.minDuration}ms`);
    console.log(`  - بیشترین زمان: ${analysis.summary.maxDuration}ms`);

    if (Object.keys(analysis.models).length > 0) {
      console.log('\n🚀 آمار مدل‌ها:');
      for (const [model, stats] of Object.entries(analysis.models)) {
        console.log(`  - ${model}: ${stats.count} خرید، میانگین ${stats.averageDuration.toFixed(0)}ms، نرخ موفقیت ${stats.successRate.toFixed(2)}%`);
      }
    }

    // تولید گزارش JSON
    console.log('\n📄 تولید گزارش JSON...');
    const reportsDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    const jsonPath = path.join(reportsDir, `analysis-${analysis.date}.json`);
    analyzer.generateJSONReport(undefined, jsonPath);

    // تولید گزارش Markdown
    console.log('📄 تولید گزارش Markdown...');
    const mdPath = path.join(reportsDir, `analysis-${analysis.date}.md`);
    analyzer.generateMarkdownReport(undefined, mdPath);

    console.log('\n✅✅✅ تست Analyzer تکمیل شد!');
    console.log(`📁 گزارش‌ها در پوشه reports/ ذخیره شدند`);

  } catch (error: any) {
    console.error('\n❌ خطا در تست Analyzer:', error.message);
    throw error;
  }
}

import * as fs from 'fs';
import * as path from 'path';

testAnalyzer();




