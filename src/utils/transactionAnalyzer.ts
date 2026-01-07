import * as fs from 'fs';
import * as path from 'path';
import { LogAnalyzer, LogEntry, BuyLogEntry } from './logAnalyzer';
import {
  Transaction,
  CorrelatedLog,
  CorrelatedLogs,
  TimingBreakdown,
  PhaseTiming,
  Bottleneck,
  OptimizationSuggestion,
  ModelComparison,
  DetailedReport
} from './transactionAnalyzer.types';

/**
 * Transaction Analyzer
 * تحلیل تفصیلی معاملات برای شناسایی bottlenecks و بهینه‌سازی
 */
export class TransactionAnalyzer {
  private logsDir: string;
  private logAnalyzer: LogAnalyzer;

  constructor(logsDir: string = 'logs') {
    this.logsDir = path.isAbsolute(logsDir) ? logsDir : path.join(process.cwd(), logsDir);
    this.logAnalyzer = new LogAnalyzer(logsDir);
  }

  /**
   * خواندن لاگ‌های یک فایل
   */
  private readLogFile(filePath: string): LogEntry[] {
    try {
      if (!fs.existsSync(filePath)) {
        return [];
      }
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.trim().split('\n').filter(line => line.trim());
      return lines.map(line => {
        try {
          return JSON.parse(line);
        } catch (e) {
          return null;
        }
      }).filter((entry): entry is LogEntry => entry !== null);
    } catch (error) {
      return [];
    }
  }

  /**
   * پیدا کردن آخرین معامله انجام شده
   */
  findLatestTransaction(): Transaction | null {
    const buyDir = path.join(this.logsDir, 'buy');
    if (!fs.existsSync(buyDir)) {
      return null;
    }

    const buyFiles = fs.readdirSync(buyDir)
      .filter(file => file.startsWith('buy-') && file.endsWith('.json'))
      .map(file => {
        const filePath = path.join(buyDir, file);
        const stats = fs.statSync(filePath);
        return {
          file,
          path: filePath,
          mtime: stats.mtime.getTime()
        };
      })
      .sort((a, b) => b.mtime - a.mtime); // جدیدترین اول

    if (buyFiles.length === 0) {
      return null;
    }

    // پیدا کردن آخرین فایل
    for (const fileInfo of buyFiles) {
      const entries = this.readLogFile(fileInfo.path);
      for (const entry of entries) {
        if (entry.location === 'buy-action' && entry.data?.orderId) {
          const buyLog = entry as BuyLogEntry;
          const orderData = buyLog.data.order as any;
          const allData = buyLog.data as any;
          
          // پیدا کردن model از info logs
          const date = new Date(buyLog.timestamp).toISOString().split('T')[0];
          const infoFile = path.join(this.logsDir, `info-${date}.json`);
          const infoLogs = this.readLogFile(infoFile);
          const relatedInfoLog = infoLogs.find(log => 
            log.data?.orderId === buyLog.data.orderId || 
            (Math.abs(log.timestamp - buyLog.timestamp) < 5000 && log.data?.model)
          );
          
          return {
            orderId: buyLog.data.orderId,
            timestamp: buyLog.timestamp,
            model: (relatedInfoLog?.data as any)?.model || allData?.model || (buyLog.data.result as any)?.model || 4,
            symbol: orderData?.symbol || '',
            price: orderData?.price || '',
            quantity: orderData?.quantity || '',
            side: (orderData?.side || 'buy') as 'buy' | 'sell',
            duration: buyLog.data.duration || 0,
            success: buyLog.data.result?.success !== false
          };
        }
      }
    }

    return null;
  }

  /**
   * پیدا کردن معامله بر اساس orderId
   */
  findTransaction(orderId: string): Transaction | null {
    const buyDir = path.join(this.logsDir, 'buy');
    if (!fs.existsSync(buyDir)) {
      return null;
    }

    const buyFiles = fs.readdirSync(buyDir)
      .filter(file => file.includes(orderId) && file.endsWith('.json'))
      .map(file => path.join(buyDir, file));

    for (const file of buyFiles) {
      const entries = this.readLogFile(file);
      for (const entry of entries) {
        if (entry.location === 'buy-action' && entry.data?.orderId === orderId) {
          const buyLog = entry as BuyLogEntry;
          const orderData = buyLog.data.order as any;
          const allData = buyLog.data as any;
          
          // پیدا کردن model از info logs
          const date = new Date(buyLog.timestamp).toISOString().split('T')[0];
          const infoFile = path.join(this.logsDir, `info-${date}.json`);
          const infoLogs = this.readLogFile(infoFile);
          const relatedInfoLog = infoLogs.find(log => 
            log.data?.orderId === buyLog.data.orderId || 
            (Math.abs(log.timestamp - buyLog.timestamp) < 5000 && log.data?.model)
          );
          
          return {
            orderId: buyLog.data.orderId,
            timestamp: buyLog.timestamp,
            model: (relatedInfoLog?.data as any)?.model || allData?.model || (buyLog.data.result as any)?.model || 4,
            symbol: orderData?.symbol || '',
            price: orderData?.price || '',
            quantity: orderData?.quantity || '',
            side: (orderData?.side || 'buy') as 'buy' | 'sell',
            duration: buyLog.data.duration || 0,
            success: buyLog.data.result?.success !== false
          };
        }
      }
    }

    return null;
  }

  /**
   * Correlation لاگ‌های مرتبط با یک معامله
   */
  correlateLogs(transaction: Transaction): CorrelatedLogs {
    const timeWindow = 30000; // 30 ثانیه
    const startTime = transaction.timestamp - timeWindow;
    const endTime = transaction.timestamp + timeWindow;

    // تاریخ معامله
    const date = new Date(transaction.timestamp).toISOString().split('T')[0];

    // خواندن لاگ اصلی خرید
    const buyDir = path.join(this.logsDir, 'buy');
    let buyLog: CorrelatedLog | undefined;
    if (fs.existsSync(buyDir)) {
      const buyFiles = fs.readdirSync(buyDir)
        .filter(file => file.includes(transaction.orderId) && file.endsWith('.json'))
        .map(file => path.join(buyDir, file));

      for (const file of buyFiles) {
        const entries = this.readLogFile(file);
        for (const entry of entries) {
          if (entry.data?.orderId === transaction.orderId) {
            buyLog = entry as CorrelatedLog;
            break;
          }
        }
        if (buyLog) break;
      }
    }

    // خواندن لاگ‌های performance
    const perfFile = path.join(this.logsDir, 'performance', `performance-${date}.json`);
    const performanceLogs = this.readLogFile(perfFile)
      .filter(log => log.timestamp >= startTime && log.timestamp <= endTime)
      .map(log => log as CorrelatedLog);

    // خواندن لاگ‌های info
    const infoFile = path.join(this.logsDir, `info-${date}.json`);
    const infoLogs = this.readLogFile(infoFile)
      .filter(log => log.timestamp >= startTime && log.timestamp <= endTime)
      .map(log => log as CorrelatedLog);

    // خواندن لاگ‌های form-values
    const formFile = path.join(this.logsDir, `form-values-${date}.json`);
    const formValueLogs = this.readLogFile(formFile)
      .filter(log => log.timestamp >= startTime && log.timestamp <= endTime)
      .map(log => log as CorrelatedLog);

    // خواندن لاگ‌های browser
    const browserFile = path.join(this.logsDir, `browser-${date}.json`);
    const browserLogs = this.readLogFile(browserFile)
      .filter(log => log.timestamp >= startTime && log.timestamp <= endTime)
      .map(log => log as CorrelatedLog);

    // خواندن لاگ‌های API phases
    const apiPhasesFile = path.join(this.logsDir, 'performance', `api-phases-${date}.json`);
    const apiPhaseLogs = this.readLogFile(apiPhasesFile)
      .filter(log => log.timestamp >= startTime && log.timestamp <= endTime)
      .map(log => log as CorrelatedLog);

    return {
      transaction,
      buyLog,
      performanceLogs,
      infoLogs,
      formValueLogs,
      browserLogs,
      apiPhaseLogs,
      timeRange: {
        start: startTime,
        end: endTime
      }
    };
  }

  /**
   * Breakdown زمان برای هر phase
   */
  breakdownTiming(correlatedLogs: CorrelatedLogs): TimingBreakdown {
    const { transaction, infoLogs } = correlatedLogs;
    const phases: PhaseTiming[] = [];
    
    // پیدا کردن Buy request received برای شروع timeline
    const buyRequestLog = infoLogs.find(log => 
      log.message.includes('Buy request received')
    );
    // استفاده از transaction.timestamp به عنوان مرجع اصلی
    const transactionStartTime = transaction.timestamp;
    const endTime = transaction.timestamp + transaction.duration;

    // Phase 1: Browser Launch + Page Navigation
    // این شامل browser launch, page goto, و waitForTimeout 15000ms است
    // اما این phase قبل از transaction.timestamp است، پس باید جداگانه محاسبه شود
    const browserLaunchLog = infoLogs.find(log => 
      log.message.includes('Browser launched')
    );
    const pageLoadLog = infoLogs.find(log => 
      log.message.includes('Page loaded')
    );
    const waitCompletedLog = infoLogs.find(log => 
      log.message.includes('Wait completed')
    );
    
    // محاسبه زمان از Buy request تا Balance reading (قبل از transaction)
    const balanceBeforeLog = infoLogs.find(log => 
      log.message.includes('Balance before transaction') ||
      (log.message.includes('Balance extracted successfully') && log.timestamp < transaction.timestamp)
    );
    
    // اگر Buy request قبل از transaction است، این phase را اضافه می‌کنیم
    if (buyRequestLog && balanceBeforeLog && buyRequestLog.timestamp < transaction.timestamp) {
      const navigationTotalDuration = balanceBeforeLog.timestamp - buyRequestLog.timestamp;
      // این duration را از overhead محاسبه می‌کنیم، نه از transaction duration
      phases.push({
        name: 'Browser Launch + Page Navigation (Pre-transaction)',
        duration: 0, // این phase قبل از transaction است، پس duration = 0 در breakdown
        percentage: 0,
        startTime: buyRequestLog.timestamp,
        endTime: balanceBeforeLog.timestamp,
        logs: [buyRequestLog, ...(browserLaunchLog ? [browserLaunchLog] : []), ...(pageLoadLog ? [pageLoadLog] : []), ...(waitCompletedLog ? [waitCompletedLog] : [])],
        details: {
          browserLaunchDuration: browserLaunchLog?.data?.launchDuration || 0,
          pageLoadDuration: pageLoadLog?.data?.gotoDuration || 0,
          waitDuration: waitCompletedLog?.data?.waitDuration || 15000,
          actualDuration: navigationTotalDuration,
          note: 'This phase occurs before transaction timestamp, so duration is not counted in transaction breakdown'
        }
      });
    }

    // Phase 2: Balance Reading (Before) - معمولاً بسیار سریع است
    if (balanceBeforeLog) {
      const balanceExtractLog = infoLogs.find(log => 
        log.message.includes('Balance extracted successfully') && 
        log.timestamp <= balanceBeforeLog.timestamp &&
        Math.abs(log.timestamp - balanceBeforeLog.timestamp) < 100
      );
      const balanceDuration = balanceExtractLog ? (balanceBeforeLog.timestamp - balanceExtractLog.timestamp) : 0;
      phases.push({
        name: 'Balance Reading (Before)',
        duration: balanceDuration,
        percentage: 0,
        startTime: balanceExtractLog?.timestamp || balanceBeforeLog.timestamp,
        endTime: balanceBeforeLog.timestamp,
        logs: [...(balanceExtractLog ? [balanceExtractLog] : []), balanceBeforeLog],
        details: balanceBeforeLog.data
      });
    }

    // Phase 3: Buy Process (Selection + Panel + Fill + Submit)
    // برای Model 4، این مراحل در executeUltraBuy انجام می‌شوند
    const buyProcessStart = infoLogs.find(log => 
      log.message.includes('Starting buy process') ||
      log.location.includes('executeUltraBuy')
    );
    const buyProcessEnd = infoLogs.find(log => 
      log.message.includes('Order verified successfully') ||
      log.message.includes('Submit_Order')
    );
    
    // اگر buyProcessStart/End پیدا نشد، از Order created استفاده می‌کنیم
    const orderCreatedLog = infoLogs.find(log => 
      log.message.includes('Order object created')
    );
    const buyProcessStartTime = buyProcessStart?.timestamp || orderCreatedLog?.timestamp || transaction.timestamp;
    const buyProcessEndTime = buyProcessEnd?.timestamp || transaction.timestamp;
    
    // برای Model 4، breakdown دقیق‌تر بر اساس performance logs
    if (transaction.model === 4 && buyProcessStartTime && buyProcessEndTime) {
      const buyProcessDuration = buyProcessEndTime - buyProcessStartTime;
      
      // اگر performance logs داریم، breakdown دقیق‌تر
      const perfLogs = correlatedLogs.performanceLogs.filter(log => 
        log.timestamp >= buyProcessStartTime && 
        log.timestamp <= buyProcessEndTime &&
        log.performance?.operation?.includes('buy-model-4')
      );
      
      // اگر performance log پیدا شد، از آن استفاده می‌کنیم
      if (perfLogs.length > 0) {
        // Buy Process یک phase است (تمام 2577ms)
        phases.push({
          name: 'Buy Process (Selection + Panel + Fill + Submit)',
          duration: buyProcessDuration,
          percentage: 0,
          startTime: buyProcessStartTime,
          endTime: buyProcessEndTime,
          logs: infoLogs.filter(log => 
            log.timestamp >= buyProcessStartTime && 
            log.timestamp <= buyProcessEndTime
          ),
          details: {
            startMessage: buyProcessStart?.message || orderCreatedLog?.message || 'Transaction start',
            endMessage: buyProcessEnd?.message || 'Transaction end',
            orderCreated: orderCreatedLog?.timestamp,
            note: 'Model 4 uses UI automation which combines all sub-phases'
          }
        });
      } else {
        // بدون performance log، از info logs استفاده می‌کنیم
        phases.push({
          name: 'Buy Process (Selection + Panel + Fill + Submit)',
          duration: buyProcessDuration,
          percentage: 0,
          startTime: buyProcessStartTime,
          endTime: buyProcessEndTime,
          logs: infoLogs.filter(log => 
            log.timestamp >= buyProcessStartTime && 
            log.timestamp <= buyProcessEndTime
          ),
          details: {
            startMessage: buyProcessStart?.message || orderCreatedLog?.message || 'Transaction start',
            endMessage: buyProcessEnd?.message || 'Transaction end',
            orderCreated: orderCreatedLog?.timestamp
          }
        });
      }
    } else if (buyProcessStartTime && buyProcessEndTime) {
      // برای دیگر models
      const buyProcessDuration = buyProcessEndTime - buyProcessStartTime;
      phases.push({
        name: 'Buy Process (Selection + Panel + Fill + Submit)',
        duration: buyProcessDuration,
        percentage: 0,
        startTime: buyProcessStartTime,
        endTime: buyProcessEndTime,
        logs: infoLogs.filter(log => 
          log.timestamp >= buyProcessStartTime && 
          log.timestamp <= buyProcessEndTime
        ),
        details: {
          startMessage: buyProcessStart?.message || orderCreatedLog?.message || 'Transaction start',
          endMessage: buyProcessEnd?.message || 'Transaction end',
          orderCreated: orderCreatedLog?.timestamp
        }
      });
    }

    // Phase 4: Balance Reading (After) - فقط اگر در transaction duration باشد
    const balanceAfterLog = infoLogs.find(log => 
      log.message.includes('Balance after transaction')
    );
    const balanceAfterExtractLog = infoLogs.find(log => 
      log.message.includes('Balance extracted successfully') && 
      log.timestamp > transaction.timestamp &&
      balanceAfterLog && log.timestamp <= balanceAfterLog.timestamp &&
      Math.abs(log.timestamp - balanceAfterLog.timestamp) < 100
    );
    const txEndTime = transaction.timestamp + transaction.duration;
    
    if (balanceAfterLog && balanceAfterLog.timestamp <= txEndTime) {
      const balanceAfterDuration = balanceAfterExtractLog ? (balanceAfterLog.timestamp - balanceAfterExtractLog.timestamp) : 0;
      phases.push({
        name: 'Balance Reading (After)',
        duration: balanceAfterDuration,
        percentage: 0,
        startTime: balanceAfterExtractLog?.timestamp || balanceAfterLog.timestamp,
        endTime: balanceAfterLog.timestamp,
        logs: [...(balanceAfterExtractLog ? [balanceAfterExtractLog] : []), balanceAfterLog],
        details: balanceAfterLog.data
      });
    }
    
    // Phase 5: Post-processing (از Balance after تا Buy completed)
    // این phase معمولاً بعد از transaction duration است، پس به عنوان overhead نشان می‌دهیم
    const buyCompletedLog = infoLogs.find(log => 
      log.message.includes('Buy completed successfully')
    );
    if (balanceAfterLog && buyCompletedLog) {
      const postProcessingDuration = buyCompletedLog.timestamp - balanceAfterLog.timestamp;
      // اگر این phase در transaction duration است، آن را اضافه می‌کنیم
      if (buyCompletedLog.timestamp <= txEndTime && postProcessingDuration > 0) {
        phases.push({
          name: 'Post-processing',
          duration: postProcessingDuration,
          percentage: 0,
          startTime: balanceAfterLog.timestamp,
          endTime: buyCompletedLog.timestamp,
          logs: [buyCompletedLog],
          details: buyCompletedLog.data
        });
      } else if (buyCompletedLog.timestamp > txEndTime) {
        // اگر بعد از transaction duration است، به عنوان overhead نشان می‌دهیم
        phases.push({
          name: 'Post-processing (Overhead)',
          duration: 0, // در breakdown محاسبه نمی‌شود
          percentage: 0,
          startTime: balanceAfterLog.timestamp,
          endTime: buyCompletedLog.timestamp,
          logs: [buyCompletedLog],
          details: {
            ...buyCompletedLog.data,
            actualDuration: postProcessingDuration,
            note: 'This phase occurs after transaction duration and is not counted in breakdown'
          }
        });
      }
    }

    // محاسبه درصدها
    // فقط phases که در transaction duration هستند را محاسبه می‌کنیم
    const txEndTime2 = transaction.timestamp + transaction.duration;
    const phasesInTransaction = phases.filter(phase => phase.endTime <= txEndTime2);
    const accountedTime = phasesInTransaction.reduce((sum, phase) => sum + phase.duration, 0);
    const totalDuration = transaction.duration;
    const overheadDuration = totalDuration - accountedTime;
    const overheadPercentage = totalDuration > 0 ? (overheadDuration / totalDuration) * 100 : 0;

    // محاسبه درصد برای هر phase (فقط phases در transaction)
    phases.forEach(phase => {
      if (phase.endTime <= txEndTime2) {
        phase.percentage = totalDuration > 0 ? (phase.duration / totalDuration) * 100 : 0;
      } else {
        // phases بعد از transaction duration درصد 0 دارند
        phase.percentage = 0;
      }
    });

    return {
      phases,
      totalDuration,
      overheadDuration,
      overheadPercentage,
      unaccountedTime: overheadDuration,
      unaccountedPercentage: overheadPercentage
    };
  }

  /**
   * شناسایی bottlenecks
   */
  identifyBottlenecks(timingBreakdown: TimingBreakdown): Bottleneck[] {
    const bottlenecks: Bottleneck[] = [];
    const { phases, totalDuration } = timingBreakdown;

    // Thresholds
    const HIGH_THRESHOLD = 30; // بیش از 30% زمان کل
    const MEDIUM_THRESHOLD = 15; // بیش از 15% زمان کل

    for (const phase of phases) {
      if (phase.percentage > HIGH_THRESHOLD) {
        bottlenecks.push({
          phase: phase.name,
          duration: phase.duration,
          percentage: phase.percentage,
          severity: 'high',
          recommendation: this.getRecommendation(phase.name),
          expectedImprovement: this.getExpectedImprovement(phase.name)
        });
      } else if (phase.percentage > MEDIUM_THRESHOLD) {
        bottlenecks.push({
          phase: phase.name,
          duration: phase.duration,
          percentage: phase.percentage,
          severity: 'medium',
          recommendation: this.getRecommendation(phase.name),
          expectedImprovement: this.getExpectedImprovement(phase.name)
        });
      }
    }

    // بررسی overhead
    if (timingBreakdown.overheadPercentage > 20) {
      bottlenecks.push({
        phase: 'Unaccounted Time',
        duration: timingBreakdown.overheadDuration,
        percentage: timingBreakdown.overheadPercentage,
        severity: 'high',
        recommendation: 'تحلیل دقیق‌تر لاگ‌ها برای شناسایی زمان از دست رفته',
        expectedImprovement: 'شناسایی و حذف overhead می‌تواند ' + Math.round(timingBreakdown.overheadDuration) + 'ms صرفه‌جویی کند'
      });
    }

    return bottlenecks.sort((a, b) => b.percentage - a.percentage);
  }

  /**
   * پیشنهادات بهینه‌سازی
   */
  generateOptimizationSuggestions(transaction: Transaction, bottlenecks: Bottleneck[]): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];

    // تحلیل bottlenecks
    for (const bottleneck of bottlenecks) {
      if (bottleneck.phase === 'Page Navigation' && bottleneck.percentage > 50) {
        suggestions.push({
          type: 'wait-reduction',
          priority: 'high',
          title: 'کاهش waitForTimeout در Page Load',
          description: `Page Navigation ${Math.round(bottleneck.percentage)}% از زمان کل را می‌گیرد. کاهش waitForTimeout از 15000ms به 5000ms می‌تواند ${Math.round(bottleneck.duration * 0.67)}ms صرفه‌جویی کند.`,
          expectedImprovement: `${Math.round(bottleneck.duration * 0.67)}ms (${Math.round(bottleneck.percentage * 0.67)}%)`,
          implementation: 'کاهش `page.waitForTimeout(15000)` به `page.waitForTimeout(5000)` در `buy.ts`',
          impact: {
            timeSaved: Math.round(bottleneck.duration * 0.67),
            percentageSaved: Math.round(bottleneck.percentage * 0.67)
          }
        });
      }

      if (bottleneck.phase.includes('Buy Process') && bottleneck.percentage > 30) {
        suggestions.push({
          type: 'model-migration',
          priority: 'high',
          title: 'Migration به Model 5 (API Direct)',
          description: `Buy Process با Model 4 کند است. استفاده از Model 5 (API) می‌تواند زمان را به 50-100ms کاهش دهد.`,
          expectedImprovement: `${Math.round(bottleneck.duration * 0.95)}ms (${Math.round(bottleneck.percentage * 0.95)}%)`,
          implementation: 'استفاده از Model 5 در dashboard: `model: "5"`',
          impact: {
            timeSaved: Math.round(bottleneck.duration * 0.95),
            percentageSaved: Math.round(bottleneck.percentage * 0.95)
          }
        });
      }
    }

    // پیشنهادات کلی
    if (transaction.model === 4) {
      suggestions.push({
        type: 'model-migration',
        priority: 'high',
        title: 'Migration به Model 5 با Skip Verification',
        description: 'استفاده از Model 5 با `skipVerification: true` می‌تواند زمان را به زیر 100ms برساند.',
        expectedImprovement: `${transaction.duration - 100}ms (${Math.round(((transaction.duration - 100) / transaction.duration) * 100)}%)`,
        implementation: 'استفاده از Model 5 و تنظیم `skipVerification: true`',
        impact: {
          timeSaved: transaction.duration - 100,
          percentageSaved: Math.round(((transaction.duration - 100) / transaction.duration) * 100)
        }
      });
    }

    // پیشنهاد Model 6
    suggestions.push({
      type: 'model-migration',
      priority: 'medium',
      title: 'Migration به Model 6 (Ultra Fast)',
      description: 'Model 6 برای سرعت حداکثری طراحی شده است (target: <50ms)',
      expectedImprovement: `${transaction.duration - 50}ms (${Math.round(((transaction.duration - 50) / transaction.duration) * 100)}%)`,
      implementation: 'استفاده از Model 6 در dashboard: `model: "6"`',
      impact: {
        timeSaved: transaction.duration - 50,
        percentageSaved: Math.round(((transaction.duration - 50) / transaction.duration) * 100)
      }
    });

    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * مقایسه با Model 5/6
   */
  generateModelComparison(transaction: Transaction): ModelComparison {
    const currentDuration = transaction.duration;
    
    // Benchmarks
    const model4Benchmark = 200; // از مستندات
    const model5Benchmark = 364; // از مستندات (قبل از بهینه‌سازی)
    const model5Optimized = 50; // پس از بهینه‌سازی
    const model6Target = 50;

    return {
      currentModel: transaction.model,
      currentDuration,
      alternatives: [
        {
          model: 5,
          modelName: 'Model 5 (API Direct)',
          estimatedDuration: model5Optimized,
          improvement: currentDuration - model5Optimized,
          improvementPercentage: Math.round(((currentDuration - model5Optimized) / currentDuration) * 100),
          pros: [
            'API-based (بدون UI automation)',
            'سرعت بالا (50-100ms پس از بهینه‌سازی)',
            'قابلیت skip verification',
            'Token caching برای سرعت بیشتر'
          ],
          cons: [
            'نیاز به token extraction',
            'وابستگی به API stability'
          ],
          migrationComplexity: 'low'
        },
        {
          model: 6,
          modelName: 'Model 6 (Ultra Fast)',
          estimatedDuration: model6Target,
          improvement: currentDuration - model6Target,
          improvementPercentage: Math.round(((currentDuration - model6Target) / currentDuration) * 100),
          pros: [
            'سریع‌ترین model (<50ms)',
            'بدون verification',
            'بدون retry overhead',
            'بهینه شده برای سرعت حداکثری'
          ],
          cons: [
            'بدون retry (در صورت خطا)',
            'بدون verification (نیاز به اطمینان از موفقیت)'
          ],
          migrationComplexity: 'medium'
        }
      ]
    };
  }

  /**
   * تولید گزارش تفصیلی
   */
  generateDetailedReport(orderId: string): DetailedReport | null {
    const transaction = this.findTransaction(orderId);
    if (!transaction) {
      return null;
    }

    const correlatedLogs = this.correlateLogs(transaction);
    const timingBreakdown = this.breakdownTiming(correlatedLogs);
    const bottlenecks = this.identifyBottlenecks(timingBreakdown);
    const suggestions = this.generateOptimizationSuggestions(transaction, bottlenecks);
    const modelComparison = this.generateModelComparison(transaction);

    // Benchmarks
    const model4Benchmark = 200;
    const model5Benchmark = 364;
    const model6Target = 50;

    const keyFindings: string[] = [];
    if (transaction.duration > model4Benchmark * 10) {
      keyFindings.push(`زمان اجرا (${transaction.duration}ms) بسیار بیشتر از benchmark Model 4 (${model4Benchmark}ms) است`);
    }
    if (timingBreakdown.overheadPercentage > 20) {
      keyFindings.push(`${Math.round(timingBreakdown.overheadPercentage)}% از زمان کل (${Math.round(timingBreakdown.overheadDuration)}ms) قابل accounting نیست`);
    }
    if (bottlenecks.length > 0) {
      keyFindings.push(`${bottlenecks.length} bottleneck اصلی شناسایی شد: ${bottlenecks.slice(0, 3).map(b => b.phase).join(', ')}`);
    }

    return {
      transaction,
      timingBreakdown,
      bottlenecks,
      suggestions,
      modelComparison,
      summary: {
        totalDuration: transaction.duration,
        benchmarkComparison: {
          model4Benchmark,
          model5Benchmark,
          model6Target,
          vsModel4: transaction.duration - model4Benchmark,
          vsModel5: transaction.duration - model5Benchmark,
          vsModel6: transaction.duration - model6Target
        },
        keyFindings
      }
    };
  }

  /**
   * تولید گزارش Markdown
   */
  generateMarkdownReport(orderId: string, outputPath?: string): string {
    const report = this.generateDetailedReport(orderId);
    if (!report) {
      return `# خطا\n\nمعامله با ID ${orderId} پیدا نشد.`;
    }

    let md = `# گزارش تحلیل معامله - ${orderId}\n\n`;
    md += `**تاریخ:** ${new Date(report.transaction.timestamp).toLocaleString('fa-IR')}\n`;
    md += `**Order ID:** ${report.transaction.orderId}\n\n`;

    // خلاصه اجرایی
    md += `## 📋 خلاصه اجرایی\n\n`;
    md += `| فیلد | مقدار |\n`;
    md += `|------|-------|\n`;
    md += `| Order ID | ${report.transaction.orderId} |\n`;
    md += `| Model | ${report.transaction.model} |\n`;
    md += `| نماد | ${report.transaction.symbol} |\n`;
    md += `| نوع | ${report.transaction.side === 'buy' ? 'خرید' : 'فروش'} |\n`;
    md += `| قیمت | ${report.transaction.price} |\n`;
    md += `| تعداد | ${report.transaction.quantity} |\n`;
    md += `| زمان کل | ${report.transaction.duration}ms |\n`;
    md += `| وضعیت | ${report.transaction.success ? '✅ موفق' : '❌ ناموفق'} |\n\n`;

    // مقایسه با Benchmarks
    md += `### مقایسه با Benchmarks\n\n`;
    md += `| Model | Benchmark | زمان فعلی | تفاوت |\n`;
    md += `|-------|-----------|-----------|-------|\n`;
    md += `| Model 4 | ${report.summary.benchmarkComparison.model4Benchmark}ms | ${report.transaction.duration}ms | ${report.summary.benchmarkComparison.vsModel4 > 0 ? '+' : ''}${report.summary.benchmarkComparison.vsModel4}ms |\n`;
    md += `| Model 5 | ${report.summary.benchmarkComparison.model5Benchmark}ms | ${report.transaction.duration}ms | ${report.summary.benchmarkComparison.vsModel5 > 0 ? '+' : ''}${report.summary.benchmarkComparison.vsModel5}ms |\n`;
    md += `| Model 6 | ${report.summary.benchmarkComparison.model6Target}ms | ${report.transaction.duration}ms | ${report.summary.benchmarkComparison.vsModel6 > 0 ? '+' : ''}${report.summary.benchmarkComparison.vsModel6}ms |\n\n`;

    // Key Findings
    if (report.summary.keyFindings.length > 0) {
      md += `### 🔍 یافته‌های کلیدی\n\n`;
      report.summary.keyFindings.forEach(finding => {
        md += `- ${finding}\n`;
      });
      md += `\n`;
    }

    // Breakdown Timing
    md += `## ⏱️ Breakdown Timing\n\n`;
    md += `| Phase | زمان (ms) | درصد |\n`;
    md += `|-------|-----------|------|\n`;
    report.timingBreakdown.phases.forEach(phase => {
      md += `| ${phase.name} | ${phase.duration} | ${phase.percentage.toFixed(1)}% |\n`;
    });
    md += `| **Unaccounted Time** | ${report.timingBreakdown.unaccountedTime} | ${report.timingBreakdown.unaccountedPercentage.toFixed(1)}% |\n`;
    md += `| **Total** | ${report.timingBreakdown.totalDuration} | 100% |\n\n`;

    // Pie Chart
    md += `### نمودار توزیع زمان\n\n`;
    md += `\`\`\`mermaid\n`;
    md += `pie title توزیع زمان (ms)\n`;
    report.timingBreakdown.phases.forEach(phase => {
      if (phase.percentage > 1) { // فقط phases با بیش از 1%
        md += `  "${phase.name}" : ${phase.duration}\n`;
      }
    });
    if (report.timingBreakdown.unaccountedPercentage > 1) {
      md += `  "Unaccounted" : ${report.timingBreakdown.unaccountedTime}\n`;
    }
    md += `\`\`\`\n\n`;

    // Timeline
    md += `### Timeline\n\n`;
    md += `\`\`\`mermaid\n`;
    md += `gantt\n`;
    md += `  title Timeline معامله\n`;
    md += `  dateFormat X\n`;
    md += `  axisFormat %L ms\n`;
    let currentTime = 0;
    report.timingBreakdown.phases.forEach((phase, index) => {
      const phaseStart = phase.startTime - report.transaction.timestamp;
      const phaseEnd = phase.endTime - report.transaction.timestamp;
      md += `  ${phase.name.replace(/\s+/g, '_')} : ${phaseStart}, ${phase.duration}\n`;
      currentTime = phaseEnd;
    });
    md += `\`\`\`\n\n`;

    // Bottlenecks
    if (report.bottlenecks.length > 0) {
      md += `## ⚠️ Bottlenecks شناسایی شده\n\n`;
      report.bottlenecks.forEach((bottleneck, index) => {
        md += `### ${index + 1}. ${bottleneck.phase}\n\n`;
        md += `- **شدت:** ${bottleneck.severity === 'high' ? '🔴 بالا' : bottleneck.severity === 'medium' ? '🟡 متوسط' : '🟢 پایین'}\n`;
        md += `- **زمان:** ${bottleneck.duration}ms (${bottleneck.percentage.toFixed(1)}%)\n`;
        md += `- **توصیه:** ${bottleneck.recommendation}\n`;
        if (bottleneck.expectedImprovement) {
          md += `- **بهبود مورد انتظار:** ${bottleneck.expectedImprovement}\n`;
        }
        md += `\n`;
      });
    }

    // پیشنهادات بهینه‌سازی
    if (report.suggestions.length > 0) {
      md += `## 💡 پیشنهادات بهینه‌سازی\n\n`;
      report.suggestions.forEach((suggestion, index) => {
        md += `### ${index + 1}. ${suggestion.title}\n\n`;
        md += `- **اولویت:** ${suggestion.priority === 'high' ? '🔴 بالا' : suggestion.priority === 'medium' ? '🟡 متوسط' : '🟢 پایین'}\n`;
        md += `- **نوع:** ${this.getSuggestionTypeLabel(suggestion.type)}\n`;
        md += `- **توضیحات:** ${suggestion.description}\n`;
        md += `- **بهبود مورد انتظار:** ${suggestion.expectedImprovement}\n`;
        md += `- **پیاده‌سازی:** ${suggestion.implementation}\n`;
        if (suggestion.impact) {
          md += `- **تأثیر:** صرفه‌جویی ${suggestion.impact.timeSaved}ms (${suggestion.impact.percentageSaved}%)\n`;
        }
        md += `\n`;
      });
    }

    // مقایسه با Model 5/6
    md += `## 🔄 مقایسه با Model 5/6\n\n`;
    report.modelComparison.alternatives.forEach(alt => {
      md += `### ${alt.modelName}\n\n`;
      md += `| فیلد | مقدار |\n`;
      md += `|------|-------|\n`;
      md += `| زمان تخمینی | ${alt.estimatedDuration}ms |\n`;
      md += `| بهبود | ${alt.improvement}ms (${alt.improvementPercentage}%) |\n`;
      md += `| پیچیدگی Migration | ${alt.migrationComplexity === 'low' ? '🟢 پایین' : alt.migrationComplexity === 'medium' ? '🟡 متوسط' : '🔴 بالا'} |\n\n`;
      
      md += `**مزایا:**\n`;
      alt.pros.forEach(pro => {
        md += `- ✅ ${pro}\n`;
      });
      md += `\n`;
      
      md += `**معایب:**\n`;
      alt.cons.forEach(con => {
        md += `- ❌ ${con}\n`;
      });
      md += `\n`;
    });

    if (outputPath) {
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(outputPath, md, 'utf8');
    }

    return md;
  }

  /**
   * تولید گزارش JSON
   */
  generateJSONReport(orderId: string, outputPath?: string): string {
    const report = this.generateDetailedReport(orderId);
    if (!report) {
      return JSON.stringify({ error: `Transaction ${orderId} not found` }, null, 2);
    }

    const json = JSON.stringify(report, null, 2);

    if (outputPath) {
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(outputPath, json, 'utf8');
    }

    return json;
  }

  /**
   * Helper methods
   */
  private getSuggestionTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'model-migration': 'Migration Model',
      'code-optimization': 'بهینه‌سازی کد',
      'cache-enhancement': 'بهبود Cache',
      'verification-skip': 'حذف Verification',
      'wait-reduction': 'کاهش Wait',
      'parallel-operations': 'عملیات موازی'
    };
    return labels[type] || type;
  }

  private getRecommendation(phaseName: string): string {
    const recommendations: { [key: string]: string } = {
      'Browser Launch': 'استفاده از persistent browser context',
      'Page Navigation': 'کاهش waitForTimeout یا استفاده از API به جای UI',
      'Balance Reading (Before)': 'اجرای balance reading در background',
      'Buy Process (Selection + Panel + Fill + Submit)': 'Migration به Model 5 یا 6',
      'Balance Reading (After)': 'اجرای balance reading در background'
    };
    return recommendations[phaseName] || 'تحلیل بیشتر برای بهینه‌سازی';
  }

  private getExpectedImprovement(phaseName: string): string {
    const improvements: { [key: string]: string } = {
      'Page Navigation': 'کاهش 10000ms با کاهش wait',
      'Buy Process (Selection + Panel + Fill + Submit)': 'کاهش 95%+ با migration به API',
      'Balance Reading (Before)': 'کاهش overhead با background execution',
      'Balance Reading (After)': 'کاهش overhead با background execution'
    };
    return improvements[phaseName] || 'تحلیل بیشتر برای تخمین دقیق';
  }
}

