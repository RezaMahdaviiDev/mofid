/**
 * تست فروش با نماد افران
 */
async function testAfranSell() {
  const buyData = {
    symbol: 'افران',
    price: 42793,
    quantity: 30,
    model: '4', // مدل 4: Ultra
    side: 'sell',
    debug: false // headless mode
  };

  console.log('🚀 شروع تست فروش افران...');
  console.log('📋 داده‌های فروش:', buyData);

  try {
    const response = await fetch('http://localhost:3000/api/buy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(buyData)
    });

    const result = await response.json();
    
    console.log('\n✅ نتیجه فروش:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log(`\n⏱️ زمان اجرا: ${result.duration}ms`);
      console.log('\n✅✅✅ تست فروش موفق بود!');
      return true;
    } else {
      console.log(`\n❌ خطا: ${result.error}`);
      return false;
    }

  } catch (error: any) {
    console.error('❌ خطا در ارسال درخواست فروش:', error.message);
    return false;
  }
}

// اجرای تست
testAfranSell().then((success) => {
  if (success) {
    console.log('\n✅ تست فروش تأیید شد.');
    process.exit(0);
  } else {
    console.log('\n❌ تست فروش ناموفق بود.');
    process.exit(1);
  }
}).catch((error) => {
  console.error('❌ خطا در تست فروش:', error);
  process.exit(1);
});


