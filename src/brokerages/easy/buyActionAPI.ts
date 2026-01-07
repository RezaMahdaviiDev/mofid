import { Page } from 'playwright';
import { PerformanceLogger } from './logger';
import { BuyOrder } from './buyAction';
import { executeFastBuy } from './buyAction';
import { logger } from '../../core/advancedLogger';
import { EasyTraderAPIClient } from './api/client';
import { placeOrder, getOrders } from './api/order';
import { APIError } from './api/types';

/**
 * ارسال مستقیم سفارش خرید/فروش از طریق API (سریع‌ترین روش)
 * برای فروش، باید order.side === 'sell' باشد و در payload مقدار side = 1 تنظیم می‌شود.
 * 
 * این تابع از API Client جدید استفاده می‌کند و interface آن برای سازگاری با routes حفظ شده است.
 * 
 * @param page - صفحه Playwright
 * @param order - اطلاعات سفارش
 * @returns مدت زمان اجرا به میلی‌ثانیه
 */
export async function executeAPIBuy(page: Page, order: BuyOrder): Promise<number> {
  const sideValue = order.side === 'sell' ? 1 : 0; // 0 = خرید، 1 = فروش
  console.log('\n--- شروع فرآیند ' + (sideValue === 0 ? 'خرید' : 'فروش') + ' API مستقیم (نسخه refactored) ---');
  logger.info('buyActionAPI.ts:executeAPIBuy', 'Starting API buy process', { model: 5, side: sideValue, order });
  PerformanceLogger.start('Total_Execution_API');

  try {
    // ایجاد API Client
    const client = new EasyTraderAPIClient(page);
    
    // استفاده از placeOrder از API Client
    const result = await placeOrder(client, order);
    
    // #region agent log
    try {
      const fs = require('fs');
      const path = require('path');
      const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
      const debugEntry = JSON.stringify({location:'buyActionAPI.ts:34',message:'Order placed, verifying in order list',data:{orderId:result.id,isSuccessful:result.isSuccessful},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'}) + '\n';
      fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
    } catch (e) {}
    // #endregion
    
    console.log(`✅✅✅ سفارش با موفقیت ثبت شد (API)! ID: ${result.id}`);
    
    // بررسی تأیید سفارش در لیست سفارشات
    try {
      console.log('🔍 در حال بررسی تأیید سفارش در لیست سفارشات...');
      PerformanceLogger.start('VerifyOrder');
      
      // کمی صبر می‌کنیم تا سفارش در سیستم ثبت شود
      await page.waitForTimeout(2000);
      
      const ordersList = await getOrders(client);
      
      // #region agent log
      try {
        const fs = require('fs');
        const path = require('path');
        const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
        const debugEntry = JSON.stringify({location:'buyActionAPI.ts:50',message:'Orders list retrieved for verification',data:{ordersCount:ordersList.orders?.length || 0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'}) + '\n';
        fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
      } catch (e) {}
      // #endregion
      
      // پیدا کردن سفارش در لیست
      const placedOrder = ordersList.orders?.find(o => o.id === result.id);
      
      if (placedOrder) {
        // #region agent log
        try {
          const fs = require('fs');
          const path = require('path');
          const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
          const debugEntry = JSON.stringify({location:'buyActionAPI.ts:62',message:'Order found in list',data:{orderId:placedOrder.id,orderState:placedOrder.orderStateStr,executedQuantity:placedOrder.executedQuantity,quantity:placedOrder.quantity},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'}) + '\n';
          fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
        } catch (e) {}
        // #endregion
        
        console.log(`📋 سفارش در لیست یافت شد:`);
        console.log(`   - وضعیت: ${placedOrder.orderStateStr}`);
        console.log(`   - تعداد کل: ${placedOrder.quantity}`);
        console.log(`   - تعداد اجرا شده: ${placedOrder.executedQuantity}`);
        
        const verifyDuration = PerformanceLogger.end('VerifyOrder');
        
        // بررسی اینکه آیا سفارش کامل اجرا شده است
        if (placedOrder.executedQuantity === placedOrder.quantity) {
          console.log(`✅✅✅ سفارش به طور کامل اجرا شد!`);
          logger.info('buyActionAPI.ts:executeAPIBuy', 'Order fully executed', {
            orderId: result.id,
            executedQuantity: placedOrder.executedQuantity,
            totalQuantity: placedOrder.quantity
          });
        } else if (placedOrder.executedQuantity > 0) {
          console.log(`⚠️ سفارش جزئی اجرا شد: ${placedOrder.executedQuantity} از ${placedOrder.quantity}`);
          logger.warn('buyActionAPI.ts:executeAPIBuy', 'Order partially executed', {
            orderId: result.id,
            executedQuantity: placedOrder.executedQuantity,
            totalQuantity: placedOrder.quantity
          });
        } else {
          console.log(`⚠️ سفارش ثبت شده اما هنوز اجرا نشده (در صف: ${placedOrder.orderStateStr})`);
          logger.info('buyActionAPI.ts:executeAPIBuy', 'Order placed but not executed yet', {
            orderId: result.id,
            orderState: placedOrder.orderStateStr,
            quantity: placedOrder.quantity
          });
        }
      } else {
        // #region agent log
        try {
          const fs = require('fs');
          const path = require('path');
          const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
          const debugEntry = JSON.stringify({location:'buyActionAPI.ts:95',message:'Order NOT found in list',data:{expectedOrderId:result.id,ordersCount:ordersList.orders?.length || 0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'}) + '\n';
          fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
        } catch (e) {}
        // #endregion
        
        console.log(`⚠️ هشدار: سفارش در لیست سفارشات یافت نشد!`);
        console.log(`   - ID انتظار: ${result.id}`);
        console.log(`   - تعداد سفارشات در لیست: ${ordersList.orders?.length || 0}`);
          logger.warn('buyActionAPI.ts:executeAPIBuy', 'Order not found in verification list', {
            expectedOrderId: result.id,
            ordersCount: ordersList.orders?.length || 0
          });
      }
    } catch (verifyError: any) {
      // #region agent log
      try {
        const fs = require('fs');
        const path = require('path');
        const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
        const debugEntry = JSON.stringify({location:'buyActionAPI.ts:109',message:'Verification failed',data:{errorMessage:verifyError.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'}) + '\n';
        fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
      } catch (e) {}
      // #endregion
      
      console.warn(`⚠️ خطا در بررسی تأیید سفارش: ${verifyError.message}`);
      console.log(`   (سفارش ثبت شده اما تأیید نشد)`);
      logger.warn('buyActionAPI.ts:executeAPIBuy', 'Order verification failed', {
        orderId: result.id,
        errorMessage: verifyError.message
      });
      // ادامه می‌دهیم - خطای تأیید مانع از return نمی‌شود
    }
    
    const totalTime = PerformanceLogger.end('Total_Execution_API');
    
    return totalTime;

  } catch (error: any) {
    const apiTime = PerformanceLogger.end('Total_Execution_API');
    
    // اگر خطا از نوع APIError باشد
    if (error instanceof APIError) {
      console.warn(`⚠️ خطا در API. پیام: ${error.message}`);
      
      // اگر خطا مربوط به محدوده قیمت/حجم باشد، یعنی احراز هویت درست بوده اما دیتا غلط است
      if (error.statusCode === 400 || (error.message && error.message.includes('محدوده'))) {
        console.log('💡 نکته: احراز هویت موفق بود، اما پارامترهای سفارش رد شد.');
      }
      
      logger.warn('buyActionAPI.ts:executeAPIBuy', 'API call failed', {
        error: error.message,
        statusCode: error.statusCode,
        order
      });
    } else {
      console.error('❌ خطای ارتباطی در API:', error.message);
      logger.error('buyActionAPI.ts:executeAPIBuy', 'API call exception', error, { order });
    }
    
    // Fallback به روش UI
    console.log(`🔄 فال‌بک به روش UI...`);
    const uiTime = await executeFastBuy(page, order);
    return apiTime + uiTime;
  }
}
