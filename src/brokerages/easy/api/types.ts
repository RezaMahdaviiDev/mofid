import { BuyOrder } from '../buyAction';

/**
 * پاسخ API ثبت سفارش خرید یا فروش
 */
export interface OrderResponse {
  /** آیا عملیات موفق بود */
  isSuccessful: boolean;
  /** شناسه سفارش (برای پیگیری‌های بعدی) */
  id: string;
  /** پیام پاسخ */
  message: string;
  /** خطاهای OMS در صورت وجود */
  omsError: OMSError[] | null;
}

/**
 * خطای OMS
 */
export interface OMSError {
  /** نام خطا */
  name: string;
  /** پیام خطا */
  error: string;
  /** کد خطا */
  code: number;
}

/**
 * آیتم سفارش در لیست سفارشات
 */
export interface OrderItem {
  /** شناسه سفارش */
  id: string;
  /** شناسه ISIN نماد */
  symbolIsin: string;
  /** قیمت سفارش */
  price: number;
  /** تعداد سفارش */
  quantity: number;
  /** نوع سفارش: 0 = خرید، 1 = فروش */
  side: 0 | 1;
  /** وضعیت سفارش (مثلاً "OnBoard") */
  orderStateStr: string;
  /** تعداد اجرا شده */
  executedQuantity: number;
}

/**
 * پاسخ API دریافت لیست سفارشات
 */
export interface OrdersResponse {
  /** لیست سفارشات */
  orders: OrderItem[];
}

/**
 * جایگاه سفارش در صف
 */
export interface OrderPlace {
  /** شناسه سفارش */
  orderId: string;
  /** نوبت در صف */
  orderPlace: number;
  /** حجم جلوتر از سفارش شما */
  volumeAhead: number;
}

/**
 * پاسخ API جایگاه در صف
 */
export interface QueuePositionResponse {
  /** لیست جایگاه‌های سفارشات */
  orderPlaces: OrderPlace[];
}

/**
 * درخواست ثبت سفارش (compatible با BuyOrder)
 */
export interface PlaceOrderRequest extends BuyOrder {
  /** نماد (از BuyOrder) */
  symbol: string;
  /** قیمت (از BuyOrder) */
  price: string;
  /** تعداد (از BuyOrder) */
  quantity: string;
  /** نوع سفارش: خرید یا فروش (از BuyOrder) */
  side?: 'buy' | 'sell';
}

/**
 * کلاس خطای API با پیام‌های معنادار
 */
export class APIError extends Error {
  /** کد خطا */
  public code?: number;
  /** خطاهای OMS */
  public omsErrors?: OMSError[];
  /** Status code HTTP */
  public statusCode?: number;

  constructor(
    message: string,
    omsErrors?: OMSError[],
    statusCode?: number
  ) {
    super(message);
    this.name = 'APIError';
    this.omsErrors = omsErrors;
    this.statusCode = statusCode;
    
    // اگر خطاهای OMS وجود داشته باشد، کد خطا را از اولین خطا بگیر
    if (omsErrors && omsErrors.length > 0) {
      this.code = omsErrors[0].code;
    }
    
    // Maintain proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, APIError);
    }
  }
}


