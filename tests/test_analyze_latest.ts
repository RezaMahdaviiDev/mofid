import { TransactionAnalyzer } from '../src/utils/transactionAnalyzer';

async function testAnalyzeLatest() {
  console.log('🧪 تست تحلیل آخرین معامله\n');

  const analyzer = new TransactionAnalyzer();

  // پیدا کردن آخرین معامله
  console.log('1️⃣ پیدا کردن آخرین معامله...');
  const latestTransaction = analyzer.findLatestTransaction();
  
  if (!latestTransaction) {
    console.error('❌ آخرین معامله پیدا نشد!');
    console.log('لطفاً ابتدا یک معامله انجام دهید.');
    return;
  }

  console.log('✅ آخرین معامله پیدا شد:');
  console.log(`   - Order ID: ${latestTransaction.orderId}`);
  console.log(`   - Model: ${latestTransaction.model}`);
  console.log(`   - Symbol: ${latestTransaction.symbol}`);
  console.log(`   - Side: ${latestTransaction.side}`);
  console.log(`   - Duration: ${latestTransaction.duration}ms`);
  console.log(`   - Timestamp: ${new Date(latestTransaction.timestamp).toLocaleString('fa-IR')}\n`);

  // تحلیل معامله
  console.log('2️⃣ تحلیل معامله...');
  const report = analyzer.generateDetailedReport(latestTransaction.orderId);
  
  if (!report) {
    console.error('❌ گزارش تولید نشد!');
    return;
  }

  console.log('✅ گزارش تولید شد\n');

  // نمایش خلاصه
  console.log('📊 خلاصه گزارش:');
  console.log(`   - زمان کل: ${report.transaction.duration}ms`);
  console.log(`   - تعداد Phases: ${report.timingBreakdown.phases.length}`);
  console.log(`   - تعداد Bottlenecks: ${report.bottlenecks.length}`);
  console.log(`   - تعداد پیشنهادات: ${report.suggestions.length}\n`);

  // نمایش Bottlenecks
  if (report.bottlenecks.length > 0) {
    console.log('⚠️ Bottlenecks:');
    report.bottlenecks.forEach((b, i) => {
      console.log(`   ${i + 1}. ${b.phase}: ${b.duration}ms (${b.percentage.toFixed(1)}%) - ${b.severity}`);
    });
    console.log('');
  }

  // نمایش بهترین پیشنهاد
  if (report.suggestions.length > 0) {
    console.log('💡 بهترین پیشنهاد:');
    const topSuggestion = report.suggestions[0];
    console.log(`   - ${topSuggestion.title}`);
    console.log(`   - اولویت: ${topSuggestion.priority}`);
    console.log(`   - بهبود مورد انتظار: ${topSuggestion.expectedImprovement}`);
    console.log('');
  }

  // تولید گزارش Markdown
  console.log('3️⃣ ذخیره گزارش Markdown...');
  const mdPath = `docs/reports/transaction-analysis-${latestTransaction.orderId}.md`;
  analyzer.generateMarkdownReport(latestTransaction.orderId, mdPath);
  console.log(`✅ گزارش Markdown در ${mdPath} ذخیره شد\n`);

  // تولید گزارش JSON
  console.log('4️⃣ ذخیره گزارش JSON...');
  const jsonPath = `docs/reports/transaction-analysis-${latestTransaction.orderId}.json`;
  analyzer.generateJSONReport(latestTransaction.orderId, jsonPath);
  console.log(`✅ گزارش JSON در ${jsonPath} ذخیره شد\n`);

  console.log('✅✅✅ تحلیل آخرین معامله با موفقیت انجام شد!');
}

testAnalyzeLatest().catch(error => {
  console.error('❌ خطا در تست:', error);
  process.exit(1);
});

