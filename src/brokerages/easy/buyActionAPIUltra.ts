import { Page } from 'playwright';
import { PerformanceLogger } from './logger';
import { BuyOrder } from './buyAction';
import { logger } from '../../core/advancedLogger';
import { EasyTraderAPIClient } from './api/client';
import { placeOrder } from './api/order';
import { APIError } from './api/types';
import { tokenCache } from './api/tokenCache';

/**
 * Model 6: API Ultra Fast
 * سریع‌ترین روش ثبت سفارش از طریق API
 * 
 * ویژگی‌ها:
 * - Pre-cached token (از persistent cache)
 * - بدون verification
 * - بدون retry (فقط یک attempt)
 * - Minimal validation
 * - Target: < 50ms
 * 
 * @param page - صفحه Playwright
 * @param order - اطلاعات سفارش
 * @returns مدت زمان اجرا به میلی‌ثانیه
 */
export async function executeAPIUltraBuy(page: Page, order: BuyOrder): Promise<number> {
  const sideValue = order.side === 'sell' ? 1 : 0;
  const requestId = logger.generateCorrelationId();
  
  console.log(`\n--- شروع فرآیند ${sideValue === 0 ? 'خرید' : 'فروش'} (Model 6: API Ultra Fast) ---`);
  logger.logAPIPhase('model-6-api-ultra-start', 0, {
    requestId,
    order
  });
  
  logger.info('buyActionAPIUltra.ts:executeAPIUltraBuy', 'Starting API Ultra Fast buy process', { 
    model: 6, 
    side: sideValue, 
    order,
    requestId
  });
  
  PerformanceLogger.start('Total_Execution_API_Ultra');
  const totalStartTime = Date.now();

  try {
    // بررسی token cache
    const tokenCheckStartTime = Date.now();
    const cachedToken = tokenCache.get();
    const tokenCheckDuration = Date.now() - tokenCheckStartTime;
    
    logger.logAPIPhase('model-6-token-cached', tokenCheckDuration, {
      cached: cachedToken !== null,
      requestId
    });

    // ایجاد API Client (با pre-cached token)
    const client = new EasyTraderAPIClient(page);
    
    // استفاده از placeOrder با skipVerification (اگر در order.ts اضافه کنیم)
    // برای حالا، فقط placeOrder را صدا می‌زنیم بدون verification
    
    const payloadStartTime = Date.now();
    const result = await placeOrder(client, order);
    const payloadDuration = Date.now() - payloadStartTime;
    
    logger.logAPIPhase('model-6-payload-prepared', payloadDuration, {
      requestId
    });
    
    // API call (که در placeOrder انجام می‌شود)
    // برای tracking دقیق‌تر، می‌توانیم client.request را مستقیم صدا بزنیم
    // اما برای حفظ consistency، از placeOrder استفاده می‌کنیم
    
    logger.logAPIPhase('model-6-api-call', payloadDuration, {
      status: 200, // assume success
      orderId: result.id,
      requestId
    });
    
    console.log(`✅✅✅ سفارش با موفقیت ثبت شد (API Ultra)! ID: ${result.id}`);
    
    // بدون verification - سریع‌ترین حالت
    
    const totalTime = Date.now() - totalStartTime;
    PerformanceLogger.end('Total_Execution_API_Ultra');
    
    logger.logAPIPhase('model-6-total-duration', totalTime, {
      orderId: result.id,
      requestId,
      success: true
    });
    
    // Log performance metric
    logger.logPerformanceMetric('execute-api-ultra-buy', {
      totalDuration: totalTime,
      tokenTime: tokenCheckDuration,
      payloadTime: payloadDuration,
      requestTime: payloadDuration, // در این نسخه، request time شامل payload time است
      verificationTime: 0, // بدون verification
      skipVerification: true
    }, requestId);
    
    return totalTime;

  } catch (error: any) {
    const totalTime = Date.now() - totalStartTime;
    PerformanceLogger.end('Total_Execution_API_Ultra');
    
    logger.logAPIPhase('model-6-total-duration', totalTime, {
      requestId,
      success: false,
      error: error.message
    });
    
    // اگر خطا از نوع APIError باشد
    if (error instanceof APIError) {
      console.warn(`⚠️ خطا در API Ultra. پیام: ${error.message}`);
      
      logger.warn('buyActionAPIUltra.ts:executeAPIUltraBuy', 'API Ultra call failed', {
        error: error.message,
        statusCode: error.statusCode,
        order,
        requestId
      });
    } else {
      console.error('❌ خطای ارتباطی در API Ultra:', error.message);
      logger.error('buyActionAPIUltra.ts:executeAPIUltraBuy', 'API Ultra call exception', error, { 
        order,
        requestId
      });
    }
    
    // در Model 6، fallback نمی‌کنیم - فقط خطا را throw می‌کنیم
    // چون هدف سرعت حداکثری است
    throw error;
  }
}

