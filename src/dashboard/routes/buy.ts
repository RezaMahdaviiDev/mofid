import { Router, Request, Response } from 'express';
import { BrowserManager } from '../../core/browser';
import { executeFastBuy } from '../../brokerages/easy/buyAction';
import { executeJSInjectBuy } from '../../brokerages/easy/buyActionJS';
import { executeUltraBuy } from '../../brokerages/easy/buyActionUltra';
import { executeAPIBuy } from '../../brokerages/easy/buyActionAPI';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { symbol, price, quantity, model, debug } = req.body;
  
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
    
    let duration: number;
    switch (model) {
      case '1':
        duration = await executeFastBuy(page, order);
        break;
      case '3':
        duration = await executeJSInjectBuy(page, order);
        break;
      case '4':
        duration = await executeUltraBuy(page, order);
        break;
      case '5':
        duration = await executeAPIBuy(page, order);
        break;
      default:
        duration = await executeJSInjectBuy(page, order);
    }

    await browserManager.close();

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
    
    res.status(500).json({
      success: false,
      error: error.message || 'خطای ناشناخته'
    });
  }
});

export { router as buyRoute };
