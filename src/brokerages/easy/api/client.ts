import { Page, APIResponse } from 'playwright';
import { Settings } from '../../../config/settings';
import { logger } from '../../../core/advancedLogger';
import { APIError, OMSError } from './types';

/**
 * API Client برای ارتباط با EasyTrader API
 * این کلاس مدیریت احراز هویت، ارسال درخواست‌ها و مدیریت خطاها را انجام می‌دهد
 */
export class EasyTraderAPIClient {
  private page: Page;
  private cachedHeaders: Record<string, string> | null = null;
  private cacheTimestamp: number | null = null;
  private readonly CACHE_TTL = 30 * 60 * 1000; // 30 دقیقه

  /**
   * سازنده کلاینت API
   * @param page - صفحه Playwright برای انجام درخواست‌ها
   */
  constructor(page: Page) {
    this.page = page;
  }

  /**
   * دریافت هدرهای معتبر از ترافیک شبکه با استفاده از page.route()
   * این متد از route interception استفاده می‌کند تا توکن را از درخواست‌های واقعی استخراج کند
   * 
   * @returns Promise با هدرهای احراز هویت
   * @throws {Error} در صورت عدم موفقیت در استخراج توکن
   */
  async getAuthHeaders(): Promise<Record<string, string>> {
    // بررسی cache و TTL
    if (this.cachedHeaders && this.cacheTimestamp) {
      const cacheAge = Date.now() - this.cacheTimestamp;
      if (cacheAge < this.CACHE_TTL) {
        return this.cachedHeaders;
      } else {
        // Cache منقضی شده، پاک می‌کنیم
        this.clearAuthCache();
      }
    }

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
      // منتظر می‌مانیم تا یک درخواست با توکن پیدا شود
      console.log('⏳ منتظر درخواست API با توکن...');
      
      await this.page.waitForRequest(
        req => {
          const url = req.url();
          const headers = req.headers();
          return url.includes('api-mts.orbis.easytrader.ir') && 
                 url.includes('/api/v2/') &&
                 req.method() !== 'OPTIONS' &&
                 !!(headers['authorization'] || headers['Authorization']);
        },
        { timeout: 10000 }
      );
      
      // کمی صبر می‌کنیم تا route handler اجرا شود
      await this.page.waitForTimeout(500);
      
      // غیرفعال کردن route interception
      await this.page.unroute('**/*', routeHandler);
      
      if (capturedHeaders) {
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
        
        // Cache کردن headers با timestamp
        this.cachedHeaders = authHeaders;
        this.cacheTimestamp = Date.now();
        return authHeaders;
      } else {
        throw new Error('توکن پیدا نشد');
      }

    } catch (e: any) {
      // غیرفعال کردن route interception در صورت خطا
      try {
        await this.page.unroute('**/*', routeHandler);
      } catch {}
      
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
      
      // Cache کردن headers fallback با timestamp
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
    retries: number = 3
  ): Promise<T> {
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
    logger.logAPIRequest(url, method, data);
    logger.info('EasyTraderAPIClient:request', 'Making API request', {
      url,
      method,
      hasData: !!data
    });

    let lastError: Error | null = null;
    let attempt = 0;

    while (attempt <= retries) {
      try {
        if (attempt > 0) {
          // Exponential backoff برای retry
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
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

        const status = response.status();
        const responseTime = Date.now() - requestStartTime;
        
        // Parse کردن پاسخ
        let responseData: any = {};
        try {
          responseData = await response.json();
        } catch {
          const text = await response.text();
          responseData = { text };
        }

        // لاگ پاسخ
        logger.logAPIRequest(url, method, data, responseData, status);
        logger.logPerformance(`api-${method.toLowerCase()}-${url.split('/').pop()}`, responseTime, {
          url,
          method,
          status,
          success: status === 200
        });
        logger.info('EasyTraderAPIClient:request', 'API response received', {
          url,
          method,
          status,
          responseTime,
          isSuccessful: responseData.isSuccessful
        });

        // بررسی status code
        if (status === 200) {
          // بررسی اینکه آیا پاسخ موفق بوده (برای APIهای خاص)
          if (responseData.isSuccessful === false) {
            const omsErrors = responseData.omsError || [];
            const errorMessage = responseData.message || 'خطا در انجام عملیات';
            throw new APIError(errorMessage, omsErrors, status);
          }
          
          return responseData as T;
        } else if (status === 400) {
          // خطای validation
          const omsErrors = responseData.omsError || [];
          const errorMessage = responseData.message || 'داده‌های ارسالی نامعتبر است';
          logger.warn('EasyTraderAPIClient:request', 'Validation error', { url, status, responseData });
          throw new APIError(errorMessage, omsErrors, status);
        } else if (status === 401) {
          // خطای احراز هویت - cache را پاک می‌کنیم
          this.clearAuthCache();
          const errorMessage = responseData.message || 'خطا در احراز هویت';
          logger.error('EasyTraderAPIClient:request', 'Authentication error', undefined, { url, status });
          throw new APIError(errorMessage, undefined, status);
        } else if (status >= 500 && attempt < retries) {
          // خطای سرور - retry می‌کنیم
          lastError = new APIError(
            responseData.message || `خطای سرور: ${status}`,
            responseData.omsError,
            status
          );
          attempt++;
          continue;
        } else {
          // خطای دیگر
          const omsErrors = responseData.omsError || [];
          const errorMessage = responseData.message || `خطا در ارسال درخواست: ${status}`;
          logger.error('EasyTraderAPIClient:request', 'API request failed', undefined, { url, status, responseData });
          throw new APIError(errorMessage, omsErrors, status);
        }

      } catch (error: any) {
        // اگر خطا از نوع APIError باشد، آن را throw می‌کنیم
        if (error instanceof APIError) {
          // اگر خطای 5xx و retry باقی مانده، ادامه می‌دهیم
          if (error.statusCode && error.statusCode >= 500 && attempt < retries) {
            lastError = error;
            attempt++;
            continue;
          }
          // در غیر این صورت خطا را throw می‌کنیم
          throw error;
        }
        
        // خطای شبکه یا دیگر خطاها
        if (attempt < retries) {
          lastError = error;
          logger.warn('EasyTraderAPIClient:request', 'Request failed, will retry', {
            url,
            attempt,
            error: error.message
          });
          attempt++;
          continue;
        }
        
        // اگر retry تمام شد، خطا را throw می‌کنیم
        logger.error('EasyTraderAPIClient:request', 'Request failed after retries', error, {
          url,
          attempts: attempt + 1
        });
        throw new APIError(`خطا در ارتباط با سرور: ${error.message}`, undefined, 0);
      }
    }

    // اگر به اینجا رسیدیم، یعنی retry تمام شده
    if (lastError) {
      throw lastError;
    }

    throw new APIError('خطای ناشناخته در ارسال درخواست', undefined, 0);
  }
}

