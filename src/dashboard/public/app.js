// مدیریت فرم خرید
const buyForm = document.getElementById('buyForm');
const statusDiv = document.getElementById('status');
const historyDiv = document.getElementById('history');
const buyBtn = document.getElementById('buyBtn');
const loginBtn = document.getElementById('loginBtn');

// بارگذاری تاریخچه از localStorage
function loadHistory() {
    const history = JSON.parse(localStorage.getItem('buyHistory') || '[]');
    if (history.length === 0) {
        historyDiv.innerHTML = '<p>هنوز خریدی انجام نشده است</p>';
        return;
    }
    
    historyDiv.innerHTML = history.map(item => `
        <div class="history-item">
            <p><strong>${item.symbol}</strong> - ${item.quantity} عدد - ${item.price.toLocaleString()} ریال</p>
            <p class="time">${new Date(item.time).toLocaleString('fa-IR')} - ${item.duration}ms</p>
        </div>
    `).join('');
}

// ذخیره در تاریخچه
function saveToHistory(order, duration) {
    const history = JSON.parse(localStorage.getItem('buyHistory') || '[]');
    history.unshift({
        ...order,
        duration,
        time: new Date().toISOString()
    });
    // نگه داشتن فقط 10 مورد آخر
    if (history.length > 10) {
        history.pop();
    }
    localStorage.setItem('buyHistory', JSON.stringify(history));
    loadHistory();
}

// نمایش وضعیت
function showStatus(message, type = 'info') {
    statusDiv.className = `status-info ${type}`;
    statusDiv.innerHTML = `<p>${message}</p>`;
}

// مدیریت فرم خرید
buyForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(buyForm);
    const data = {
        symbol: formData.get('symbol'),
        price: parseInt(formData.get('price')),
        quantity: parseInt(formData.get('quantity')),
        model: formData.get('model'),
        debug: formData.get('debug') === 'on'
    };
    
    // Validation
    if (!data.symbol || !data.price || !data.quantity) {
        showStatus('لطفاً تمام فیلدها را پر کنید', 'error');
        return;
    }
    
    // غیرفعال کردن دکمه
    buyBtn.disabled = true;
    buyBtn.innerHTML = 'در حال پردازش... <span class="loading-spinner"></span>';
    showStatus('در حال ارسال درخواست...', 'loading');
    
    try {
        const response = await fetch('/api/buy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showStatus(`✅ ${result.message} - زمان: ${result.duration}ms`, 'success');
            saveToHistory(result.order, result.duration);
        } else {
            showStatus(`❌ خطا: ${result.error}`, 'error');
        }
    } catch (error) {
        showStatus(`❌ خطای ارتباطی: ${error.message}`, 'error');
    } finally {
        buyBtn.disabled = false;
        buyBtn.innerHTML = '🚀 خرید';
    }
});

// مدیریت دکمه لاگین
loginBtn.addEventListener('click', async () => {
    const debug = document.getElementById('debug').checked;
    
    loginBtn.disabled = true;
    loginBtn.innerHTML = 'در حال باز کردن مرورگر...';
    showStatus('در حال باز کردن مرورگر برای لاگین...', 'loading');
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ debug })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showStatus(`✅ ${result.message}`, 'success');
        } else {
            showStatus(`❌ خطا: ${result.error}`, 'error');
        }
    } catch (error) {
        showStatus(`❌ خطای ارتباطی: ${error.message}`, 'error');
    } finally {
        loginBtn.disabled = false;
        loginBtn.innerHTML = '🔐 لاگین';
    }
});

// بارگذاری تاریخچه در ابتدا
loadHistory();

