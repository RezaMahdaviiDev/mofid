import * as fs from 'fs';
import * as path from 'path';
import { LogEntry } from '../core/advancedLogger';

export interface LogReaderOptions {
  limit?: number;
  types?: string[]; // 'buy', 'info', 'warn', 'error', 'performance'
  logDir?: string;
}

export interface LogStats {
  totalLogs: number;
  byType: {
    buy: number;
    info: number;
    warn: number;
    error: number;
    performance: number;
  };
  latestLog?: LogEntry;
  oldestLog?: LogEntry;
}

/**
 * خواندن آخرین لاگ‌ها از فایل‌های JSON
 */
export function readRecentLogs(options: LogReaderOptions = {}): LogEntry[] {
  const {
    limit = 50,
    types = ['buy', 'info', 'warn', 'error', 'performance'],
    logDir = 'logs'
  } = options;

  const rootDir = process.cwd();
  const logsPath = path.isAbsolute(logDir) ? logDir : path.join(rootDir, logDir);
  
  if (!fs.existsSync(logsPath)) {
    return [];
  }

  const allLogs: LogEntry[] = [];
  const today = new Date().toISOString().split('T')[0];

  // خواندن لاگ‌های info
  if (types.includes('info')) {
    const infoFile = path.join(logsPath, `info-${today}.json`);
    if (fs.existsSync(infoFile)) {
      const lines = fs.readFileSync(infoFile, 'utf8').split('\n').filter(line => line.trim());
      lines.forEach(line => {
        try {
          const entry = JSON.parse(line) as LogEntry;
          allLogs.push(entry);
        } catch (e) {
          // خطا در parse - نادیده می‌گیریم
        }
      });
    }
  }

  // خواندن لاگ‌های warn
  if (types.includes('warn')) {
    const warnFile = path.join(logsPath, `warn-${today}.json`);
    if (fs.existsSync(warnFile)) {
      const lines = fs.readFileSync(warnFile, 'utf8').split('\n').filter(line => line.trim());
      lines.forEach(line => {
        try {
          const entry = JSON.parse(line) as LogEntry;
          allLogs.push(entry);
        } catch (e) {
          // خطا در parse - نادیده می‌گیریم
        }
      });
    }
  }

  // خواندن لاگ‌های error
  if (types.includes('error')) {
    const errorFile = path.join(logsPath, `error-${today}.json`);
    if (fs.existsSync(errorFile)) {
      const lines = fs.readFileSync(errorFile, 'utf8').split('\n').filter(line => line.trim());
      lines.forEach(line => {
        try {
          const entry = JSON.parse(line) as LogEntry;
          allLogs.push(entry);
        } catch (e) {
          // خطا در parse - نادیده می‌گیریم
        }
      });
    }
  }

  // خواندن لاگ‌های performance
  if (types.includes('performance')) {
    const perfDir = path.join(logsPath, 'performance');
    if (fs.existsSync(perfDir)) {
      const perfFile = path.join(perfDir, `performance-${today}.json`);
      if (fs.existsSync(perfFile)) {
        const lines = fs.readFileSync(perfFile, 'utf8').split('\n').filter(line => line.trim());
        lines.forEach(line => {
          try {
            const entry = JSON.parse(line) as LogEntry;
            allLogs.push(entry);
          } catch (e) {
            // خطا در parse - نادیده می‌گیریم
          }
        });
      }
    }
  }

  // خواندن لاگ‌های buy
  if (types.includes('buy')) {
    const buyDir = path.join(logsPath, 'buy');
    if (fs.existsSync(buyDir)) {
      const files = fs.readdirSync(buyDir).filter(f => f.endsWith('.json'));
      // خواندن آخرین فایل‌های buy (حداکثر 10 فایل اخیر)
      const sortedFiles = files
        .map(f => ({
          name: f,
          path: path.join(buyDir, f),
          mtime: fs.statSync(path.join(buyDir, f)).mtime.getTime()
        }))
        .sort((a, b) => b.mtime - a.mtime)
        .slice(0, 10);

      sortedFiles.forEach(file => {
        try {
          const content = fs.readFileSync(file.path, 'utf8');
          const entry = JSON.parse(content) as LogEntry;
          allLogs.push(entry);
        } catch (e) {
          // خطا در parse - نادیده می‌گیریم
        }
      });
    }
  }

  // مرتب‌سازی بر اساس timestamp (جدیدترین اول)
  allLogs.sort((a, b) => b.timestamp - a.timestamp);

  // برگرداندن آخرین N لاگ
  return allLogs.slice(0, limit);
}

/**
 * دریافت آمار کلی لاگ‌ها
 */
export function getLogStats(logDir: string = 'logs'): LogStats {
  const rootDir = process.cwd();
  const logsPath = path.isAbsolute(logDir) ? logDir : path.join(rootDir, logDir);
  
  const stats: LogStats = {
    totalLogs: 0,
    byType: {
      buy: 0,
      info: 0,
      warn: 0,
      error: 0,
      performance: 0
    }
  };

  if (!fs.existsSync(logsPath)) {
    return stats;
  }

  const today = new Date().toISOString().split('T')[0];
  const allLogs: LogEntry[] = [];

  // شمارش لاگ‌های info
  const infoFile = path.join(logsPath, `info-${today}.json`);
  if (fs.existsSync(infoFile)) {
    const lines = fs.readFileSync(infoFile, 'utf8').split('\n').filter(line => line.trim());
    stats.byType.info = lines.length;
    lines.forEach(line => {
      try {
        allLogs.push(JSON.parse(line) as LogEntry);
      } catch (e) {}
    });
  }

  // شمارش لاگ‌های warn
  const warnFile = path.join(logsPath, `warn-${today}.json`);
  if (fs.existsSync(warnFile)) {
    const lines = fs.readFileSync(warnFile, 'utf8').split('\n').filter(line => line.trim());
    stats.byType.warn = lines.length;
    lines.forEach(line => {
      try {
        allLogs.push(JSON.parse(line) as LogEntry);
      } catch (e) {}
    });
  }

  // شمارش لاگ‌های error
  const errorFile = path.join(logsPath, `error-${today}.json`);
  if (fs.existsSync(errorFile)) {
    const lines = fs.readFileSync(errorFile, 'utf8').split('\n').filter(line => line.trim());
    stats.byType.error = lines.length;
    lines.forEach(line => {
      try {
        allLogs.push(JSON.parse(line) as LogEntry);
      } catch (e) {}
    });
  }

  // شمارش لاگ‌های performance
  const perfDir = path.join(logsPath, 'performance');
  if (fs.existsSync(perfDir)) {
    const perfFile = path.join(perfDir, `performance-${today}.json`);
    if (fs.existsSync(perfFile)) {
      const lines = fs.readFileSync(perfFile, 'utf8').split('\n').filter(line => line.trim());
      stats.byType.performance = lines.length;
      lines.forEach(line => {
        try {
          allLogs.push(JSON.parse(line) as LogEntry);
        } catch (e) {}
      });
    }
  }

  // شمارش لاگ‌های buy
  const buyDir = path.join(logsPath, 'buy');
  if (fs.existsSync(buyDir)) {
    const files = fs.readdirSync(buyDir).filter(f => f.endsWith('.json'));
    stats.byType.buy = files.length;
    files.forEach(file => {
      try {
        const content = fs.readFileSync(path.join(buyDir, file), 'utf8');
        allLogs.push(JSON.parse(content) as LogEntry);
      } catch (e) {}
    });
  }

  stats.totalLogs = allLogs.length;

  // پیدا کردن آخرین و قدیمی‌ترین لاگ
  if (allLogs.length > 0) {
    allLogs.sort((a, b) => b.timestamp - a.timestamp);
    stats.latestLog = allLogs[0];
    stats.oldestLog = allLogs[allLogs.length - 1];
  }

  return stats;
}

