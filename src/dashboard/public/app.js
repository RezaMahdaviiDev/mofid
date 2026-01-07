// مدیریت فرم خرید
const buyForm = document.getElementById('buyForm');
const statusDiv = document.getElementById('status');
const historyDiv = document.getElementById('history');
const assetDisplay = document.getElementById('assetDisplay');
const buyBtn = document.getElementById('buyBtn');
const loginBtn = document.getElementById('loginBtn');
const sideSelect = document.getElementById('side');

// به‌روزرسانی متن دکمه بر اساس نوع سفارش
function updateBuyButtonText() {
    const selectedSide = sideSelect.value;
    if (selectedSide === 'sell') {
        buyBtn.textContent = '💰 فروش';
    } else {
        buyBtn.textContent = '🚀 خرید';
    }
}

// Event listener برای تغییر نوع سفارش
if (sideSelect) {
    sideSelect.addEventListener('change', updateBuyButtonText);
}

// فرمت کردن تغییر دارایی
function formatAssetChange(asset) {
    if (!asset || asset.change === null || asset.change === undefined) {
        return 'نامشخص';
    }
    
    const change = asset.change;
    const sign = change > 0 ? '+' : '';
    const formatted = `${sign}${Math.abs(change).toLocaleString('fa-IR')} ریال`;
    
    if (asset.validation) {
        return `${formatted} (${asset.validation.message})`;
    }
    
    return formatted;
}

// به‌روزرسانی نمایش دارایی
function updateAssetDisplay(assetData) {
    if (!assetData || assetData.balanceAfter === null || assetData.balanceAfter === undefined) {
        assetDisplay.innerHTML = '<p>موجودی نامشخص</p>';
        return;
    }
    
    const balance = assetData.balanceAfter;
    const change = assetData.change;
    const changeType = assetData.changeType;
    
    let changeHtml = '';
    if (change !== null && change !== undefined) {
        const changeClass = changeType === 'increased' ? 'increased' : 
                          changeType === 'decreased' ? 'decreased' : 'unchanged';
        const changeSign = change > 0 ? '+' : '';
        const changeText = `${changeSign}${Math.abs(change).toLocaleString('fa-IR')} ریال`;
        changeHtml = `<p class="asset-change ${changeClass}">تغییر: ${changeText}</p>`;
    }
    
    let validationHtml = '';
    if (assetData.validation) {
        const validationClass = assetData.validation.severity;
        validationHtml = `<p class="validation-status ${validationClass}">${assetData.validation.message}</p>`;
    }
    
    assetDisplay.innerHTML = `
        <div class="asset-balance">
            <p class="balance-value">${balance.toLocaleString('fa-IR')} ریال</p>
            ${changeHtml}
            ${validationHtml}
        </div>
    `;
}

// بارگذاری تاریخچه از localStorage
function loadHistory() {
    const history = JSON.parse(localStorage.getItem('buyHistory') || '[]');
    if (history.length === 0) {
        historyDiv.innerHTML = '<p>هنوز معامله‌ای انجام نشده است</p>';
        return;
    }
    
    historyDiv.innerHTML = history.map(item => {
        const orderType = item.side === 'sell' ? 'sell' : 'buy';
        const orderTypeIcon = item.side === 'sell' ? '🔴' : '🟢';
        const orderTypeText = item.side === 'sell' ? 'فروش' : 'خرید';
        
        const validationBadge = item.asset?.validation ? 
            `<span class="validation-badge ${item.asset.validation.severity}">${item.asset.validation.message}</span>` : '';
        
        const assetInfo = item.asset ? 
            `<p class="asset-change ${item.asset.changeType}">💰 موجودی: ${formatAssetChange(item.asset)}</p>` : '';
        
        return `
        <div class="history-item">
            <div class="history-header">
                <span class="order-type ${orderType}">${orderTypeIcon} ${orderTypeText}</span>
                <strong>${item.symbol}</strong>
                ${validationBadge}
            </div>
            <p>${item.quantity} عدد - ${item.price.toLocaleString('fa-IR')} ریال</p>
            <p class="time">${new Date(item.time).toLocaleString('fa-IR')} - ${item.duration}ms</p>
            ${assetInfo}
        </div>
        `;
    }).join('');
}

// ذخیره در تاریخچه
function saveToHistory(order, duration, asset) {
    const history = JSON.parse(localStorage.getItem('buyHistory') || '[]');
    history.unshift({
        ...order,
        duration,
        time: new Date().toISOString(),
        asset: asset || null
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
        side: formData.get('side') || 'buy',
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
    
    // #region agent log
    fetch('http://127.0.0.1:7246/ingest/683ff133-6664-461e-96f5-e97b30ce0ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.js:69',message:'Fetch request starting',data:{url:'/api/buy',method:'POST',data},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    try {
        // #region agent log
        const fetchStartTime = Date.now();
        fetch('http://127.0.0.1:7246/ingest/683ff133-6664-461e-96f5-e97b30ce0ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.js:75',message:'Before fetch call',data:{body:JSON.stringify(data)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        
        const response = await fetch('/api/buy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        // #region agent log
        const fetchDuration = Date.now() - fetchStartTime;
        fetch('http://127.0.0.1:7246/ingest/683ff133-6664-461e-96f5-e97b30ce0ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.js:86',message:'Fetch response received',data:{status:response.status,statusText:response.statusText,ok:response.ok,fetchDuration},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        
        const result = await response.json();
        
        // #region agent log
        fetch('http://127.0.0.1:7246/ingest/683ff133-6664-461e-96f5-e97b30ce0ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.js:90',message:'Response parsed',data:{success:result.success,hasError:!!result.error},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        
        if (result.success) {
            let statusMessage = result.message;
            let statusType = 'success';
            
            // اضافه کردن پیام validation به status
            if (result.asset?.validation) {
                if (result.asset.validation.isValid && result.asset.validation.severity === 'success') {
                    statusMessage += ` ✅ ${result.asset.validation.message}`;
                } else if (result.asset.validation.severity === 'warning') {
                    statusMessage += ` ⚠️ ${result.asset.validation.message}`;
                    statusType = 'warning';
                } else if (result.asset.validation.severity === 'error') {
                    statusMessage += ` ❌ ${result.asset.validation.message}`;
                    statusType = 'error';
                }
            }
            
            showStatus(`✅ ${statusMessage} - زمان: ${result.duration}ms`, statusType);
            saveToHistory(result.order, result.duration, result.asset);
            
            // به‌روزرسانی نمایش دارایی
            if (result.asset) {
                updateAssetDisplay(result.asset);
            }
        } else {
            showStatus(`❌ خطا: ${result.error}`, 'error');
        }
    } catch (error) {
        // #region agent log
        fetch('http://127.0.0.1:7246/ingest/683ff133-6664-461e-96f5-e97b30ce0ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.js:100',message:'Fetch error caught',data:{errorName:error.name,errorMessage:error.message,errorStack:error.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        showStatus(`❌ خطای ارتباطی: ${error.message}`, 'error');
    } finally {
        buyBtn.disabled = false;
        updateBuyButtonText();
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

// مقداردهی اولیه نمایش دارایی
if (assetDisplay) {
    assetDisplay.innerHTML = '<p>هنوز معامله‌ای انجام نشده است</p>';
}

// ========== مدیریت لاگ‌ها ==========
const logsContainer = document.getElementById('logsContainer');
const refreshLogsBtn = document.getElementById('refreshLogsBtn');
const logTypeFilter = document.getElementById('logTypeFilter');

// فرمت کردن timestamp به تاریخ فارسی
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };
    return date.toLocaleString('fa-IR', options);
}

// رنگ‌بندی بر اساس level
function getLogLevelColor(level) {
    switch (level) {
        case 'ERROR':
            return '#f44336';
        case 'WARN':
            return '#ff9800';
        case 'INFO':
            return '#2196F3';
        case 'DEBUG':
            return '#9e9e9e';
        default:
            return '#667eea';
    }
}

// فرمت کردن لاگ entry
function formatLogEntry(entry) {
    const levelColor = getLogLevelColor(entry.level);
    const timestamp = formatTimestamp(entry.timestamp);
    
    let dataHtml = '';
    if (entry.data) {
        try {
            dataHtml = `<pre class="log-data">${JSON.stringify(entry.data, null, 2)}</pre>`;
        } catch (e) {
            dataHtml = `<pre class="log-data">${String(entry.data)}</pre>`;
        }
    }
    
    let errorHtml = '';
    if (entry.error) {
        errorHtml = `
            <div class="log-error">
                <strong>خطا:</strong> ${entry.error.message}
                ${entry.error.stack ? `<pre class="log-stack">${entry.error.stack}</pre>` : ''}
            </div>
        `;
    }
    
    let performanceHtml = '';
    if (entry.performance) {
        performanceHtml = `
            <div class="log-performance">
                <strong>عملکرد:</strong> ${entry.performance.operation} - ${entry.performance.duration}ms
            </div>
        `;
    }
    
    return `
        <div class="log-entry" style="border-left-color: ${levelColor}">
            <div class="log-header">
                <span class="log-level" style="color: ${levelColor}">${entry.level}</span>
                <span class="log-location">${entry.location}</span>
                <span class="log-time">${timestamp}</span>
            </div>
            <div class="log-message">${entry.message}</div>
            ${dataHtml}
            ${errorHtml}
            ${performanceHtml}
        </div>
    `;
}

// بارگذاری لاگ‌ها
async function loadLogs() {
    const selectedType = logTypeFilter.value;
    const types = selectedType === 'all' 
        ? ['buy', 'info', 'warn', 'error', 'performance']
        : [selectedType];
    
    logsContainer.innerHTML = '<p class="loading">در حال بارگذاری لاگ‌ها...</p>';
    
    try {
        const typesParam = types.join(',');
        const response = await fetch(`/api/logs?limit=50&types=${typesParam}`);
        const result = await response.json();
        
        if (result.success) {
            if (result.logs.length === 0) {
                logsContainer.innerHTML = '<p class="no-logs">لاگی یافت نشد</p>';
                return;
            }
            
            logsContainer.innerHTML = result.logs.map(formatLogEntry).join('');
        } else {
            logsContainer.innerHTML = `<p class="error">خطا در بارگذاری لاگ‌ها: ${result.error}</p>`;
        }
    } catch (error) {
        logsContainer.innerHTML = `<p class="error">خطای ارتباطی: ${error.message}</p>`;
    }
}

// Event listeners
refreshLogsBtn.addEventListener('click', loadLogs);
logTypeFilter.addEventListener('change', loadLogs);

// بارگذاری لاگ‌ها در ابتدا
loadLogs();

// Auto-refresh هر 10 ثانیه
setInterval(loadLogs, 10000);

