import { Page, APIResponse } from 'playwright';
import { Settings } from '../../../config/settings';
import { logger } from '../../../core/advancedLogger';
import { APIError, OMSError } from './types';
import { tokenCache } from './tokenCache';
import { rateLimiter } from './rateLimiter';

/**
 * API Client برای ارتباط با EasyTrader API
 * این کلاس مدیریت احراز هویت، ارسال درخواست‌ها و مدیریت خطاها را انجام می‌دهد
 */
export class EasyTraderAPIClient {
  private page: Page;
  private cachedHeaders: Record<string, string> | null = null;
  private cacheTimestamp: number | null = null;
  private readonly CACHE_TTL = 30 * 60 * 1000; // 30 دقیقه (in-memory cache)
  private requestId: string;

  /**
   * سازنده کلاینت API
   * @param page - صفحه Playwright برای انجام درخواست‌ها
   */
  constructor(page: Page) {
    this.page = page;
    this.requestId = logger.generateCorrelationId();
  }

  /**
   * دریافت هدرهای معتبر از ترافیک شبکه با استفاده از page.route()
   * این متد از route interception استفاده می‌کند تا توکن را از درخواست‌های واقعی استخراج کند
   * 
   * @returns Promise با هدرهای احراز هویت
   * @throws {Error} در صورت عدم موفقیت در استخراج توکن
   */
  async getAuthHeaders(): Promise<Record<string, string>> {
    const tokenStartTime = Date.now();

    // 1. بررسی persistent cache (اولویت اول)
    const cachedToken = tokenCache.get();
    if (cachedToken) {
      const cacheDuration = Date.now() - tokenStartTime;
      logger.logAPIPhase('api-token-extraction', cacheDuration, {
        cached: true,
        method: 'persistent-cache',
        requestId: this.requestId
      });
      
      // هم cache در-memory و هم persistent cache را set می‌کنیم
      this.cachedHeaders = cachedToken;
      this.cacheTimestamp = Date.now();
      
      return cachedToken;
    }

    // 2. بررسی in-memory cache
    if (this.cachedHeaders && this.cacheTimestamp) {
      const cacheAge = Date.now() - this.cacheTimestamp;
      if (cacheAge < this.CACHE_TTL) {
        const cacheDuration = Date.now() - tokenStartTime;
        logger.logAPIPhase('api-token-extraction', cacheDuration, {
          cached: true,
          method: 'in-memory-cache',
          requestId: this.requestId
        });
        return this.cachedHeaders;
      } else {
        // Cache منقضی شده، پاک می‌کنیم
        this.clearAuthCache();
      }
    }

    // 3. استخراج از شبکه
    logger.logAPIPhase('api-token-extraction-start', 0, {
      cached: false,
      method: 'network',
      requestId: this.requestId
    });

    console.log('🕵️ در حال استخراج توکن احراز هویت با page.route()...');
    
    // استفاده از page.route() برای intercept کردن درخواست‌ها
    let capturedHeaders: Record<string, string> | null = null;
    
    const routeHandler = async (route: any) => {
      const request = route.request();
      const url = request.url();
      const headers = request.headers();
      
      // بررسی اینکه آیا این درخواست به API اصلی است و توکن دارد
      if (url.includes('api-mts.orbis.easytrader.ir') && 
          url.includes('/api/v2/') &&
          request.method() !== 'OPTIONS' &&
          (headers['authorization'] || headers['Authorization'])) {
        
        if (!capturedHeaders) {
          capturedHeaders = { ...headers };
          console.log('✅ توکن از درخواست API استخراج شد:', url);
        }
      }
      
      // ادامه درخواست
      await route.continue();
    };
    
    // فعال کردن route interception
    await this.page.route('**/*', routeHandler);
    
    try {
      // منتظر می‌مانیم تا یک درخواست با توکن پیدا شود (timeout کاهش یافته)
      console.log('⏳ منتظر درخواست API با توکن...');
      
      const networkWaitStart = Date.now();
      
      // استفاده از Promise.race برای timeout کوتاه‌تر
      const requestPromise = this.page.waitForRequest(
        req => {
          const url = req.url();
          const headers = req.headers();
          return url.includes('api-mts.orbis.easytrader.ir') && 
                 url.includes('/api/v2/') &&
                 req.method() !== 'OPTIONS' &&
                 !!(headers['authorization'] || headers['Authorization']);
        },
        { timeout: 2000 } // کاهش از 10000ms به 2000ms
      );

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Token extraction timeout')), 2000)
      );

      await Promise.race([requestPromise, timeoutPromise]);
      
      const networkWaitDuration = Date.now() - networkWaitStart;
      logger.logAPIPhase('api-token-extraction-network-wait', networkWaitDuration, {
        requestId: this.requestId
      });
      
      // حذف waitForTimeout - route handler باید بلافاصله اجرا شود
      // اگر route handler اجرا نشده باشد، capturedHeaders null خواهد بود
      
      // غیرفعال کردن route interception
      await this.page.unroute('**/*', routeHandler);
      
      if (capturedHeaders) {
        const captureStart = Date.now();
        const headers = capturedHeaders;
      
        console.log('🔑 هدرهای موجود:', Object.keys(headers).filter(k => 
          k.toLowerCase().includes('auth') || 
          k.toLowerCase().includes('token') ||
          k.toLowerCase().includes('cookie')
        ));
        
        // فیلتر کردن هدرهای مهم
        const authHeaders: Record<string, string> = {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'fa',
          'Referer': 'https://d.easytrader.ir/',
          'Origin': 'https://d.easytrader.ir'
        };

        // کپی کردن توکن Authorization اگر وجود داشته باشد
        if (headers['authorization']) {
          authHeaders['Authorization'] = headers['authorization'];
          console.log('✅ توکن Authorization استخراج شد (lowercase).');
        } else if (headers['Authorization']) {
          authHeaders['Authorization'] = headers['Authorization'];
          console.log('✅ توکن Authorization استخراج شد (uppercase).');
        } else {
          console.warn('⚠️ توکن Authorization در هدرها پیدا نشد.');
          // تلاش برای استخراج از کوکی‌ها
          const cookies = await this.page.context().cookies();
          if (cookies.length > 0) {
            const cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ');
            authHeaders['Cookie'] = cookieString;
            console.log('✅ کوکی‌ها اضافه شدند.');
          }
        }
        
        // کپی کردن سایر هدرهای احتمالی امنیتی
        if (headers['x-requested-with']) authHeaders['X-Requested-With'] = headers['x-requested-with'];
        if (headers['x-csrf-token']) authHeaders['X-CSRF-Token'] = headers['x-csrf-token'];
        if (headers['cookie'] && !authHeaders['Cookie']) {
          authHeaders['Cookie'] = headers['cookie'];
        }
        
        const captureDuration = Date.now() - captureStart;
        logger.logAPIPhase('api-token-extraction-capture', captureDuration, {
          requestId: this.requestId
        });
        
        // Cache کردن headers (هم in-memory و هم persistent)
        this.cachedHeaders = authHeaders;
        this.cacheTimestamp = Date.now();
        tokenCache.set(authHeaders); // ذخیره در persistent cache
        
        const totalDuration = Date.now() - tokenStartTime;
        logger.logAPIPhase('api-token-extraction-success', totalDuration, {
          method: 'network',
          requestId: this.requestId
        });
        
        return authHeaders;
      } else {
        throw new Error('توکن پیدا نشد');
      }

    } catch (e: any) {
      // غیرفعال کردن route interception در صورت خطا
      try {
        await this.page.unroute('**/*', routeHandler);
      } catch {}
      
      const totalDuration = Date.now() - tokenStartTime;
      logger.logAPIPhase('api-token-extraction-failed', totalDuration, {
        error: e.message,
        requestId: this.requestId
      });
      
      logger.warn('EasyTraderAPIClient:getAuthHeaders', 'Failed to extract headers from network', { error: e.message });
      console.warn('⚠️ نتوانستیم هدرها را از شبکه استخراج کنیم:', e.message);
      console.warn('💡 از هدرهای پیش‌فرض + کوکی‌ها استفاده می‌شود.');
      
      // تلاش برای استفاده از کوکی‌های موجود
      const cookies = await this.page.context().cookies();
      const defaultHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://d.easytrader.ir/',
        'Origin': 'https://d.easytrader.ir'
      };
      
      if (cookies.length > 0) {
        defaultHeaders['Cookie'] = cookies.map(c => `${c.name}=${c.value}`).join('; ');
        console.log('✅ کوکی‌ها اضافه شدند (fallback).');
      }
      
      // Cache کردن headers fallback با timestamp (اما persistent cache نمی‌کنیم چون fallback است)
      this.cachedHeaders = defaultHeaders;
      this.cacheTimestamp = Date.now();
      return defaultHeaders;
    }
  }

  /**
   * پاک کردن cache هدرها (برای استفاده مجدد)
   */
  clearAuthCache(): void {
    this.cachedHeaders = null;
    this.cacheTimestamp = null;
  }

  /**
   * بررسی اعتبار cache
   * @returns true اگر cache معتبر باشد
   */
  isCacheValid(): boolean {
    if (!this.cachedHeaders || !this.cacheTimestamp) {
      return false;
    }
    const cacheAge = Date.now() - this.cacheTimestamp;
    return cacheAge < this.CACHE_TTL;
  }

  /**
   * متد عمومی برای ارسال درخواست‌های HTTP
   * @param url - آدرس کامل API
   * @param method - متد HTTP (GET, POST, ...)
   * @param data - داده‌های بدنه درخواست (برای POST/PUT)
   * @param headers - هدرهای اضافی (اختیاری)
   * @param retries - تعداد دفعات retry (پیش‌فرض: 0، فقط برای خطاهای 5xx)
   * @returns Promise با پاسخ API
   * @throws {APIError} در صورت خطا
   */
  async request<T = any>(
    url: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any,
    headers?: Record<string, string>,
    retries: number = 2, // کاهش از 3 به 2
    useRateLimit: boolean = true // flag برای فعال/غیرفعال کردن rate limiting
  ): Promise<T> {
    // Rate limiting (اگر فعال باشد)
    if (useRateLimit) {
      const rateLimitStartTime = Date.now();
      await rateLimiter.waitForPermission();
      const rateLimitDuration = Date.now() - rateLimitStartTime;
      if (rateLimitDuration > 0) {
        logger.logAPIPhase('rate-limit-delayed', rateLimitDuration, {
          requestId: this.requestId
        });
      }
    }
    
    // دریافت هدرهای احراز هویت
    const authHeaders = await this.getAuthHeaders();
    
    // ترکیب هدرها
    const requestHeaders: Record<string, string> = {
      ...authHeaders,
      ...headers
    };

    // Mask کردن token در logs
    const headersForLog = { ...requestHeaders };
    if (headersForLog['Authorization']) {
      headersForLog['Authorization'] = '***MASKED***';
    }

    // لاگ درخواست (بدون token)
    const requestStartTime = Date.now();
    const payloadSize = data ? JSON.stringify(data).length : 0;
    
    logger.logAPIPhase('api-request-start', 0, {
      url,
      method,
      payloadSize,
      requestId: this.requestId
    });
    
    logger.logAPIRequest(url, method, data);
    logger.info('EasyTraderAPIClient:request', 'Making API request', {
      url,
      method,
      hasData: !!data,
      requestId: this.requestId
    });
    
    const sendStartTime = Date.now();

    let lastError: Error | null = null;
    let attempt = 0;

    while (attempt <= retries) {
      try {
        if (attempt > 0) {
          // Smart exponential backoff: 100ms base (کاهش از 1000ms)
          const delay = Math.min(100 * Math.pow(2, attempt - 1), 5000); // max 5s (کاهش از 10s)
          logger.logAPIPhase('api-retry-backoff', delay, {
            attempt,
            retries,
            reason: lastError instanceof APIError ? lastError.statusCode : 'network-error',
            requestId: this.requestId
          });
          logger.info('EasyTraderAPIClient:request', `Retrying request (attempt ${attempt}/${retries})`, { delay, url });
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        // ارسال درخواست
        let response: APIResponse;
        
        if (method === 'GET') {
          response = await this.page.request.get(url, { headers: requestHeaders });
        } else if (method === 'POST') {
          response = await this.page.request.post(url, { headers: requestHeaders, data });
        } else if (method === 'PUT') {
          response = await this.page.request.put(url, { headers: requestHeaders, data });
        } else if (method === 'DELETE') {
          response = await this.page.request.delete(url, { headers: requestHeaders });
        } else {
          throw new APIError(`متد ${method} پشتیبانی نمی‌شود`, undefined, 400);
        }
        
        const sendDuration = Date.now() - sendStartTime;
        logger.logAPIPhase('api-request-sent', sendDuration, {
          url,
          method,
          requestId: this.requestId
        });

        const status = response.status();
        const responseReceiveTime = Date.now();
        
        // Parse کردن پاسخ
        const parseStartTime = Date.now();
        let responseData: any = {};
        try {
          responseData = await response.json();
        } catch {
          const text = await response.text();
          responseData = { text };
        }
        const parseDuration = Date.now() - parseStartTime;
        const responseTime = Date.now() - requestStartTime;

        // لاگ پاسخ
        logger.logAPIRequest(url, method, data, responseData, status);
        logger.logAPIPhase('api-response-received', responseReceiveTime - requestStartTime, {
          status,
          responseSize: JSON.stringify(responseData).length,
          requestId: this.requestId
        });
        logger.logAPIPhase('api-response-parse', parseDuration, {
          requestId: this.requestId
        });
        logger.logPerformance(`api-${method.toLowerCase()}-${url.split('/').pop()}`, responseTime, {
          url,
          method,
          status,
          success: status === 200,
          requestId: this.requestId
        });
        logger.info('EasyTraderAPIClient:request', 'API response received', {
          url,
          method,
          status,
          responseTime,
          isSuccessful: responseData.isSuccessful,
          requestId: this.requestId
        });

        // بررسی status code
        if (status === 200) {
          // بررسی اینکه آیا پاسخ موفق بوده (برای APIهای خاص)
          if (responseData.isSuccessful === false) {
            const omsErrors = responseData.omsError || [];
            const errorMessage = responseData.message || 'خطا در انجام عملیات';
            throw new APIError(errorMessage, omsErrors, status);
          }
          
          // Log success
          const totalDuration = Date.now() - requestStartTime;
          logger.logAPIPhase('api-request-complete', totalDuration, {
            status,
            success: true,
            requestId: this.requestId
          });
          
          return responseData as T;
        } else if (status === 400) {
          // خطای validation - NO RETRY (خطای validation قابل retry نیست)
          const omsErrors = responseData.omsError || [];
          const errorMessage = responseData.message || 'داده‌های ارسالی نامعتبر است';
          logger.logAPIPhase('api-retry-triggered', 0, {
            status,
            reason: 'validation-error',
            willRetry: false,
            requestId: this.requestId
          });
          logger.warn('EasyTraderAPIClient:request', 'Validation error', { url, status, responseData });
          throw new APIError(errorMessage, omsErrors, status);
        } else if (status === 401) {
          // خطای احراز هویت - cache را پاک می‌کنیم - NO RETRY
          this.clearAuthCache();
          tokenCache.clear(); // پاک کردن persistent cache هم
          const errorMessage = responseData.message || 'خطا در احراز هویت';
          logger.logAPIPhase('api-retry-triggered', 0, {
            status,
            reason: 'authentication-error',
            willRetry: false,
            requestId: this.requestId
          });
          logger.error('EasyTraderAPIClient:request', 'Authentication error', undefined, { url, status });
          throw new APIError(errorMessage, undefined, status);
        } else if ((status === 408 || status >= 500) && attempt < retries) {
          // خطای timeout یا سرور - retry می‌کنیم
          lastError = new APIError(
            responseData.message || `خطای سرور: ${status}`,
            responseData.omsError,
            status
          );
          
          logger.logAPIPhase('api-retry-triggered', 0, {
            status,
            reason: status === 408 ? 'timeout' : 'server-error',
            willRetry: true,
            attempt,
            retries,
            requestId: this.requestId
          });
          
          attempt++;
          continue;
        } else {
          // خطای دیگر - NO RETRY
          const omsErrors = responseData.omsError || [];
          const errorMessage = responseData.message || `خطا در ارسال درخواست: ${status}`;
          logger.logAPIPhase('api-retry-triggered', 0, {
            status,
            reason: 'other-error',
            willRetry: false,
            requestId: this.requestId
          });
          logger.error('EasyTraderAPIClient:request', 'API request failed', undefined, { url, status, responseData });
          throw new APIError(errorMessage, omsErrors, status);
        }

      } catch (error: any) {
        const attemptStartTime = Date.now();
        
        // اگر خطا از نوع APIError باشد
        if (error instanceof APIError) {
          // فقط برای 5xx یا 408 retry می‌کنیم
          if ((error.statusCode === 408 || (error.statusCode && error.statusCode >= 500)) && attempt < retries) {
            lastError = error;
            
            logger.logAPIPhase('api-retry-attempt', 0, {
              attempt: attempt + 1,
              retries,
              reason: error.statusCode === 408 ? 'timeout' : 'server-error',
              error: error.message,
              requestId: this.requestId
            });
            
            attempt++;
            continue;
          }
          // در غیر این صورت خطا را throw می‌کنیم
          
          const attemptDuration = Date.now() - attemptStartTime;
          logger.logAPIPhase('api-retry-exhausted', attemptDuration, {
            totalAttempts: attempt + 1,
            finalError: error.message,
            finalStatusCode: error.statusCode,
            requestId: this.requestId
          });
          
          throw error;
        }
        
        // خطای شبکه یا دیگر خطاها - فقط یک retry برای network errors
        if (attempt < Math.min(retries, 2)) { // حداکثر 2 retry (کاهش از 3)
          lastError = error;
          
          logger.logAPIPhase('api-retry-attempt', 0, {
            attempt: attempt + 1,
            retries,
            reason: 'network-error',
            error: error.message,
            requestId: this.requestId
          });
          
          logger.warn('EasyTraderAPIClient:request', 'Request failed, will retry', {
            url,
            attempt,
            error: error.message
          });
          attempt++;
          continue;
        }
        
        // اگر retry تمام شد، خطا را throw می‌کنیم
        const totalDuration = Date.now() - requestStartTime;
        logger.logAPIPhase('api-retry-exhausted', totalDuration, {
          totalAttempts: attempt + 1,
          finalError: error.message,
          requestId: this.requestId
        });
        
        logger.error('EasyTraderAPIClient:request', 'Request failed after retries', error, {
          url,
          attempts: attempt + 1
        });
        throw new APIError(`خطا در ارتباط با سرور: ${error.message}`, undefined, 0);
      }
    }

    // اگر به اینجا رسیدیم، یعنی retry تمام شده
    if (lastError) {
      const totalDuration = Date.now() - requestStartTime;
      logger.logAPIPhase('api-retry-success', totalDuration, {
        totalAttempts: attempt,
        requestId: this.requestId
      });
      throw lastError;
    }

    throw new APIError('خطای ناشناخته در ارسال درخواست', undefined, 0);
  }
}

