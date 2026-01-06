import { Page } from 'playwright';
import { PerformanceLogger } from './logger';
import { BuyOrder } from './buyAction';
import { executeFastBuy } from './buyAction';

/**
 * ارسال مستقیم سفارش خرید از طریق API (سریع‌ترین روش)
 */
export async function executeAPIBuy(page: Page, order: BuyOrder) {
  console.log('\n--- شروع فرآیند خرید API مستقیم ---');
  PerformanceLogger.start('Total_Execution_API');

  PerformanceLogger.start('Prepare_API_Request');
  
  // استخراج cookies از session برای authentication
  const cookies = await page.context().cookies();
  const cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ');

  // ساخت payload بر اساس ساختار HAR
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

  const payload = {
    order: {
      price: parseInt(order.price),
      quantity: parseInt(order.quantity),
      side: 0, // 0 = خرید
      validityType: 0, // 0 = روزانه
      createDateTime: createDateTime,
      commission: 0.0012, // کارمزد ثابت
      symbolIsin: "IRTKZARF0001", // ISIN نماد زر
      symbolName: order.symbol,
      orderModelType: 1,
      orderFrom: 34
    }
  };

  PerformanceLogger.end('Prepare_API_Request');

  PerformanceLogger.start('API_Call');
  
  // استفاده از page.request برای ارسال خودکار cookies و headers
  const response = await page.request.post('https://api-mts.orbis.easytrader.ir/core/api/v2/order', {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/plain, */*',
      'Referer': 'https://d.easytrader.ir/',
      'Accept-language': 'fa'
    },
    data: payload
  });

  const responseData = await response.json().catch(async () => {
    const text = await response.text();
    return { error: 'Invalid JSON', text: text.substring(0, 200) };
  });

  PerformanceLogger.end('API_Call');

  if (response.status() === 200 && responseData.isSuccessful) {
    console.log(`✅ سفارش با موفقیت ثبت شد (API). ID: ${responseData.id}`);
    const totalTime = PerformanceLogger.end('Total_Execution_API');
    return totalTime;
  } else {
    console.warn(`⚠️ API call failed (Status: ${response.status()}), falling back to UI automation...`);
    const apiTime = PerformanceLogger.end('Total_Execution_API');
    console.log(`⏱️ زمان API (قبل از fallback): ${apiTime}ms`);
    
    // Fallback به UI automation
    console.log('🔄 در حال استفاده از UI automation...');
    const uiTime = await executeFastBuy(page, order);
    console.log(`⏱️ زمان UI automation: ${uiTime}ms`);
    return apiTime + uiTime;
  }
}

