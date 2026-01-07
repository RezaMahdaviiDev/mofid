import { EasyTraderAPIClient } from './client';
import { OrderResponse, PlaceOrderRequest, APIError, QueuePositionResponse, OrderPlace } from './types';
import { BuyOrder } from '../buyAction';
import { getIsinForSymbol } from '../symbolHelper';
import { PerformanceLogger } from '../logger';
import { logger } from '../../../core/advancedLogger';
import { Settings } from '../../../config/settings';

/**
 * ثبت سفارش خرید یا فروش
 * 
 * @param client - API Client برای ارسال درخواست
 * @param order - اطلاعات سفارش (نماد، قیمت، تعداد، نوع)
 * @returns شناسه سفارش و اطلاعات تکمیلی
 * @throws {APIError} در صورت خطا در ارسال یا validation
 * 
 * @example
 * ```typescript
 * const client = new EasyTraderAPIClient(page);
 * const result = await placeOrder(client, {
 *   symbol: 'زر',
 *   price: '590000',
 *   quantity: '2',
 *   side: 'buy'
 * });
 * console.log('Order ID:', result.id);
 * ```
 */
export async function placeOrder(
  client: EasyTraderAPIClient,
  order: BuyOrder
): Promise<OrderResponse> {
  PerformanceLogger.start('PlaceOrder_Validation');
  
  // Validation ورودی‌ها
  if (!order.symbol || order.symbol.trim() === '') {
    throw new APIError('نماد نمی‌تواند خالی باشد');
  }

  if (!order.price || order.price.trim() === '') {
    throw new APIError('قیمت نمی‌تواند خالی باشد');
  }

  if (!order.quantity || order.quantity.trim() === '') {
    throw new APIError('تعداد نمی‌تواند خالی باشد');
  }

  // اعتبارسنجی قیمت
  const priceNum = parseFloat(order.price);
  if (isNaN(priceNum) || priceNum <= 0) {
    throw new APIError('قیمت باید عدد مثبت باشد');
  }

  // اعتبارسنجی تعداد
  const quantityNum = parseInt(order.quantity);
  if (isNaN(quantityNum) || quantityNum <= 0) {
    throw new APIError('تعداد باید عدد صحیح مثبت باشد');
  }

  PerformanceLogger.end('PlaceOrder_Validation');

  PerformanceLogger.start('PlaceOrder_Prepare');
  
  // تبدیل side به عدد (0 = خرید، 1 = فروش)
  const sideValue = order.side === 'sell' ? 1 : 0;
  
  // استفاده از symbolHelper برای mapping
  const symbolIsin = getIsinForSymbol(order.symbol);
  
  // ساخت createDateTime
  const now = new Date();
  const createDateTime = now.toLocaleString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  // ساخت payload
  const payload = {
    order: {
      price: priceNum,
      quantity: quantityNum,
      side: sideValue,
      validityType: 0, // 0 = روزانه
      createDateTime: createDateTime,
      commission: 0.0012,
      symbolIsin: symbolIsin,
      symbolName: order.symbol,
      orderModelType: 1,
      orderFrom: 34
    }
  };

  PerformanceLogger.end('PlaceOrder_Prepare');

  PerformanceLogger.start('PlaceOrder_API_Call');
  
  // ساخت URL کامل
  const url = `${Settings.easy.apiUrl}/order`;
  
  // لاگ درخواست
  logger.logAPIRequest(url, 'POST', payload);
  
  try {
    // ارسال درخواست
    const response = await client.request<OrderResponse>(
      url,
      'POST',
      payload
    );

    const duration = PerformanceLogger.end('PlaceOrder_API_Call');

    // لاگ پاسخ
    logger.logAPIRequest(url, 'POST', payload, response, 200);

    // لاگ خرید موفق
    logger.logBuy(`buy-${Date.now()}`, order, {
      success: true,
      duration,
      orderId: response.id
    }, duration);

    // لاگ عملکرد
    logger.logPerformance('place-order-api', duration, {
      order,
      success: true,
      orderId: response.id
    });

    console.log(`✅ سفارش با موفقیت ثبت شد! ID: ${response.id}`);
    
    return response;

  } catch (error: any) {
    const duration = PerformanceLogger.end('PlaceOrder_API_Call');
    
    // لاگ خطا
    logger.error('order.ts:placeOrder', 'Failed to place order', error, {
      order,
      payload,
      duration
    });

    // لاگ عملکرد ناموفق
    logger.logPerformance('place-order-api', duration, {
      order,
      success: false,
      error: error.message
    });

    throw error;
  }
}

/**
 * دریافت لیست سفارشات
 * 
 * @param client - API Client برای ارسال درخواست
 * @returns لیست سفارشات
 * @throws {APIError} در صورت خطا
 * 
 * @example
 * ```typescript
 * const client = new EasyTraderAPIClient(page);
 * const orders = await getOrders(client);
 * console.log('Orders count:', orders.orders.length);
 * ```
 */
export async function getOrders(
  client: EasyTraderAPIClient
): Promise<import('./types').OrdersResponse> {
  PerformanceLogger.start('GetOrders_API_Call');
  
  const url = 'https://api-mts.orbis.easytrader.ir/core/api/order';
  
  try {
    const response = await client.request<import('./types').OrdersResponse>(
      url,
      'GET'
    );

    const duration = PerformanceLogger.end('GetOrders_API_Call');

    logger.logPerformance('get-orders-api', duration, {
      ordersCount: response.orders?.length || 0,
      success: true
    });

    console.log(`✅ دریافت لیست سفارشات موفق. تعداد: ${response.orders?.length || 0}`);
    
    return response;

  } catch (error: any) {
    const duration = PerformanceLogger.end('GetOrders_API_Call');
    
    logger.error('order.ts:getOrders', 'Failed to get orders', error, {
      duration
    });

    logger.logPerformance('get-orders-api', duration, {
      success: false,
      error: error.message
    });

    throw error;
  }
}

/**
 * دریافت جایگاه سفارش در صف
 * 
 * @param client - API Client برای ارسال درخواست
 * @param orderId - شناسه سفارش
 * @returns اطلاعات جایگاه در صف
 * @throws {APIError} در صورت خطا یا validation
 * 
 * @example
 * ```typescript
 * const client = new EasyTraderAPIClient(page);
 * const position = await getQueuePosition(client, '1121Ak37W56*.]3A');
 * console.log('Position:', position.orderPlaces[0].orderPlace);
 * ```
 */
export async function getQueuePosition(
  client: EasyTraderAPIClient,
  orderId: string
): Promise<QueuePositionResponse> {
  PerformanceLogger.start('GetQueuePosition_Validation');
  
  // Validation order-id
  if (!orderId || orderId.trim() === '') {
    throw new APIError('شناسه سفارش نمی‌تواند خالی باشد');
  }

  // بررسی format (حداقل باید دارای کاراکترهای خاص باشد)
  if (orderId.length < 5) {
    throw new APIError('شناسه سفارش نامعتبر است');
  }

  PerformanceLogger.end('GetQueuePosition_Validation');
  PerformanceLogger.start('GetQueuePosition_API_Call');
  
  const url = 'https://api-mts.orbis.easytrader.ir/ms/api/MarketSheet/order-place?actionType=get';
  
  try {
    const response = await client.request<QueuePositionResponse>(
      url,
      'GET',
      undefined,
      {
        'order-id': orderId
      }
    );

    const duration = PerformanceLogger.end('GetQueuePosition_API_Call');

    logger.logPerformance('get-queue-position-api', duration, {
      orderId,
      success: true,
      position: response.orderPlaces?.[0]?.orderPlace
    });

    if (response.orderPlaces && response.orderPlaces.length > 0) {
      const position = response.orderPlaces[0];
      console.log(`✅ جایگاه در صف: ${position.orderPlace}, حجم جلوتر: ${position.volumeAhead}`);
    }
    
    return response;

  } catch (error: any) {
    const duration = PerformanceLogger.end('GetQueuePosition_API_Call');
    
    logger.error('order.ts:getQueuePosition', 'Failed to get queue position', error, {
      orderId,
      duration
    });

    logger.logPerformance('get-queue-position-api', duration, {
      orderId,
      success: false,
      error: error.message
    });

    throw error;
  }
}

/**
 * مانیتورینگ جایگاه سفارش در صف
 * 
 * @param client - API Client برای ارسال درخواست
 * @param orderId - شناسه سفارش
 * @param interval - فاصله زمانی بین چک‌ها به میلی‌ثانیه (پیش‌فرض: 5000)
 * @param callback - تابع callback که با هر بار چک شدن فراخوانی می‌شود
 * @param maxChecks - حداکثر تعداد چک (پیش‌فرض: 60)
 * @returns Promise که در صورت توقف resolve می‌شود
 * 
 * @example
 * ```typescript
 * const client = new EasyTraderAPIClient(page);
 * await monitorOrder(client, '1121Ak37W56*.]3A', 5000, (position) => {
 *   console.log('Current position:', position.orderPlace);
 * }, 10);
 * ```
 */
export async function monitorOrder(
  client: EasyTraderAPIClient,
  orderId: string,
  interval: number = 5000,
  callback?: (position: OrderPlace) => void,
  maxChecks: number = 60
): Promise<void> {
  PerformanceLogger.start('MonitorOrder_Total');
  
  logger.info('order.ts:monitorOrder', 'Starting order monitoring', {
    orderId,
    interval,
    maxChecks
  });

  let checksCount = 0;
  let lastPosition: number | null = null;

  while (checksCount < maxChecks) {
    try {
      PerformanceLogger.start('MonitorOrder_Check');
      
      const response = await getQueuePosition(client, orderId);
      
      const checkDuration = PerformanceLogger.end('MonitorOrder_Check');
      
      if (response.orderPlaces && response.orderPlaces.length > 0) {
        const position = response.orderPlaces[0];
        
        // اگر جایگاه تغییر کرده، لاگ می‌کنیم
        if (lastPosition === null || lastPosition !== position.orderPlace) {
          logger.info('order.ts:monitorOrder', 'Position changed', {
            orderId,
            oldPosition: lastPosition,
            newPosition: position.orderPlace,
            volumeAhead: position.volumeAhead
          });
          lastPosition = position.orderPlace;
        }
        
        // فراخوانی callback اگر تعریف شده باشد
        if (callback) {
          callback(position);
        }
        
        // اگر جایگاه 1 شد، یعنی سفارش در حال اجرا است
        if (position.orderPlace <= 1) {
          logger.info('order.ts:monitorOrder', 'Order reached front of queue', {
            orderId,
            position: position.orderPlace
          });
          break;
        }
      }
      
      checksCount++;
      
      // Log performance
      logger.logPerformance('monitor-order-check', checkDuration, {
        orderId,
        checkNumber: checksCount,
        position: response.orderPlaces?.[0]?.orderPlace
      });

      // صبر برای interval بعدی
      if (checksCount < maxChecks) {
        await new Promise(resolve => setTimeout(resolve, interval));
      }

    } catch (error: any) {
      const checkDuration = PerformanceLogger.end('MonitorOrder_Check');
      
      logger.error('order.ts:monitorOrder', 'Error during monitoring check', error, {
        orderId,
        checkNumber: checksCount,
        duration: checkDuration
      });
      
      // در صورت خطا، صبر می‌کنیم و ادامه می‌دهیم
      await new Promise(resolve => setTimeout(resolve, interval));
      checksCount++;
    }
  }

  const totalDuration = PerformanceLogger.end('MonitorOrder_Total');
  
  logger.logPerformance('monitor-order-total', totalDuration, {
    orderId,
    checksCount,
    success: true
  });

  logger.info('order.ts:monitorOrder', 'Order monitoring completed', {
    orderId,
    checksCount,
    totalDuration
  });
}
