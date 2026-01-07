/**
 * تست خرید با نماد افران
 */
async function testAfran() {
  const buyData = {
    symbol: 'افران',
    price: 42790,
    quantity: 30,
    model: '4', // مدل 4: Ultra
    debug: false // headless mode
  };

  console.log('🚀 شروع تست خرید افران...');
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
      console.log('\n✅✅✅ تست موفق بود!');
      return true;
    } else {
      console.log(`\n❌ خطا: ${result.error}`);
      return false;
    }

  } catch (error: any) {
    console.error('❌ خطا در ارسال درخواست:', error.message);
    return false;
  }
}

// اجرای تست
testAfran().then((success) => {
  if (success) {
    console.log('\n✅ تست تأیید شد. آماده ورود به مرحله بعدی هستیم.');
    process.exit(0);
  } else {
    console.log('\n❌ تست ناموفق بود.');
    process.exit(1);
  }
}).catch((error) => {
  console.error('❌ خطا در تست:', error);
  process.exit(1);
});

