import * as fs from 'fs';
import * as path from 'path';

export interface LogEntry {
  timestamp: number;
  level: string;
  location: string;
  message: string;
  data?: any;
  error?: {
    message: string;
    stack?: string;
  };
  performance?: {
    operation: string;
    duration: number;
  };
}

export interface BuyLogEntry extends LogEntry {
  data: {
    orderId: string;
    order: {
      symbol: string;
      price: string;
      quantity: string;
    };
    result: {
      success: boolean;
      duration: number;
      [key: string]: any;
    };
    duration: number;
  };
  performance: {
    operation: string;
    duration: number;
  };
}

export interface AnalysisResult {
  date: string;
  summary: {
    totalBuys: number;
    successfulBuys: number;
    failedBuys: number;
    successRate: number;
    averageDuration: number;
    minDuration: number;
    maxDuration: number;
  };
  buys: Array<{
    orderId: string;
    symbol: string;
    price: string;
    quantity: string;
    duration: number;
    success: boolean;
    timestamp: number;
  }>;
  errors: Array<{
    timestamp: number;
    location: string;
    message: string;
    error: string;
  }>;
  performance: Array<{
    operation: string;
    duration: number;
    timestamp: number;
  }>;
  models: {
    [model: string]: {
      count: number;
      averageDuration: number;
      successRate: number;
    };
  };
}

export class LogAnalyzer {
  private logsDir: string;

  constructor(logsDir: string = 'logs') {
    this.logsDir = path.isAbsolute(logsDir) ? logsDir : path.join(process.cwd(), logsDir);
  }

  /**
   * خواندن تمام لاگ‌های یک فایل JSON (NDJSON format)
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
          console.warn(`⚠️ خطا در parse کردن خط: ${line.substring(0, 50)}...`);
          return null;
        }
      }).filter((entry): entry is LogEntry => entry !== null);
    } catch (error) {
      console.error(`❌ خطا در خواندن فایل ${filePath}:`, error);
      return [];
    }
  }

  /**
   * تحلیل لاگ‌های خرید
   */
  analyzeBuyLogs(date?: string): BuyLogEntry[] {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const buyDir = path.join(this.logsDir, 'buy');

    if (!fs.existsSync(buyDir)) {
      return [];
    }

    const buyFiles = fs.readdirSync(buyDir)
      .filter(file => file.startsWith('buy-') && file.endsWith('.json'))
      .map(file => path.join(buyDir, file));

    const buyLogs: BuyLogEntry[] = [];

    for (const file of buyFiles) {
      const entries = this.readLogFile(file);
      for (const entry of entries) {
        if (entry.location === 'buy-action' && entry.data?.orderId) {
          buyLogs.push(entry as BuyLogEntry);
        }
      }
    }

    return buyLogs;
  }

  /**
   * تحلیل لاگ‌های خطا
   */
  analyzeErrorLogs(date?: string): LogEntry[] {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const errorFile = path.join(this.logsDir, 'errors', `error-${targetDate}.json`);

    return this.readLogFile(errorFile).filter(entry => entry.level === 'ERROR' || entry.error);
  }

  /**
   * تحلیل لاگ‌های عملکرد
   */
  analyzePerformanceLogs(date?: string): LogEntry[] {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const perfFile = path.join(this.logsDir, 'performance', `performance-${targetDate}.json`);

    return this.readLogFile(perfFile).filter(entry => entry.performance);
  }

  /**
   * تحلیل کامل لاگ‌های یک روز
   */
  analyze(date?: string): AnalysisResult {
    const targetDate = date || new Date().toISOString().split('T')[0];

    const buyLogs = this.analyzeBuyLogs(targetDate);
    const errorLogs = this.analyzeErrorLogs(targetDate);
    const perfLogs = this.analyzePerformanceLogs(targetDate);

    // محاسبه آمار خریدها
    const successfulBuys = buyLogs.filter(b => b.data?.result?.success !== false);
    const failedBuys = buyLogs.filter(b => b.data?.result?.success === false);
    const durations = buyLogs.map(b => b.data?.duration || 0).filter(d => d > 0);

    const averageDuration = durations.length > 0
      ? durations.reduce((a, b) => a + b, 0) / durations.length
      : 0;

    const minDuration = durations.length > 0 ? Math.min(...durations) : 0;
    const maxDuration = durations.length > 0 ? Math.max(...durations) : 0;

    // تحلیل بر اساس مدل
    const models: { [key: string]: { count: number; durations: number[]; successes: number } } = {};
    
    // خواندن لاگ‌های INFO برای پیدا کردن مدل‌ها
    const infoFile = path.join(this.logsDir, `info-${targetDate}.json`);
    const infoLogs = this.readLogFile(infoFile);
    
    for (const infoLog of infoLogs) {
      if (infoLog.message === 'Buy completed successfully' && infoLog.data?.model) {
        const model = `Model ${infoLog.data.model}`;
        if (!models[model]) {
          models[model] = { count: 0, durations: [], successes: 0 };
        }
        models[model].count++;
        if (infoLog.data.duration) {
          models[model].durations.push(infoLog.data.duration);
        }
        if (infoLog.data.order) {
          models[model].successes++;
        }
      }
    }

    const modelStats: { [key: string]: { count: number; averageDuration: number; successRate: number } } = {};
    for (const [model, stats] of Object.entries(models)) {
      modelStats[model] = {
        count: stats.count,
        averageDuration: stats.durations.length > 0
          ? stats.durations.reduce((a, b) => a + b, 0) / stats.durations.length
          : 0,
        successRate: stats.count > 0 ? (stats.successes / stats.count) * 100 : 0
      };
    }

    return {
      date: targetDate,
      summary: {
        totalBuys: buyLogs.length,
        successfulBuys: successfulBuys.length,
        failedBuys: failedBuys.length,
        successRate: buyLogs.length > 0 ? (successfulBuys.length / buyLogs.length) * 100 : 0,
        averageDuration: Math.round(averageDuration),
        minDuration,
        maxDuration
      },
      buys: buyLogs.map(b => ({
        orderId: b.data?.orderId || 'unknown',
        symbol: b.data?.order?.symbol || 'unknown',
        price: b.data?.order?.price || '0',
        quantity: b.data?.order?.quantity || '0',
        duration: b.data?.duration || 0,
        success: b.data?.result?.success !== false,
        timestamp: b.timestamp
      })),
      errors: errorLogs.map(e => ({
        timestamp: e.timestamp,
        location: e.location,
        message: e.message,
        error: e.error?.message || e.data?.error || 'Unknown error'
      })),
      performance: perfLogs.map(p => ({
        operation: p.performance?.operation || 'unknown',
        duration: p.performance?.duration || 0,
        timestamp: p.timestamp
      })),
      models: modelStats
    };
  }

  /**
   * تولید گزارش JSON
   */
  generateJSONReport(date?: string, outputPath?: string): string {
    const analysis = this.analyze(date);
    const report = JSON.stringify(analysis, null, 2);

    if (outputPath) {
      fs.writeFileSync(outputPath, report, 'utf8');
      console.log(`✅ گزارش JSON در ${outputPath} ذخیره شد`);
    }

    return report;
  }

  /**
   * تولید گزارش Markdown
   */
  generateMarkdownReport(date?: string, outputPath?: string): string {
    const analysis = this.analyze(date);
    const targetDate = date || new Date().toISOString().split('T')[0];

    let markdown = `# گزارش تحلیل لاگ‌ها - ${targetDate}\n\n`;
    markdown += `**تاریخ:** ${targetDate}\n\n`;

    // خلاصه
    markdown += `## 📊 خلاصه\n\n`;
    markdown += `| متریک | مقدار |\n`;
    markdown += `|-------|-------|\n`;
    markdown += `| کل خریدها | ${analysis.summary.totalBuys} |\n`;
    markdown += `| خریدهای موفق | ${analysis.summary.successfulBuys} |\n`;
    markdown += `| خریدهای ناموفق | ${analysis.summary.failedBuys} |\n`;
    markdown += `| نرخ موفقیت | ${analysis.summary.successRate.toFixed(2)}% |\n`;
    markdown += `| میانگین زمان | ${analysis.summary.averageDuration}ms |\n`;
    markdown += `| کمترین زمان | ${analysis.summary.minDuration}ms |\n`;
    markdown += `| بیشترین زمان | ${analysis.summary.maxDuration}ms |\n\n`;

    // آمار مدل‌ها
    if (Object.keys(analysis.models).length > 0) {
      markdown += `## 🚀 آمار مدل‌ها\n\n`;
      markdown += `| مدل | تعداد | میانگین زمان | نرخ موفقیت |\n`;
      markdown += `|-----|-------|--------------|------------|\n`;
      for (const [model, stats] of Object.entries(analysis.models)) {
        markdown += `| ${model} | ${stats.count} | ${stats.averageDuration.toFixed(0)}ms | ${stats.successRate.toFixed(2)}% |\n`;
      }
      markdown += `\n`;
    }

    // لیست خریدها
    if (analysis.buys.length > 0) {
      markdown += `## 📝 لیست خریدها\n\n`;
      markdown += `| Order ID | نماد | قیمت | تعداد | زمان | وضعیت |\n`;
      markdown += `|----------|------|------|-------|------|--------|\n`;
      for (const buy of analysis.buys) {
        const status = buy.success ? '✅ موفق' : '❌ ناموفق';
        markdown += `| ${buy.orderId} | ${buy.symbol} | ${buy.price} | ${buy.quantity} | ${buy.duration}ms | ${status} |\n`;
      }
      markdown += `\n`;
    }

    // خطاها
    if (analysis.errors.length > 0) {
      markdown += `## ❌ خطاها\n\n`;
      for (const error of analysis.errors) {
        const errorDate = new Date(error.timestamp).toLocaleString('fa-IR');
        markdown += `### ${errorDate}\n\n`;
        markdown += `- **موقعیت:** ${error.location}\n`;
        markdown += `- **پیام:** ${error.message}\n`;
        markdown += `- **خطا:** ${error.error}\n\n`;
      }
    }

    // عملکرد
    if (analysis.performance.length > 0) {
      markdown += `## ⚡ عملکرد\n\n`;
      markdown += `| عملیات | زمان |\n`;
      markdown += `|--------|------|\n`;
      for (const perf of analysis.performance.slice(0, 20)) { // فقط 20 مورد اول
        markdown += `| ${perf.operation} | ${perf.duration}ms |\n`;
      }
      if (analysis.performance.length > 20) {
        markdown += `\n*و ${analysis.performance.length - 20} مورد دیگر...*\n`;
      }
      markdown += `\n`;
    }

    if (outputPath) {
      fs.writeFileSync(outputPath, markdown, 'utf8');
      console.log(`✅ گزارش Markdown در ${outputPath} ذخیره شد`);
    }

    return markdown;
  }
}




