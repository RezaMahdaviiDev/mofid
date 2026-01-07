import { TransactionAnalyzer } from '../src/utils/transactionAnalyzer';

async function testTransactionAnalyzer() {
  console.log('🧪 تست Transaction Analyzer\n');

  const analyzer = new TransactionAnalyzer();
  const orderId = 'buy-1767788216265';

  console.log(`📋 تحلیل معامله: ${orderId}\n`);

  // پیدا کردن معامله
  console.log('1️⃣ پیدا کردن معامله...');
  const transaction = analyzer.findTransaction(orderId);
  if (!transaction) {
    console.error('❌ معامله پیدا نشد!');
    return;
  }
  console.log('✅ معامله پیدا شد:');
  console.log(`   - Order ID: ${transaction.orderId}`);
  console.log(`   - Model: ${transaction.model}`);
  console.log(`   - Symbol: ${transaction.symbol}`);
  console.log(`   - Side: ${transaction.side}`);
  console.log(`   - Duration: ${transaction.duration}ms\n`);

  // Correlation لاگ‌ها
  console.log('2️⃣ Correlation لاگ‌ها...');
  const correlatedLogs = analyzer.correlateLogs(transaction);
  console.log('✅ لاگ‌ها correlated شدند:');
  console.log(`   - Performance logs: ${correlatedLogs.performanceLogs.length}`);
  console.log(`   - Info logs: ${correlatedLogs.infoLogs.length}`);
  console.log(`   - Form value logs: ${correlatedLogs.formValueLogs.length}`);
  console.log(`   - Browser logs: ${correlatedLogs.browserLogs.length}`);
  console.log(`   - API phase logs: ${correlatedLogs.apiPhaseLogs.length}\n`);

  // Breakdown timing
  console.log('3️⃣ Breakdown timing...');
  const timingBreakdown = analyzer.breakdownTiming(correlatedLogs);
  console.log('✅ Timing breakdown:');
  console.log(`   - Total duration: ${timingBreakdown.totalDuration}ms`);
  console.log(`   - Accounted time: ${timingBreakdown.phases.reduce((sum, p) => sum + p.duration, 0)}ms`);
  console.log(`   - Unaccounted time: ${timingBreakdown.unaccountedTime}ms (${timingBreakdown.unaccountedPercentage.toFixed(1)}%)\n`);
  console.log('   Phases:');
  timingBreakdown.phases.forEach(phase => {
    console.log(`     - ${phase.name}: ${phase.duration}ms (${phase.percentage.toFixed(1)}%)`);
  });
  console.log('');

  // شناسایی bottlenecks
  console.log('4️⃣ شناسایی bottlenecks...');
  const bottlenecks = analyzer.identifyBottlenecks(timingBreakdown);
  console.log(`✅ ${bottlenecks.length} bottleneck پیدا شد:\n`);
  bottlenecks.forEach((b, i) => {
    console.log(`   ${i + 1}. ${b.phase}`);
    console.log(`      - زمان: ${b.duration}ms (${b.percentage.toFixed(1)}%)`);
    console.log(`      - شدت: ${b.severity}`);
    console.log(`      - توصیه: ${b.recommendation}`);
    console.log('');
  });

  // پیشنهادات
  console.log('5️⃣ تولید پیشنهادات...');
  const suggestions = analyzer.generateOptimizationSuggestions(transaction, bottlenecks);
  console.log(`✅ ${suggestions.length} پیشنهاد تولید شد:\n`);
  suggestions.forEach((s, i) => {
    console.log(`   ${i + 1}. ${s.title} [${s.priority}]`);
    console.log(`      - نوع: ${s.type}`);
    console.log(`      - بهبود: ${s.expectedImprovement}`);
    console.log('');
  });

  // تولید گزارش
  console.log('6️⃣ تولید گزارش تفصیلی...');
  const report = analyzer.generateDetailedReport(orderId);
  if (!report) {
    console.error('❌ گزارش تولید نشد!');
    return;
  }
  console.log('✅ گزارش تولید شد\n');

  // تولید گزارش Markdown
  console.log('7️⃣ ذخیره گزارش Markdown...');
  const mdPath = `docs/reports/transaction-analysis-${orderId}.md`;
  analyzer.generateMarkdownReport(orderId, mdPath);
  console.log(`✅ گزارش Markdown در ${mdPath} ذخیره شد\n`);

  // تولید گزارش JSON
  console.log('8️⃣ ذخیره گزارش JSON...');
  const jsonPath = `docs/reports/transaction-analysis-${orderId}.json`;
  analyzer.generateJSONReport(orderId, jsonPath);
  console.log(`✅ گزارش JSON در ${jsonPath} ذخیره شد\n`);

  console.log('✅✅✅ تمام تست‌ها با موفقیت انجام شد!');
}

testTransactionAnalyzer().catch(error => {
  console.error('❌ خطا در تست:', error);
  process.exit(1);
});

