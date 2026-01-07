import { logger } from '../../../core/advancedLogger';

interface QueuedRequest {
  resolve: (value: void) => void;
  reject: (error: Error) => void;
  timestamp: number;
}

/**
 * Rate Limiter برای جلوگیری از rate limit
 * مدیریت درخواست‌ها با queue system
 */
export class RateLimiter {
  private queue: QueuedRequest[] = [];
  private lastRequestTime: number = 0;
  private readonly minInterval: number; // حداقل فاصله بین درخواست‌ها (ms)
  private readonly maxRequestsPerSecond: number;
  private processing: boolean = false;

  constructor(maxRequestsPerSecond: number = 10) {
    this.maxRequestsPerSecond = maxRequestsPerSecond;
    this.minInterval = 1000 / maxRequestsPerSecond; // مثلاً 100ms برای 10 requests/second
  }

  /**
   * انتظار برای اجازه ارسال درخواست (rate limiting)
   * @returns Promise که resolve می‌شود وقتی می‌توان درخواست ارسال کرد
   */
  async waitForPermission(): Promise<void> {
    const checkStartTime = Date.now();
    
    return new Promise((resolve, reject) => {
      // اضافه کردن به queue
      this.queue.push({
        resolve,
        reject,
        timestamp: Date.now()
      });

      logger.logAPIPhase('rate-limit-check', 0, {
        queueSize: this.queue.length,
        lastRequestTime: this.lastRequestTime
      });

      // شروع processing اگر در حال انجام نیست
      if (!this.processing) {
        this.processQueue();
      }
    }).then(() => {
      const checkDuration = Date.now() - checkStartTime;
      if (checkDuration > 0) {
        logger.logAPIPhase('rate-limit-delayed', checkDuration, {
          queueSize: this.queue.length
        });
      }
    });
  }

  /**
   * پردازش queue
   */
  private async processQueue(): Promise<void> {
    if (this.processing) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const request = this.queue.shift()!;
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      const waitTime = Math.max(0, this.minInterval - timeSinceLastRequest);

      logger.logAPIPhase('rate-limit-queue-size', 0, {
        queueSize: this.queue.length,
        waitTime
      });

      if (waitTime > 0) {
        // باید صبر کنیم
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }

      // اجازه ارسال درخواست
      this.lastRequestTime = Date.now();
      request.resolve();
    }

    this.processing = false;
  }

  /**
   * پاک کردن queue (در صورت نیاز)
   */
  clearQueue(): void {
    const clearedCount = this.queue.length;
    this.queue.forEach(req => {
      req.reject(new Error('Rate limiter queue cleared'));
    });
    this.queue = [];
    
    logger.info('RateLimiter:clearQueue', 'Queue cleared', {
      clearedCount
    });
  }

  /**
   * دریافت وضعیت فعلی
   */
  getStatus(): {
    queueSize: number;
    lastRequestTime: number;
    timeSinceLastRequest: number;
    processing: boolean;
  } {
    return {
      queueSize: this.queue.length,
      lastRequestTime: this.lastRequestTime,
      timeSinceLastRequest: Date.now() - this.lastRequestTime,
      processing: this.processing
    };
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter(10); // 10 requests/second

