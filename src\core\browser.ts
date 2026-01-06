import { chromium, Browser, BrowserContext, Page } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';

/**
 * کلاس مدیریت مرورگر
 * این کلاس وظیفه باز و بسته کردن مرورگر و مدیریت Session را بر عهده دارد
 */
export class BrowserManager {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private userDataDir: string;
  private sessionFile: string;
  private brokerage: string;

  constructor(brokerage: string = 'agah') {
    this.brokerage = brokerage;
    // مسیر ذخیره‌سازی اطلاعات مرورگر (Session)
    this.userDataDir = path.join(process.cwd(), '.user-data', this.brokerage);
    this.sessionFile = path.join(this.userDataDir, 'session.json');
    
    // ایجاد پوشه user-data اگر وجود نداشته باشد
    if (!fs.existsSync(this.userDataDir)) {
      fs.mkdirSync(this.userDataDir, { recursive: true });
    }
  }

  /**
   * باز کردن مرورگر با Persistent Context (حفظ سشن)
   * @param headless آیا مرورگر بدون رابط گرافیکی باشد؟
   */
  async launch(headless: boolean = false): Promise<Page> {
    console.log('🚀 در حال باز کردن مرورگر...');
    
    this.browser = await chromium.launch({
      headless: headless,
      slowMo: 100, // کندتر کردن عملیات برای مشاهده بهتر
    });

    // بررسی وجود فایل سشن ذخیره شده
    const hasSession = fs.existsSync(this.sessionFile);
    
    if (hasSession) {
      console.log('✅ سشن ذخیره شده یافت شد، بارگذاری...');
      const storageState = JSON.parse(fs.readFileSync(this.sessionFile, 'utf-8'));
      this.context = await this.browser.newContext({ storageState });
    } else {
      console.log('⚠️  سشن ذخیره شده‌ای یافت نشد. مرورگر خالی باز می‌شود.');
      this.context = await this.browser.newContext();
    }

    this.page = await this.context.newPage();
    console.log('✅ مرورگر با موفقیت باز شد.');
    
    return this.page;
  }

  /**
   * ذخیره وضعیت فعلی مرورگر (Cookies, LocalStorage, SessionStorage)
   */
  async saveSession(): Promise<void> {
    if (!this.context) {
      console.error('❌ مرورگر باز نیست!');
      return;
    }

    const storageState = await this.context.storageState();
    fs.writeFileSync(this.sessionFile, JSON.stringify(storageState, null, 2));
    console.log('💾 سشن با موفقیت ذخیره شد:', this.sessionFile);
  }

  /**
   * گرفتن صفحه فعلی
   */
  getPage(): Page | null {
    return this.page;
  }

  /**
   * بستن مرورگر
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      console.log('🔒 مرورگر بسته شد.');
    }
  }
}

