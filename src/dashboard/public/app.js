// #region agent log
fetch('http://127.0.0.1:7246/ingest/683ff133-6664-461e-96f5-e97b30ce0ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.js:scriptLoad',message:'Script file loaded',data:{documentReadyState:document.readyState},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
// #endregion

// صبر برای آماده شدن DOM
document.addEventListener('DOMContentLoaded', function() {
    // #region agent log
    fetch('http://127.0.0.1:7246/ingest/683ff133-6664-461e-96f5-e97b30ce0ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.js:DOMContentLoaded',message:'DOM content loaded',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    // مدیریت فرم خرید
    const buyForm = document.getElementById('buyForm');
    const statusDiv = document.getElementById('status');
    const historyDiv = document.getElementById('history');
    const assetDisplay = document.getElementById('assetDisplay');
    const buyBtn = document.getElementById('buyBtn');
    const loginBtn = document.getElementById('loginBtn');
    const sideSelect = document.getElementById('side');
    
    // #region agent log
    fetch('http://127.0.0.1:7246/ingest/683ff133-6664-461e-96f5-e97b30ce0ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.js:elementsCheck',message:'DOM elements retrieved',data:{buyFormExists:!!buyForm,buyBtnExists:!!buyBtn,sideSelectExists:!!sideSelect,statusDivExists:!!statusDiv},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    // به‌روزرسانی متن دکمه بر اساس نوع سفارش
    function updateBuyButtonText() {
        // #region agent log
        fetch('http://127.0.0.1:7246/ingest/683ff133-6664-461e-96f5-e97b30ce0ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.js:updateBuyButtonText',message:'Function called',data:{sideSelectExists:!!sideSelect,buyBtnExists:!!buyBtn,sideSelectValue:sideSelect?.value},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        
        if (!sideSelect || !buyBtn) {
            // #region agent log
            fetch('http://127.0.0.1:7246/ingest/683ff133-6664-461e-96f5-e97b30ce0ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.js:updateBuyButtonText:error',message:'Missing elements',data:{sideSelectExists:!!sideSelect,buyBtnExists:!!buyBtn},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
            return;
        }
        
        const selectedSide = sideSelect.value;
        
        // #region agent log
        fetch('http://127.0.0.1:7246/ingest/683ff133-6664-461e-96f5-e97b30ce0ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.js:updateBuyButtonText',message:'Side value read',data:{selectedSide,beforeText:buyBtn?.textContent},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        
        if (selectedSide === 'sell') {
            buyBtn.textContent = '💰 فروش';
        } else {
            buyBtn.textContent = '🚀 خرید';
        }
        
        // #region agent log
        fetch('http://127.0.0.1:7246/ingest/683ff133-6664-461e-96f5-e97b30ce0ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.js:updateBuyButtonText',message:'Button text updated',data:{afterText:buyBtn?.textContent,selectedSide},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
    }

    // Event listener برای تغییر نوع سفارش
    if (sideSelect) {
        // #region agent log
        fetch('http://127.0.0.1:7246/ingest/683ff133-6664-461e-96f5-e97b30ce0ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.js:setupListener',message:'Setting up side select listener',data:{sideSelectExists:!!sideSelect},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        
        sideSelect.addEventListener('change', (e) => {
            // #region agent log
            fetch('http://127.0.0.1:7246/ingest/683ff133-6664-461e-96f5-e97b30ce0ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.js:sideSelect:change',message:'Side select changed',data:{newValue:e.target.value,oldValue:sideSelect.value},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
            
            updateBuyButtonText();
        });
        
        // به‌روزرسانی اولیه دکمه هنگام بارگذاری صفحه
        // #region agent log
        fetch('http://127.0.0.1:7246/ingest/683ff133-6664-461e-96f5-e97b30ce0ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.js:initialUpdate',message:'Initial button update on page load',data:{sideSelectValue:sideSelect?.value},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        updateBuyButtonText();
    } else {
        // #region agent log
        fetch('http://127.0.0.1:7246/ingest/683ff133-6664-461e-96f5-e97b30ce0ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.js:sideSelectMissing',message:'sideSelect element not found',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
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

    // نمایش/مخفی کردن checkbox testAll بر اساس انتخاب model
    const modelSelect = document.getElementById('model');
    const testAllGroup = document.getElementById('testAllGroup');

if (modelSelect && testAllGroup) {
    modelSelect.addEventListener('change', (e) => {
        if (e.target.value === 'all') {
            testAllGroup.style.display = 'block';
        } else {
            testAllGroup.style.display = 'none';
        }
    });
}

    // مدیریت فرم خرید
    if (!buyForm) {
        // #region agent log
        fetch('http://127.0.0.1:7246/ingest/683ff133-6664-461e-96f5-e97b30ce0ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.js:buyFormMissing',message:'buyForm element not found',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        return;
    }
    
    buyForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(buyForm);
    const sideValue = formData.get('side') || 'buy';
    
    // #region agent log
    fetch('http://127.0.0.1:7246/ingest/683ff133-6664-461e-96f5-e97b30ce0ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.js:form:submit',message:'Form submitted',data:{symbol:formData.get('symbol'),price:formData.get('price'),quantity:formData.get('quantity'),model:formData.get('model'),side:sideValue,debug:formData.get('debug'),testAll:formData.get('testAll')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    
    const data = {
        symbol: formData.get('symbol'),
        price: parseInt(formData.get('price')),
        quantity: parseInt(formData.get('quantity')),
        model: formData.get('model'),
        side: sideValue,
        debug: formData.get('debug') === 'on',
        testAll: formData.get('testAll') === 'on'
    };
    
    // #region agent log
    fetch('http://127.0.0.1:7246/ingest/683ff133-6664-461e-96f5-e97b30ce0ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.js:form:submit',message:'Data object created',data:{...data,sideInData:data.side},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    
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
            let statusHtml = '';
            
            // اگر multi-model execution انجام شده، نمایش نتایج
            if (result.multiModel) {
                const mm = result.multiModel;
                statusHtml = `
                    <div class="multi-model-results" style="margin-top: 15px; padding: 10px; background: #f5f5f5; border-radius: 5px;">
                        <h3 style="margin-top: 0;">نتایج همه مدل‌ها:</h3>
                        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                            <thead>
                                <tr style="background: #e0e0e0;">
                                    <th style="padding: 8px; text-align: right; border: 1px solid #ccc;">مدل</th>
                                    <th style="padding: 8px; text-align: center; border: 1px solid #ccc;">زمان (ms)</th>
                                    <th style="padding: 8px; text-align: center; border: 1px solid #ccc;">وضعیت</th>
                                </tr>
                            </thead>
                            <tbody>
                `;
                
                mm.results.forEach(r => {
                    const statusIcon = r.success && !r.skipped ? '✅' : r.skipped ? '⏭️' : '❌';
                    const statusText = r.success && !r.skipped ? 'موفق' : r.skipped ? 'Skip شد' : 'ناموفق';
                    const rowStyle = r.success && !r.skipped ? 'background: #e8f5e9;' : r.skipped ? 'background: #fff3e0;' : 'background: #ffebee;';
                    
                    statusHtml += `
                        <tr style="${rowStyle}">
                            <td style="padding: 8px; border: 1px solid #ccc;">${r.modelName}</td>
                            <td style="padding: 8px; text-align: center; border: 1px solid #ccc;">${r.duration}</td>
                            <td style="padding: 8px; text-align: center; border: 1px solid #ccc;">${statusIcon} ${statusText}</td>
                        </tr>
                    `;
                });
                
                statusHtml += `
                            </tbody>
                        </table>
                `;
                
                if (mm.bestModel) {
                    statusHtml += `
                        <p style="margin-top: 10px; font-weight: bold; color: #2e7d32;">
                            🏆 بهترین مدل: ${mm.bestModel.modelName} (${mm.bestModel.duration}ms)
                        </p>
                    `;
                }
                
                statusHtml += `
                        <p style="margin-top: 5px; font-size: 0.9em; color: #666;">
                            موفق: ${mm.successfulCount} | ناموفق: ${mm.failedCount} | Skip: ${mm.skippedCount}
                        </p>
                    </div>
                `;
            }
            
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
            
            // نمایش status با HTML
            statusDiv.className = `status-info ${statusType}`;
            statusDiv.innerHTML = `<p>✅ ${statusMessage} - زمان: ${result.duration}ms</p>${statusHtml}`;
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
        fetch('http://127.0.0.1:7246/ingest/683ff133-6664-461e-96f5-e97b30ce0ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.js:catch',message:'Fetch error caught',data:{errorName:error.name,errorMessage:error.message,errorStack:error.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        showStatus(`❌ خطای ارتباطی: ${error.message}`, 'error');
    } finally {
        // #region agent log
        fetch('http://127.0.0.1:7246/ingest/683ff133-6664-461e-96f5-e97b30ce0ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.js:finally',message:'In finally block',data:{buyBtnDisabled:buyBtn.disabled,sideSelectValue:sideSelect?.value,buyBtnText:buyBtn?.textContent},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        
        buyBtn.disabled = false;
        
        // #region agent log
        fetch('http://127.0.0.1:7246/ingest/683ff133-6664-461e-96f5-e97b30ce0ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.js:finally',message:'Before updateBuyButtonText',data:{beforeText:buyBtn?.textContent,sideSelectValue:sideSelect?.value},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        
        updateBuyButtonText();
        
        // #region agent log
        fetch('http://127.0.0.1:7246/ingest/683ff133-6664-461e-96f5-e97b30ce0ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.js:finally',message:'After updateBuyButtonText',data:{afterText:buyBtn?.textContent,sideSelectValue:sideSelect?.value},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
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

    if (!logsContainer || !refreshLogsBtn || !logTypeFilter) {
        // #region agent log
        fetch('http://127.0.0.1:7246/ingest/683ff133-6664-461e-96f5-e97b30ce0ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.js:logsElementsMissing',message:'Log elements not found',data:{logsContainerExists:!!logsContainer,refreshLogsBtnExists:!!refreshLogsBtn,logTypeFilterExists:!!logTypeFilter},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        return; // اگر elements لاگ موجود نیست، ادامه نده
    }

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
    if (refreshLogsBtn) {
        refreshLogsBtn.addEventListener('click', loadLogs);
    }
    if (logTypeFilter) {
        logTypeFilter.addEventListener('change', loadLogs);
    }

    // بارگذاری لاگ‌ها در ابتدا
    if (logsContainer && logTypeFilter) {
        loadLogs();
        // Auto-refresh هر 10 ثانیه
        setInterval(loadLogs, 10000);
    }
}); // End of DOMContentLoaded

