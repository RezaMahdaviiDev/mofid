import { Router, Request, Response } from 'express';
import { BrowserManager } from '../../core/browser';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { debug } = req.body;
  const headless = !debug;

  const browserManager = new BrowserManager('easy');

  try {
    const page = await browserManager.launch(headless);
    await page.goto('https://d.easytrader.ir/', { waitUntil: 'load' });
    
    // نمایش پیام برای لاگین دستی
    console.log('📝 لطفاً در مرورگر باز شده لاگین کنید...');
    console.log('⏳ منتظر لاگین شما هستیم (۳۰ ثانیه)...');
    
    // صبر می‌کنیم تا کاربر لاگین کند
    await page.waitForTimeout(30000);
    
    // ذخیره session
    await browserManager.close();

    res.json({
      success: true,
      message: 'لاگین با موفقیت انجام شد. Session ذخیره شد.'
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

export { router as loginRoute };
