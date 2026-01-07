import { Router, Request, Response } from 'express';
import { BrowserManager } from '../../core/browser';
import { executeFastBuy, getCashBalance } from '../../brokerages/easy/buyAction';
import { executeUltraBuy } from '../../brokerages/easy/buyActionUltra';
import { executeAPIBuy } from '../../brokerages/easy/buyActionAPI';
import { logger } from '../../core/advancedLogger';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { symbol, price, quantity, model, debug, side } = req.body;
  
  // #region agent log
  try {
    const fs = require('fs');
    const path = require('path');
    const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
    const debugEntry = JSON.stringify({location:'buy.ts:10',message:'Route handler entered',data:{symbol,price,quantity,model,debug,side,hasBody:!!req.body},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'}) + '\n';
    fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
  } catch (e) {}
  // #endregion
  
  logger.info('buy.ts:POST', 'Buy request received', { symbol, price, quantity, model, debug, side });
  
  // Validation
  if (!symbol || !price || !quantity) {
    // #region agent log
    try {
      const fs = require('fs');
      const path = require('path');
      const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
      const debugEntry = JSON.stringify({location:'buy.ts:26',message:'Validation failed',data:{symbol:!!symbol,price:!!price,quantity:!!quantity},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'}) + '\n';
      fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
    } catch (e) {}
    // #endregion
    return res.status(400).json({ 
      success: false,
      error: 'لطفاً تمام فیلدها را پر کنید' 
    });
  }

  const browserManager = new BrowserManager('easy');
  const headless = !debug; // اگر debug فعال باشد، headless = false

  // #region agent log
  try {
    const fs = require('fs');
    const path = require('path');
    const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
    const debugEntry = JSON.stringify({location:'buy.ts:36',message:'Before browser launch',data:{headless},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'}) + '\n';
    fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
  } catch (e) {}
  // #endregion

  try {
    // #region agent log
    const launchStartTime = Date.now();
    // #endregion
    const page = await browserManager.launch(headless);
    // #region agent log
    try {
      const fs = require('fs');
      const path = require('path');
      const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
      const debugEntry = JSON.stringify({location:'buy.ts:43',message:'Browser launched',data:{launchDuration:Date.now()-launchStartTime},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'}) + '\n';
      fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
    } catch (e) {}
    // #endregion
    
    // #region agent log
    const gotoStartTime = Date.now();
    // #endregion
    await page.goto('https://d.easytrader.ir/', { waitUntil: 'load' });
    // #region agent log
    try {
      const fs = require('fs');
      const path = require('path');
      const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
      const debugEntry = JSON.stringify({location:'buy.ts:52',message:'Page loaded',data:{gotoDuration:Date.now()-gotoStartTime},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'}) + '\n';
      fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
    } catch (e) {}
    // #endregion
    
    // #region agent log
    const waitStartTime = Date.now();
    // #endregion
    await page.waitForTimeout(15000);
    // #region agent log
    try {
      const fs = require('fs');
      const path = require('path');
      const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
      const debugEntry = JSON.stringify({location:'buy.ts:62',message:'Wait completed',data:{waitDuration:Date.now()-waitStartTime},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'}) + '\n';
      fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
    } catch (e) {}
    // #endregion

    const normalizedSide: 'buy' | 'sell' = side === 'sell' ? 'sell' : 'buy';

    const order = { 
      symbol, 
      price: String(price), 
      quantity: String(quantity),
      side: normalizedSide
    };
    
    // خواندن موجودی قبل از خرید/فروش
    let balanceBefore: number | null = null;
    try {
      // #region agent log
      try {
        const fs = require('fs');
        const path = require('path');
        const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
        const debugEntry = JSON.stringify({location:'buy.ts:POST',message:'Reading balance before transaction',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B1'}) + '\n';
        fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
      } catch (e) {}
      // #endregion
      
      balanceBefore = await getCashBalance(page);
      
      // #region agent log
      try {
        const fs = require('fs');
        const path = require('path');
        const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
        const debugEntry = JSON.stringify({location:'buy.ts:POST',message:'Balance before transaction result',data:{balanceBefore,isNull:balanceBefore===null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B2'}) + '\n';
        fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
      } catch (e) {}
      // #endregion
      
      if (balanceBefore !== null) {
        console.log(`💰 موجودی قبل از معامله: ${balanceBefore.toLocaleString()} ریال`);
        logger.info('buy.ts:POST', 'Balance before transaction', { balanceBefore });
      } else {
        // #region agent log
        try {
          const fs = require('fs');
          const path = require('path');
          const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
          const debugEntry = JSON.stringify({location:'buy.ts:POST',message:'Balance before is null',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B3'}) + '\n';
          fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
        } catch (e) {}
        // #endregion
      }
    } catch (error: any) {
      // #region agent log
      try {
        const fs = require('fs');
        const path = require('path');
        const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
        const debugEntry = JSON.stringify({location:'buy.ts:POST',message:'Error reading balance before',data:{errorMessage:error.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B4'}) + '\n';
        fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
      } catch (e) {}
      // #endregion
      logger.warn('buy.ts:POST', 'Failed to read balance before transaction', { error: error.message });
    }
    
    // #region agent log
    try {
      const fs = require('fs');
      const path = require('path');
      const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
      const debugEntry = JSON.stringify({location:'buy.ts:POST',message:'Before buy execution',data:{order,model},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'}) + '\n';
      fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
    } catch (e) {}
    // #endregion
    
    logger.info('buy.ts:POST', 'Order object created', { order, model });
    logger.logBrowserState('buy.ts:POST', { headless, url: 'https://d.easytrader.ir/', ready: true });
    
    // #region agent log
    const buyStartTime = Date.now();
    try {
      const fs = require('fs');
      const path = require('path');
      const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
      const debugEntry = JSON.stringify({location:'buy.ts:71',message:'Before buy execution',data:{model,order},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'}) + '\n';
      fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
    } catch (e) {}
    // #endregion
    
    let duration: number;
    try {
      switch (model) {
        case '1':
          duration = await executeFastBuy(page, order);
          break;
        case '4':
          duration = await executeUltraBuy(page, order);
          break;
        case '5':
          duration = await executeAPIBuy(page, order);
          break;
        default:
          duration = await executeUltraBuy(page, order); // Default to model 4
      }
      // #region agent log
      try {
        const fs = require('fs');
        const path = require('path');
        const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
        const debugEntry = JSON.stringify({location:'buy.ts:88',message:'Buy execution completed',data:{duration,buyDuration:Date.now()-buyStartTime},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'}) + '\n';
        fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
      } catch (e) {}
      // #endregion
    } catch (buyError: any) {
      // #region agent log
      try {
        const fs = require('fs');
        const path = require('path');
        const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
        const debugEntry = JSON.stringify({location:'buy.ts:95',message:'Buy execution error',data:{errorMessage:buyError.message,errorName:buyError.name,buyDuration:Date.now()-buyStartTime},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'I'}) + '\n';
        fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
      } catch (e) {}
      // #endregion
      throw buyError;
    }

    // خواندن موجودی بعد از خرید/فروش
    let balanceAfter: number | null = null;
    try {
      // #region agent log
      try {
        const fs = require('fs');
        const path = require('path');
        const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
        const debugEntry = JSON.stringify({location:'buy.ts:POST',message:'Waiting before reading balance after',data:{waitMs:2000},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A1'}) + '\n';
        fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
      } catch (e) {}
      // #endregion
      
      // صبر برای به‌روزرسانی صفحه
      await page.waitForTimeout(2000);
      
      // #region agent log
      try {
        const fs = require('fs');
        const path = require('path');
        const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
        const debugEntry = JSON.stringify({location:'buy.ts:POST',message:'Reading balance after transaction',data:{balanceBefore},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A2'}) + '\n';
        fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
      } catch (e) {}
      // #endregion
      
      balanceAfter = await getCashBalance(page);
      
      // #region agent log
      try {
        const fs = require('fs');
        const path = require('path');
        const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
        const debugEntry = JSON.stringify({location:'buy.ts:POST',message:'Balance after transaction result',data:{balanceAfter,balanceBefore,isNull:balanceAfter===null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A3'}) + '\n';
        fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
      } catch (e) {}
      // #endregion
      
      if (balanceAfter !== null) {
        console.log(`💰 موجودی بعد از معامله: ${balanceAfter.toLocaleString()} ریال`);
        logger.info('buy.ts:POST', 'Balance after transaction', { balanceAfter });
      } else {
        // #region agent log
        try {
          const fs = require('fs');
          const path = require('path');
          const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
          const debugEntry = JSON.stringify({location:'buy.ts:POST',message:'Balance after is null',data:{balanceBefore},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A4'}) + '\n';
          fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
        } catch (e) {}
        // #endregion
      }
    } catch (error: any) {
      // #region agent log
      try {
        const fs = require('fs');
        const path = require('path');
        const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
        const debugEntry = JSON.stringify({location:'buy.ts:POST',message:'Error reading balance after',data:{errorMessage:error.message,balanceBefore},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A5'}) + '\n';
        fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
      } catch (e) {}
      // #endregion
      logger.warn('buy.ts:POST', 'Failed to read balance after transaction', { error: error.message });
    }

    // محاسبه تغییر و validation
    let assetData: any = null;
    
    // #region agent log
    try {
      const fs = require('fs');
      const path = require('path');
      const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
      const debugEntry = JSON.stringify({location:'buy.ts:POST',message:'Calculating asset change',data:{balanceBefore,balanceAfter,price,quantity,side:normalizedSide},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C1'}) + '\n';
      fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
    } catch (e) {}
    // #endregion
    
    if (balanceBefore !== null && balanceAfter !== null) {
      const change = balanceAfter - balanceBefore;
      const priceNum = parseFloat(String(price));
      const quantityNum = parseInt(String(quantity));
      const expectedChange = normalizedSide === 'buy' ? -(priceNum * quantityNum) : (priceNum * quantityNum);
      const tolerance = 1000; // tolerance برای rounding
      
      // #region agent log
      try {
        const fs = require('fs');
        const path = require('path');
        const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
        const debugEntry = JSON.stringify({location:'buy.ts:POST',message:'Asset change calculated',data:{change,balanceBefore,balanceAfter,expectedChange,priceNum,quantityNum,side:normalizedSide},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C2'}) + '\n';
        fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
      } catch (e) {}
      // #endregion
      
      let changeType: 'increased' | 'decreased' | 'unchanged' | 'unknown' = 'unknown';
      if (change > 0) changeType = 'increased';
      else if (change < 0) changeType = 'decreased';
      else changeType = 'unchanged';
      
      // Validation logic
      let validation: {
        isValid: boolean;
        message: string;
        severity: 'success' | 'warning' | 'error';
      };
      
      if (normalizedSide === 'buy') {
        // خرید: باید دارایی کاهش یابد
        if (change < 0) {
          // بررسی تطابق با مقدار انتظاری
          if (Math.abs(Math.abs(change) - Math.abs(expectedChange)) < tolerance) {
            validation = {
              isValid: true,
              message: 'خرید با موفقیت تأیید شد (دارایی کسر شد)',
              severity: 'success'
            };
          } else {
            validation = {
              isValid: true,
              message: 'خرید انجام شد ولی مقدار کسر شده با سفارش تطابق ندارد',
              severity: 'warning'
            };
          }
        } else if (change === 0) {
          validation = {
            isValid: false,
            message: 'هشدار: معامله ممکن است اجرا نشده باشد (تغییر صفر)',
            severity: 'warning'
          };
        } else {
          validation = {
            isValid: false,
            message: 'ناسازگاری: خرید انجام شد ولی دارایی افزایش یافت',
            severity: 'warning'
          };
        }
      } else {
        // فروش: باید دارایی افزایش یابد
        if (change > 0) {
          // بررسی تطابق با مقدار انتظاری
          if (Math.abs(change - expectedChange) < tolerance) {
            validation = {
              isValid: true,
              message: 'فروش با موفقیت تأیید شد (دارایی اضافه شد)',
              severity: 'success'
            };
          } else {
            validation = {
              isValid: true,
              message: 'فروش انجام شد ولی مقدار اضافه شده با سفارش تطابق ندارد',
              severity: 'warning'
            };
          }
        } else if (change === 0) {
          validation = {
            isValid: false,
            message: 'هشدار: معامله ممکن است اجرا نشده باشد (تغییر صفر)',
            severity: 'warning'
          };
        } else {
          validation = {
            isValid: false,
            message: 'ناسازگاری: فروش انجام شد ولی دارایی کاهش یافت',
            severity: 'warning'
          };
        }
      }
      
      assetData = {
        balanceBefore,
        balanceAfter,
        change,
        changeType,
        validation
      };
      
      console.log(`📊 تغییر موجودی: ${change > 0 ? '+' : ''}${change.toLocaleString()} ریال`);
      if (validation.isValid) {
        console.log(`✅ ${validation.message}`);
      } else {
        console.log(`⚠️ ${validation.message}`);
      }
    } else if (balanceBefore === null && balanceAfter === null) {
      // نتوانستیم موجودی را بخوانیم
      assetData = {
        balanceBefore: null,
        balanceAfter: null,
        change: null,
        changeType: 'unknown' as const,
        validation: {
          isValid: false,
          message: 'نمی‌توان تأیید کرد (موجودی خوانده نشد)',
          severity: 'warning' as const
        }
      };
    } else {
      // یکی از موجودی‌ها خوانده نشد
      assetData = {
        balanceBefore,
        balanceAfter,
        change: null,
        changeType: 'unknown' as const,
        validation: {
          isValid: false,
          message: 'نمی‌توان تأیید کرد (یکی از موجودی‌ها خوانده نشد)',
          severity: 'warning' as const
        }
      };
    }

    await browserManager.close();

    // #region agent log
    try {
      const fs = require('fs');
      const path = require('path');
      const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
      const debugEntry = JSON.stringify({location:'buy.ts:105',message:'Browser closed, before sending response',data:{order,duration,model,assetData},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'J'}) + '\n';
      fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
    } catch (e) {}
    // #endregion

    logger.info('buy.ts:POST', 'Buy completed successfully', { order, duration, model, assetData });
    
    // #region agent log
    try {
      const fs = require('fs');
      const path = require('path');
      const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
      const debugEntry = JSON.stringify({location:'buy.ts:113',message:'Sending success response',data:{success:true,hasAssetData:!!assetData},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'K'}) + '\n';
      fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
    } catch (e) {}
    // #endregion
    
    res.json({
      success: true,
      message: normalizedSide === 'sell' ? 'فروش با موفقیت انجام شد' : 'خرید با موفقیت انجام شد',
      duration,
      order: {
        symbol,
        price,
        quantity,
        side: normalizedSide
      },
      asset: assetData
    });
    
    // #region agent log
    try {
      const fs = require('fs');
      const path = require('path');
      const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
      const debugEntry = JSON.stringify({location:'buy.ts:127',message:'Response sent successfully',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'L'}) + '\n';
      fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
    } catch (e) {}
    // #endregion

  } catch (error: any) {
    // #region agent log
    try {
      const fs = require('fs');
      const path = require('path');
      const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
      const debugEntry = JSON.stringify({location:'buy.ts:134',message:'Error caught in catch block',data:{errorName:error.name,errorMessage:error.message,errorStack:error.stack?.substring(0,500)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'M'}) + '\n';
      fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
    } catch (e) {}
    // #endregion
    
    try {
      await browserManager.close();
      // #region agent log
      try {
        const fs = require('fs');
        const path = require('path');
        const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
        const debugEntry = JSON.stringify({location:'buy.ts:143',message:'Browser closed in error handler',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'N'}) + '\n';
        fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
      } catch (e) {}
      // #endregion
    } catch {}
    
    logger.error('buy.ts:POST', 'Buy request failed', error, { symbol, price, quantity, model });
    
    // #region agent log
    try {
      const fs = require('fs');
      const path = require('path');
      const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
      const debugEntry = JSON.stringify({location:'buy.ts:152',message:'Sending error response',data:{statusCode:500,errorMessage:error.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'O'}) + '\n';
      fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
    } catch (e) {}
    // #endregion
    
    try {
      res.status(500).json({
        success: false,
        error: error.message || 'خطای ناشناخته'
      });
      // #region agent log
      try {
        const fs = require('fs');
        const path = require('path');
        const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
        const debugEntry = JSON.stringify({location:'buy.ts:163',message:'Error response sent',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'P'}) + '\n';
        fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
      } catch (e) {}
      // #endregion
    } catch (responseError: any) {
      // #region agent log
      try {
        const fs = require('fs');
        const path = require('path');
        const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
        const debugEntry = JSON.stringify({location:'buy.ts:171',message:'Failed to send error response',data:{responseError:responseError.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'Q'}) + '\n';
        fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
      } catch (e) {}
      // #endregion
    }
  }
});

export { router as buyRoute };
