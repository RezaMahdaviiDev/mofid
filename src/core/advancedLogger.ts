import * as fs from 'fs';
import * as path from 'path';

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
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

export class AdvancedLogger {
  private logDir: string;
  private buyLogsDir: string;
  private performanceLogsDir: string;
  private errorLogsDir: string;
  private currentDate: string;

  constructor(logDir: string = 'logs') {
    // استفاده از process.cwd() برای اطمینان از مسیر root پروژه
    const rootDir = process.cwd();
    this.logDir = path.isAbsolute(logDir) ? logDir : path.join(rootDir, logDir);
    this.buyLogsDir = path.join(this.logDir, 'buy');
    this.performanceLogsDir = path.join(this.logDir, 'performance');
    this.errorLogsDir = path.join(this.logDir, 'errors');
    this.currentDate = new Date().toISOString().split('T')[0];
    
    // #region agent log
    try {
      const debugLogPath = path.join(rootDir, '.cursor', 'debug.log');
      const debugEntry = JSON.stringify({location:'advancedLogger.ts:constructor',message:'Logger initialized',data:{logDir:this.logDir,rootDir,buyLogsDir:this.buyLogsDir},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'}) + '\n';
      fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
    } catch (e) {}
    console.log('🔧 Logger initialized. LogDir:', this.logDir);
    // #endregion
    
    // ایجاد دایرکتوری‌ها
    this.ensureDirectories();
  }

  private ensureDirectories(): void {
    [this.logDir, this.buyLogsDir, this.performanceLogsDir, this.errorLogsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  private writeLog(entry: LogEntry, fileName: string, subDir?: string): void {
    try {
      const targetDir = subDir ? path.join(this.logDir, subDir) : this.logDir;
      
      // #region agent log
      try {
        const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
        const debugEntry = JSON.stringify({location:'advancedLogger.ts:writeLog',message:'Before writing log',data:{targetDir,fileName,subDir,exists:fs.existsSync(targetDir)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'}) + '\n';
        fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
      } catch (e) {}
      // #endregion
      
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
        
        // #region agent log
        try {
          const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
          const debugEntry = JSON.stringify({location:'advancedLogger.ts:writeLog',message:'Directory created',data:{targetDir},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'}) + '\n';
          fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
        } catch (e) {}
        // #endregion
      }
      
      const filePath = path.join(targetDir, fileName);
      const logLine = JSON.stringify(entry) + '\n';
      fs.appendFileSync(filePath, logLine, 'utf8');
      
      // #region agent log
      try {
        const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
        const debugEntry = JSON.stringify({location:'advancedLogger.ts:writeLog',message:'Log written successfully',data:{filePath,fileSize:fs.existsSync(filePath)?fs.statSync(filePath).size:0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'}) + '\n';
        fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
      } catch (e) {}
      // #endregion
    } catch (error: any) {
      console.error('❌ خطا در نوشتن لاگ:', error);
      
      // #region agent log
      try {
        const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
        const debugEntry = JSON.stringify({location:'advancedLogger.ts:writeLog',message:'Error writing log',data:{error:error?.message,stack:error?.stack,fileName,subDir},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'}) + '\n';
        fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
      } catch (e) {}
      // #endregion
    }
  }

  private createLogEntry(
    level: LogLevel,
    location: string,
    message: string,
    data?: any,
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      location,
      message,
      data
    };

    if (error) {
      entry.error = {
        message: error.message,
        stack: error.stack
      };
    }

    return entry;
  }

  debug(location: string, message: string, data?: any): void {
    // #region agent log
    try {
      const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
      const debugEntry = JSON.stringify({location:'advancedLogger.ts:debug',message:'Debug log called',data:{location,message,data},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'}) + '\n';
      fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
    } catch (e) {}
    // #endregion
    
    const entry = this.createLogEntry(LogLevel.DEBUG, location, message, data);
    this.writeLog(entry, `debug-${this.currentDate}.json`);
  }

  info(location: string, message: string, data?: any): void {
    // #region agent log
    try {
      const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
      const debugEntry = JSON.stringify({location:'advancedLogger.ts:info',message:'Info log called',data:{location,message,data},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'}) + '\n';
      fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
    } catch (e) {}
    // #endregion
    
    const entry = this.createLogEntry(LogLevel.INFO, location, message, data);
    this.writeLog(entry, `info-${this.currentDate}.json`);
    console.log(`[INFO] ${message}`, data || '');
  }

  warn(location: string, message: string, data?: any): void {
    const entry = this.createLogEntry(LogLevel.WARN, location, message, data);
    this.writeLog(entry, `warn-${this.currentDate}.json`);
    console.warn(`[WARN] ${message}`, data || '');
  }

  error(location: string, message: string, error?: Error, data?: any): void {
    const entry = this.createLogEntry(LogLevel.ERROR, location, message, data, error);
    this.writeLog(entry, `error-${this.currentDate}.json`, 'errors');
    console.error(`[ERROR] ${message}`, error || data || '');
  }

  logBuy(orderId: string, order: any, result: any, duration: number): void {
    // #region agent log
    try {
      const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
      const debugEntry = JSON.stringify({location:'advancedLogger.ts:logBuy',message:'logBuy called',data:{orderId,order,result,duration},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'}) + '\n';
      fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
    } catch (e) {}
    // #endregion
    
    const entry: LogEntry = {
      timestamp: Date.now(),
      level: LogLevel.INFO,
      location: 'buy-action',
      message: 'Buy order executed',
      data: {
        orderId,
        order,
        result,
        duration
      },
      performance: {
        operation: 'buy',
        duration
      }
    };
    
    const fileName = `buy-${orderId}-${Date.now()}.json`;
    this.writeLog(entry, fileName, 'buy');
  }

  logPerformance(operation: string, duration: number, data?: any): void {
    const entry: LogEntry = {
      timestamp: Date.now(),
      level: LogLevel.INFO,
      location: 'performance',
      message: `Performance: ${operation}`,
      data,
      performance: {
        operation,
        duration
      }
    };
    
    this.writeLog(entry, `performance-${this.currentDate}.json`, 'performance');
  }

  logFormValues(location: string, step: string, values: { price?: string; quantity?: string }, expected?: { price?: string; quantity?: string }): void {
    const entry = this.createLogEntry(LogLevel.DEBUG, location, `Form values at ${step}`, {
      step,
      values,
      expected,
      matches: expected ? 
        (values.price === expected.price && values.quantity === expected.quantity) : 
        undefined
    });
    
    this.writeLog(entry, `form-values-${this.currentDate}.json`);
  }

  logAPIRequest(url: string, method: string, requestData?: any, responseData?: any, status?: number): void {
    const entry = this.createLogEntry(LogLevel.INFO, 'api-request', `API ${method} ${url}`, {
      url,
      method,
      request: requestData,
      response: responseData,
      status
    });
    
    this.writeLog(entry, `api-${this.currentDate}.json`);
  }

  logBrowserState(location: string, state: { headless: boolean; url?: string; ready?: boolean }): void {
    const entry = this.createLogEntry(LogLevel.DEBUG, location, 'Browser state', state);
    this.writeLog(entry, `browser-${this.currentDate}.json`);
  }

  /**
   * لاگ‌گیری phase-by-phase برای API calls
   * @param phase - نام phase (مثلاً 'token-extraction', 'payload-prep')
   * @param duration - مدت زمان phase به میلی‌ثانیه
   * @param data - داده‌های اضافی
   * @param requestId - شناسه درخواست برای correlation
   * @param sessionId - شناسه session
   */
  logAPIPhase(phase: string, duration: number, data?: any, requestId?: string, sessionId?: string): void {
    const phaseData = {
      ...data,
      requestId: requestId || `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sessionId: sessionId || 'default',
      phase,
      duration
    };

    const entry: LogEntry = {
      timestamp: Date.now(),
      level: LogLevel.INFO,
      location: 'api-phase',
      message: `API Phase: ${phase}`,
      data: phaseData,
      performance: {
        operation: `api-phase-${phase}`,
        duration
      }
    };

    this.writeLog(entry, `api-phases-${this.currentDate}.json`, 'performance');
  }

  /**
   * لاگ‌گیری performance metrics با breakdown
   * @param operation - نام عملیات
   * @param metrics - metrics شامل duration breakdown
   * @param requestId - شناسه درخواست
   */
  logPerformanceMetric(
    operation: string,
    metrics: {
      totalDuration: number;
      tokenTime?: number;
      payloadTime?: number;
      requestTime?: number;
      verificationTime?: number;
      retryTime?: number;
      [key: string]: any;
    },
    requestId?: string
  ): void {
    const entry: LogEntry = {
      timestamp: Date.now(),
      level: LogLevel.INFO,
      location: 'performance-metric',
      message: `Performance Metric: ${operation}`,
      data: {
        ...metrics,
        requestId: requestId || `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        operation
      },
      performance: {
        operation,
        duration: metrics.totalDuration
      }
    };

    this.writeLog(entry, `performance-metrics-${this.currentDate}.json`, 'performance');
  }

  /**
   * تولید correlation ID برای tracking درخواست‌ها
   */
  generateCorrelationId(): string {
    return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton instance
export const logger = new AdvancedLogger();

