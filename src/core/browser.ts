import { chromium, Browser, BrowserContext, Page } from 'playwright';
import * as path from 'path';

export class BrowserManager {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private brokerage: string;

  constructor(brokerage: string = 'easy') {
    this.brokerage = brokerage;
  }

  async launch(headless: boolean = true): Promise<Page> {
    const userDataDir = path.join(process.cwd(), '.user-data', this.brokerage);

    // Log برای debug mode
    if (!headless) {
      console.log('🔍 حالت Debug فعال است - مرورگر قابل مشاهده است');
    } else {
      console.log('🚀 حالت Headless فعال است - مرورگر مخفی است');
    }

    this.browser = await chromium.launch({
      headless,
      // استفاده از chromium به جای channel: 'chrome' برای جلوگیری از خطای SSL
      // channel: 'chrome' // در صورت نیاز می‌توانید این را فعال کنید
    });

    // بررسی وجود state قبلی
    const fs = require('fs');
    const statePath = path.join(userDataDir, 'state.json');
    let storageState: string | undefined;
    
    try {
      if (fs.existsSync(statePath)) {
        storageState = statePath;
      }
    } catch {
      // ignore
    }

    this.context = await this.browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      // استفاده از persistent context برای ذخیره session
      storageState: storageState,
      // غیرفعال کردن بررسی SSL برای حل مشکل ERR_CERT_VERIFIER_CHANGED
      ignoreHTTPSErrors: true
    });

    const page = await this.context.newPage();
    return page;
  }

  async close(): Promise<void> {
    if (this.context) {
      const userDataDir = path.join(process.cwd(), '.user-data', this.brokerage);
      const statePath = path.join(userDataDir, 'state.json');
      
      // ذخیره state برای استفاده بعدی
      try {
        require('fs').mkdirSync(userDataDir, { recursive: true });
        await this.context.storageState({ path: statePath });
      } catch (error) {
        console.warn('⚠️ نتوانست state را ذخیره کرد:', error);
      }
      
      await this.context.close();
      this.context = null;
    }
    
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

