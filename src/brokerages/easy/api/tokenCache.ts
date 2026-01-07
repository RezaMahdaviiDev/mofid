import * as fs from 'fs';
import * as path from 'path';
import { logger } from '../../../core/advancedLogger';

interface CachedToken {
  headers: Record<string, string>;
  timestamp: number;
  expiresAt: number;
}

/**
 * Token Cache Manager
 * مدیریت cache توکن با ذخیره persistent و background refresh
 */
export class TokenCache {
  private cacheFile: string;
  private readonly TTL = 2 * 60 * 60 * 1000; // 2 ساعت
  private readonly REFRESH_BEFORE_EXPIRE = 10 * 60 * 1000; // 10 دقیقه قبل از expire
  private refreshTimer: NodeJS.Timeout | null = null;

  constructor(cacheDir: string = '.user-data') {
    const rootDir = process.cwd();
    const cacheDirPath = path.join(rootDir, cacheDir, 'easy');
    
    // ایجاد دایرکتوری cache در صورت عدم وجود
    if (!fs.existsSync(cacheDirPath)) {
      fs.mkdirSync(cacheDirPath, { recursive: true });
    }
    
    this.cacheFile = path.join(cacheDirPath, 'token-cache.json');
  }

  /**
   * دریافت توکن از cache
   * @returns توکن cached یا null در صورت عدم وجود یا expire
   */
  get(): Record<string, string> | null {
    try {
      if (!fs.existsSync(this.cacheFile)) {
        logger.logAPIPhase('api-token-cache-check', 0, { hit: false, reason: 'file-not-found' });
        return null;
      }

      const cacheStartTime = Date.now();
      const content = fs.readFileSync(this.cacheFile, 'utf8');
      const cached: CachedToken = JSON.parse(content);
      
      const checkDuration = Date.now() - cacheStartTime;

      // بررسی expire
      const now = Date.now();
      if (now >= cached.expiresAt) {
        logger.logAPIPhase('api-token-cache-check', checkDuration, { 
          hit: false, 
          reason: 'expired',
          age: now - cached.timestamp
        });
        // پاک کردن cache expire شده
        this.clear();
        return null;
      }

      // بررسی نیاز به refresh
      const timeUntilExpire = cached.expiresAt - now;
      const needsRefresh = timeUntilExpire <= this.REFRESH_BEFORE_EXPIRE;

      logger.logAPIPhase('api-token-cache-check', checkDuration, { 
        hit: true, 
        needsRefresh,
        timeUntilExpire,
        age: now - cached.timestamp
      });

      return cached.headers;
    } catch (error: any) {
      logger.warn('TokenCache:get', 'Failed to read token cache', { error: error.message });
      return null;
    }
  }

  /**
   * ذخیره توکن در cache
   * @param headers - هدرهای احراز هویت
   */
  set(headers: Record<string, string>): void {
    try {
      const setStartTime = Date.now();
      
      const cached: CachedToken = {
        headers: { ...headers }, // copy برای جلوگیری از mutation
        timestamp: Date.now(),
        expiresAt: Date.now() + this.TTL
      };

      fs.writeFileSync(this.cacheFile, JSON.stringify(cached, null, 2), 'utf8');
      
      const setDuration = Date.now() - setStartTime;
      
      logger.logAPIPhase('api-token-cache-set', setDuration, {
        expiresAt: cached.expiresAt,
        ttl: this.TTL
      });

      // تنظیم background refresh timer
      this.scheduleRefresh();
    } catch (error: any) {
      logger.error('TokenCache:set', 'Failed to save token cache', error, {
        cacheFile: this.cacheFile
      });
    }
  }

  /**
   * پاک کردن cache
   */
  clear(): void {
    try {
      if (fs.existsSync(this.cacheFile)) {
        fs.unlinkSync(this.cacheFile);
        logger.info('TokenCache:clear', 'Token cache cleared');
      }

      // متوقف کردن refresh timer
      if (this.refreshTimer) {
        clearTimeout(this.refreshTimer);
        this.refreshTimer = null;
      }
    } catch (error: any) {
      logger.warn('TokenCache:clear', 'Failed to clear token cache', { error: error.message });
    }
  }

  /**
   * بررسی اعتبار cache
   */
  isValid(): boolean {
    const token = this.get();
    return token !== null;
  }

  /**
   * دریافت زمان expire
   */
  getExpiresAt(): number | null {
    try {
      if (!fs.existsSync(this.cacheFile)) {
        return null;
      }

      const content = fs.readFileSync(this.cacheFile, 'utf8');
      const cached: CachedToken = JSON.parse(content);
      return cached.expiresAt;
    } catch {
      return null;
    }
  }

  /**
   * تنظیم timer برای background refresh
   */
  private scheduleRefresh(): void {
    // پاک کردن timer قبلی
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    const expiresAt = this.getExpiresAt();
    if (!expiresAt) {
      return;
    }

    const now = Date.now();
    const timeUntilRefresh = expiresAt - now - this.REFRESH_BEFORE_EXPIRE;

    if (timeUntilRefresh > 0) {
      this.refreshTimer = setTimeout(() => {
        logger.info('TokenCache:scheduleRefresh', 'Token refresh needed - cache will expire soon', {
          expiresAt,
          timeUntilExpire: expiresAt - Date.now()
        });
        // Signal برای refresh (باید از خارج فراخوانی شود)
      }, timeUntilRefresh);
    }
  }

  /**
   * دریافت اطلاعات cache
   */
  getInfo(): { exists: boolean; expiresAt: number | null; isValid: boolean; age: number | null } {
    const exists = fs.existsSync(this.cacheFile);
    const expiresAt = this.getExpiresAt();
    const isValid = this.isValid();
    
    let age: number | null = null;
    if (exists && expiresAt) {
      try {
        const content = fs.readFileSync(this.cacheFile, 'utf8');
        const cached: CachedToken = JSON.parse(content);
        age = Date.now() - cached.timestamp;
      } catch {
        age = null;
      }
    }

    return { exists, expiresAt, isValid, age };
  }
}

// Singleton instance
export const tokenCache = new TokenCache();
