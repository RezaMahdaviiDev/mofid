import * as fs from 'fs';
import * as path from 'path';
import { LogAnalyzer, AnalysisResult } from './logAnalyzer';
import { logger } from '../core/advancedLogger';

interface PerformanceMetric {
  operation: string;
  duration: number;
  timestamp: number;
  cached?: boolean;
  requestId?: string;
}

interface PerformanceReport {
  date: string;
  summary: {
    totalOperations: number;
    averageDuration: number;
    minDuration: number;
    maxDuration: number;
    p50: number;
    p90: number;
    p95: number;
    p99: number;
  };
  operations: {
    [operation: string]: {
      count: number;
      averageDuration: number;
      minDuration: number;
      maxDuration: number;
      p50: number;
      p90: number;
      p95: number;
      p99: number;
      cacheHitRate?: number;
    };
  };
  bottlenecks: Array<{
    operation: string;
    averageDuration: number;
    percentageOfTotal: number;
  }>;
}

/**
 * Performance Reporter
 * تحلیل لاگ‌های performance و تولید گزارش
 */
export class PerformanceReporter {
  private logsDir: string;

  constructor(logsDir: string = 'logs') {
    this.logsDir = path.isAbsolute(logsDir) ? logsDir : path.join(process.cwd(), logsDir);
  }

  /**
   * خواندن لاگ‌های performance از فایل
   */
  private readPerformanceLogs(date?: string): PerformanceMetric[] {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const perfFile = path.join(this.logsDir, 'performance', `performance-${targetDate}.json`);
    const apiPhasesFile = path.join(this.logsDir, 'performance', `api-phases-${targetDate}.json`);

    const metrics: PerformanceMetric[] = [];

    // خواندن performance logs
    if (fs.existsSync(perfFile)) {
      const content = fs.readFileSync(perfFile, 'utf8');
      const lines = content.trim().split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        try {
          const entry = JSON.parse(line);
          if (entry.performance && entry.performance.operation && entry.performance.duration) {
            metrics.push({
              operation: entry.performance.operation,
              duration: entry.performance.duration,
              timestamp: entry.timestamp,
              cached: entry.data?.cached,
              requestId: entry.data?.requestId
            });
          }
        } catch (e) {
          // ignore parse errors
        }
      }
    }

    // خواندن api-phases logs
    if (fs.existsSync(apiPhasesFile)) {
      const content = fs.readFileSync(apiPhasesFile, 'utf8');
      const lines = content.trim().split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        try {
          const entry = JSON.parse(line);
          if (entry.performance && entry.performance.operation && entry.performance.duration) {
            metrics.push({
              operation: entry.performance.operation,
              duration: entry.performance.duration,
              timestamp: entry.timestamp,
              cached: entry.data?.cached,
              requestId: entry.data?.requestId
            });
          }
        } catch (e) {
          // ignore parse errors
        }
      }
    }

    return metrics;
  }

  /**
   * محاسبه percentiles
   */
  private calculatePercentiles(durations: number[]): { p50: number; p90: number; p95: number; p99: number } {
    if (durations.length === 0) {
      return { p50: 0, p90: 0, p95: 0, p99: 0 };
    }

    const sorted = [...durations].sort((a, b) => a - b);

    const percentile = (p: number) => {
      const index = Math.ceil((p / 100) * sorted.length) - 1;
      return sorted[Math.max(0, index)];
    };

    return {
      p50: percentile(50),
      p90: percentile(90),
      p95: percentile(95),
      p99: percentile(99)
    };
  }

  /**
   * تولید گزارش performance
   */
  generateReport(date?: string): PerformanceReport {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const metrics = this.readPerformanceLogs(targetDate);

    if (metrics.length === 0) {
      return {
        date: targetDate,
        summary: {
          totalOperations: 0,
          averageDuration: 0,
          minDuration: 0,
          maxDuration: 0,
          p50: 0,
          p90: 0,
          p95: 0,
          p99: 0
        },
        operations: {},
        bottlenecks: []
      };
    }

    // محاسبه آمار کلی
    const allDurations = metrics.map(m => m.duration);
    const avgDuration = allDurations.reduce((a, b) => a + b, 0) / allDurations.length;
    const percentiles = this.calculatePercentiles(allDurations);

    // گروه‌بندی بر اساس operation
    const operations: { [key: string]: PerformanceMetric[] } = {};
    for (const metric of metrics) {
      if (!operations[metric.operation]) {
        operations[metric.operation] = [];
      }
      operations[metric.operation].push(metric);
    }

    // محاسبه آمار برای هر operation
    const operationStats: { [key: string]: any } = {};
    for (const [operation, ops] of Object.entries(operations)) {
      const durations = ops.map(o => o.duration);
      const cached = ops.filter(o => o.cached === true).length;
      const total = ops.length;

      operationStats[operation] = {
        count: total,
        averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
        minDuration: Math.min(...durations),
        maxDuration: Math.max(...durations),
        ...this.calculatePercentiles(durations),
        cacheHitRate: total > 0 ? (cached / total) * 100 : 0
      };
    }

    // شناسایی bottlenecks (عملیات‌های با بیشترین average duration)
    const bottlenecks = Object.entries(operationStats)
      .map(([operation, stats]) => ({
        operation,
        averageDuration: stats.averageDuration,
        percentageOfTotal: (stats.averageDuration / avgDuration) * 100
      }))
      .sort((a, b) => b.averageDuration - a.averageDuration)
      .slice(0, 10); // 10 bottleneck اول

    return {
      date: targetDate,
      summary: {
        totalOperations: metrics.length,
        averageDuration: Math.round(avgDuration),
        minDuration: Math.min(...allDurations),
        maxDuration: Math.max(...allDurations),
        ...percentiles
      },
      operations: operationStats,
      bottlenecks
    };
  }

  /**
   * تولید گزارش JSON
   */
  generateJSONReport(date?: string, outputPath?: string): string {
    const report = this.generateReport(date);
    const json = JSON.stringify(report, null, 2);

    if (outputPath) {
      fs.writeFileSync(outputPath, json, 'utf8');
      logger.info('PerformanceReporter:generateJSONReport', 'Performance report saved', { outputPath });
    }

    return json;
  }

  /**
   * تولید گزارش Markdown
   */
  generateMarkdownReport(date?: string, outputPath?: string): string {
    const report = this.generateReport(date);
    let md = `# گزارش Performance - ${report.date}\n\n`;

    // Summary
    md += `## 📊 خلاصه\n\n`;
    md += `| متریک | مقدار |\n`;
    md += `|-------|-------|\n`;
    md += `| کل عملیات | ${report.summary.totalOperations} |\n`;
    md += `| میانگین زمان | ${report.summary.averageDuration}ms |\n`;
    md += `| کمترین زمان | ${report.summary.minDuration}ms |\n`;
    md += `| بیشترین زمان | ${report.summary.maxDuration}ms |\n`;
    md += `| P50 | ${report.summary.p50}ms |\n`;
    md += `| P90 | ${report.summary.p90}ms |\n`;
    md += `| P95 | ${report.summary.p95}ms |\n`;
    md += `| P99 | ${report.summary.p99}ms |\n\n`;

    // Operations
    if (Object.keys(report.operations).length > 0) {
      md += `## 🔧 عملیات‌ها\n\n`;
      md += `| عملیات | تعداد | میانگین | Min | Max | P50 | P90 | P95 | P99 | Cache Hit Rate |\n`;
      md += `|--------|-------|---------|-----|-----|-----|-----|-----|-----|----------------|\n`;
      
      for (const [operation, stats] of Object.entries(report.operations)) {
        md += `| ${operation} | ${stats.count} | ${stats.averageDuration.toFixed(0)}ms | ${stats.minDuration}ms | ${stats.maxDuration}ms | ${stats.p50}ms | ${stats.p90}ms | ${stats.p95}ms | ${stats.p99}ms | ${stats.cacheHitRate?.toFixed(1) || 'N/A'}% |\n`;
      }
      md += `\n`;
    }

    // Bottlenecks
    if (report.bottlenecks.length > 0) {
      md += `## ⚠️ Bottlenecks (عملیات‌های کند)\n\n`;
      md += `| عملیات | میانگین زمان | درصد از کل |\n`;
      md += `|--------|--------------|-----------|\n`;
      
      for (const bottleneck of report.bottlenecks) {
        md += `| ${bottleneck.operation} | ${bottleneck.averageDuration.toFixed(0)}ms | ${bottleneck.percentageOfTotal.toFixed(1)}% |\n`;
      }
      md += `\n`;
    }

    if (outputPath) {
      fs.writeFileSync(outputPath, md, 'utf8');
      logger.info('PerformanceReporter:generateMarkdownReport', 'Performance report saved', { outputPath });
    }

    return md;
  }

  /**
   * مقایسه قبل/بعد از بهینه‌سازی
   */
  compareReports(beforeDate: string, afterDate: string): string {
    const beforeReport = this.generateReport(beforeDate);
    const afterReport = this.generateReport(afterDate);

    let md = `# مقایسه Performance - قبل/بعد بهینه‌سازی\n\n`;
    md += `**قبل:** ${beforeDate}\n`;
    md += `**بعد:** ${afterDate}\n\n`;

    // مقایسه Summary
    md += `## 📊 مقایسه خلاصه\n\n`;
    md += `| متریک | قبل | بعد | تغییر | درصد تغییر |\n`;
    md += `|-------|-----|-----|-------|------------|\n`;
    
    const avgChange = afterReport.summary.averageDuration - beforeReport.summary.averageDuration;
    const avgChangePercent = beforeReport.summary.averageDuration > 0 
      ? ((avgChange / beforeReport.summary.averageDuration) * 100).toFixed(1)
      : '0';
    md += `| میانگین زمان | ${beforeReport.summary.averageDuration}ms | ${afterReport.summary.averageDuration}ms | ${avgChange >= 0 ? '+' : ''}${avgChange}ms | ${avgChangePercent}% |\n`;
    
    const p99Change = afterReport.summary.p99 - beforeReport.summary.p99;
    const p99ChangePercent = beforeReport.summary.p99 > 0
      ? ((p99Change / beforeReport.summary.p99) * 100).toFixed(1)
      : '0';
    md += `| P99 | ${beforeReport.summary.p99}ms | ${afterReport.summary.p99}ms | ${p99Change >= 0 ? '+' : ''}${p99Change}ms | ${p99ChangePercent}% |\n`;

    return md;
  }
}

export const performanceReporter = new PerformanceReporter();

