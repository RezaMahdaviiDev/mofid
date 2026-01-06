/**
 * تست خرید برای بررسی لاگ‌ها
 */
async function testBuy() {
  const buyData = {
    symbol: 'زر',
    price: 590000,
    quantity: 2,
    model: '4', // مدل 4: Ultra
    debug: false // headless mode
  };

  console.log('🚀 شروع تست خرید...');
  console.log('📋 داده‌های خرید:', buyData);

  try {
    const response = await fetch('http://localhost:3000/api/buy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(buyData)
    });

    const result = await response.json();
    
    console.log('\n✅ نتیجه خرید:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log(`\n⏱️ زمان اجرا: ${result.duration}ms`);
    } else {
      console.log(`\n❌ خطا: ${result.error}`);
    }

  } catch (error: any) {
    console.error('❌ خطا در ارسال درخواست:', error.message);
  }
}

// اجرای تست
testBuy().then(() => {
  console.log('\n✅ تست تکمیل شد. بررسی لاگ‌ها...');
  process.exit(0);
}).catch((error) => {
  console.error('❌ خطا در تست:', error);
  process.exit(1);
});

