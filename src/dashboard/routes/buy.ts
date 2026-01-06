import { Router, Request, Response } from 'express';
import { BrowserManager } from '../../core/browser';
import { executeFastBuy } from '../../brokerages/easy/buyAction';
import { executeUltraBuy } from '../../brokerages/easy/buyActionUltra';
import { executeAPIBuy } from '../../brokerages/easy/buyActionAPI';
import { logger } from '../../core/advancedLogger';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { symbol, price, quantity, model, debug } = req.body;
  
  // #region agent log
  try {
    const fs = require('fs');
    const path = require('path');
    const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
    const debugEntry = JSON.stringify({location:'buy.ts:POST',message:'Buy request received',data:{symbol,price,quantity,model,debug},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'}) + '\n';
    fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
  } catch (e) {}
  // #endregion
  
  logger.info('buy.ts:POST', 'Buy request received', { symbol, price, quantity, model, debug });
  
  // Validation
  if (!symbol || !price || !quantity) {
    return res.status(400).json({ 
      success: false,
      error: 'لطفاً تمام فیلدها را پر کنید' 
    });
  }

  const browserManager = new BrowserManager('easy');
  const headless = !debug; // اگر debug فعال باشد، headless = false

  try {
    const page = await browserManager.launch(headless);
    await page.goto('https://d.easytrader.ir/', { waitUntil: 'load' });
    await page.waitForTimeout(15000);

    const order = { 
      symbol, 
      price: String(price), 
      quantity: String(quantity) 
    };
    
    // #region agent log
    try {
      const fs = require('fs');
      const path = require('path');
      const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
      const debugEntry = JSON.stringify({location:'buy.ts:POST',message:'Before buy execution',data:{order,model},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'}) + '\n';
      fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
    } catch (e) {}
    // #endregion
    
    logger.info('buy.ts:POST', 'Order object created', { order });
    logger.logBrowserState('buy.ts:POST', { headless, url: 'https://d.easytrader.ir/', ready: true });
    
    let duration: number;
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

    await browserManager.close();

    // #region agent log
    try {
      const fs = require('fs');
      const path = require('path');
      const debugLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
      const debugEntry = JSON.stringify({location:'buy.ts:POST',message:'Buy completed',data:{order,duration,model},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'}) + '\n';
      fs.appendFileSync(debugLogPath, debugEntry, 'utf8');
    } catch (e) {}
    // #endregion

    logger.info('buy.ts:POST', 'Buy completed successfully', { order, duration, model });
    
    res.json({
      success: true,
      message: 'خرید با موفقیت انجام شد',
      duration,
      order: {
        symbol,
        price,
        quantity
      }
    });

  } catch (error: any) {
    try {
      await browserManager.close();
    } catch {}
    
    logger.error('buy.ts:POST', 'Buy request failed', error, { symbol, price, quantity, model });
    
    res.status(500).json({
      success: false,
      error: error.message || 'خطای ناشناخته'
    });
  }
});

export { router as buyRoute };
