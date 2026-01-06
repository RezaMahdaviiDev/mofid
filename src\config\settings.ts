/**
 * تنظیمات برنامه
 * در این فایل می‌توانید پارامترهای خرید را تنظیم کنید
 */

export interface BuySettings {
  symbolName?: string;  // نام نماد (مثلاً "افران") - اختیاری
  price: number;        // قیمت خرید (مثلاً 42730)
  quantity?: number;    // تعداد سهم (اختیاری)
  useCalculator?: boolean; // استفاده از ماشین حساب برای محاسبه حجم
  waitBeforeConfirm?: number; // زمان انتظار قبل از تایید نهایی (میلی‌ثانیه)
}

export const defaultSettings: BuySettings = {
  price: 0,
  useCalculator: false,
  waitBeforeConfirm: 2000 // 2 ثانیه
};

