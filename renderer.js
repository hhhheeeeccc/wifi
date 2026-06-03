// DOM Elements
const adminStatus = document.getElementById('adminStatus');
const s1Status = document.getElementById('s1Status');
const hotspotStatus = document.getElementById('hotspotStatus');
const hotspotStatusBadge = document.getElementById('hotspotStatusBadge');
const currentSSID = document.getElementById('currentSSID');
const clientCount = document.getElementById('clientCount');
const connectedBadge = document.getElementById('connectedBadge');
const ssidInput = document.getElementById('ssid');
const passInput = document.getElementById('password');
const startBtn = document.getElementById('startBtn');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const blockP2PCheckbox = document.getElementById('blockP2P');
const clientList = document.getElementById('clientList');
const msg = document.getElementById('msg');

let isHotspotRunning = false;
let updateInterval = null;

/**
 * عرض رسالة في واجهة المستخدم
 * @param {string} message - نص الرسالة
 * @param {string} type - نوع الرسالة (success, error, info)
 * @param {number} duration - مدة الرسالة بالميلي ثانية (0 = بدون حد)
 */
function showMessage(message, type = 'info', duration = 0) {
    msg.textContent = message;
    msg.className = '';
    
    if (type === 'success') {
        msg.className = 'msg-success';
    } else if (type === 'error') {
        msg.className = 'msg-error';
    } else {
        msg.className = 'msg-info';
    }
    
    if (duration > 0) {
        setTimeout(() => {
            msg.textContent = '';
            msg.className = '';
        }, duration);
    }
}

/**
 * تحديث حالة النظام
 */
async function updateStatus() {
    try {
        const info = await window.electronAPI.getSystemInfo();
        
        // تحديث معلومات الصلاحيات
        adminStatus.textContent = info.isAdmin ? '✅ نعم' : '❌ لا';
        s1Status.textContent = info.s1Running ? '🔒 يعمل (محمي)' : '✓ غير موجود';
        
        // تحديث قائمة الأجهزة إذا كانت نقطة الاتصال تعمل
        if (isHotspotRunning) {
            const clients = await window.electronAPI.getConnectedClients();
            updateClientList(clients);
        }
    } catch (err) {
        console.error('خطأ في تحديث الحالة:', err);
    }
}

/**
 * تحديث قائمة الأجهزة المتصلة
 * @param {Array} clients - قائمة الأجهزة المتصلة
 */
function updateClientList(clients) {
    if (!clients || clients.length === 0) {
        clientList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📶</div>
                <p>لا توجد أجهزة متصلة حالياً</p>
            </div>
        `;
        clientCount.textContent = '0';
        connectedBadge.textContent = '0';
        return;
    }

    // تحديث عدد الأجهزة المتصلة
    clientCount.textContent = clients.length;
    connectedBadge.textContent = clients.length;
    
    // مسح القائمة القديمة
    clientList.innerHTML = '';
    
    // إضافة الأجهزة الجديدة
    clients.forEach((client, index) => {
        const li = document.createElement('li');
        li.className = 'client-item';
        li.innerHTML = `
            <div class="client-info">
                <span class="client-name">
                    <strong>${index + 1}. ${client.name || 'جهاز غير معروف'}</strong>
                </span>
                <span class="client-mac">MAC: ${client.mac}</span>
            </div>
            <div class="client-ip">${client.ip}</div>
        `;
        clientList.appendChild(li);
    });
}

/**
 * تشغيل/إيقاف نقطة الاتصال
 */
startBtn.addEventListener('click', async () => {
    // إذا كانت نقطة الاتصال تعمل، سيتم إيقافها
    if (isHotspotRunning) {
        showMessage('جارٍ إيقاف نقطة الاتصال...', 'info');
        startBtn.disabled = true;
        
        const result = await window.electronAPI.stopHotspot();
        
        if (result.success) {
            isHotspotRunning = false;
            hotspotStatus.textContent = 'مغلقة';
            hotspotStatusBadge.className = 'status-badge badge-off';
            currentSSID.textContent = '---';
            startBtn.innerHTML = '<span>▶️</span><span>تشغيل الشبكة</span>';
            startBtn.className = 'btn btn-success';
            showMessage('✅ تم إيقاف نقطة الاتصال بنجاح', 'success', 3000);
            clientCount.textContent = '0';
            connectedBadge.textContent = '0';
            updateClientList([]);
            
            // إيقاف تحديث قائمة الأجهزة
            if (updateInterval) {
                clearInterval(updateInterval);
                updateInterval = null;
            }
        } else {
            showMessage('❌ فشل الإيقاف: ' + result.error, 'error', 3000);
        }
        
        startBtn.disabled = false;
        return;
    }

    // التحقق من كلمة المرور
    if (passInput.value.length < 8) {
        showMessage('❌ كلمة المرور يجب أن تكون 8 أحرف على الأقل', 'error', 3000);
        return;
    }

    // التحقق من اسم الشبكة
    if (!ssidInput.value || ssidInput.value.trim().length === 0) {
        showMessage('❌ يجب إدخال اسم الشبكة', 'error', 3000);
        return;
    }

    showMessage('جارٍ تشغيل نقطة الاتصال...', 'info');
    startBtn.disabled = true;

    const result = await window.electronAPI.startHotspot({
        ssid: ssidInput.value,
        password: passInput.value
    });

    if (result.success) {
        isHotspotRunning = true;
        hotspotStatus.textContent = 'نشطة الآن ✓';
        hotspotStatusBadge.className = 'status-badge badge-on';
        currentSSID.textContent = ssidInput.value;
        startBtn.innerHTML = '<span>⏹️</span><span>إيقاف الشبكة</span>';
        startBtn.className = 'btn btn-danger';
        showMessage('✅ تم تشغيل الشبكة بنجاح!', 'success', 3000);
        
        // بدء تحديث قائمة الأجهزة كل 5 ثواني
        if (updateInterval) {
            clearInterval(updateInterval);
        }
        updateInterval = setInterval(updateStatus, 5000);
    } else {
        showMessage('❌ فشل التشغيل: ' + result.error, 'error', 3000);
    }
    
    startBtn.disabled = false;
});

/**
 * حفظ إعدادات الأمان
 */
saveSettingsBtn.addEventListener('click', async () => {
    saveSettingsBtn.disabled = true;
    showMessage('جارٍ تطبيق إعدادات الأمان...', 'info');

    const shouldBlock = blockP2PCheckbox.checked;
    const result = await window.electronAPI.toggleP2PBlock(shouldBlock);

    if (result.success) {
        const action = shouldBlock ? 'تفعيل' : 'تعطيل';
        showMessage(`✅ تم ${action} حظر P2P بنجاح`, 'success', 3000);
    } else {
        showMessage('❌ فشل تطبيق الإعدادات: ' + result.error, 'error', 3000);
    }

    saveSettingsBtn.disabled = false;
});

/**
 * إعادة تعيين الإعدادات
 */
const resetBtn = document.querySelector('button:nth-of-type(2)');
if (resetBtn) {
    resetBtn.addEventListener('click', () => {
        ssidInput.value = 'WiFiHotspotPro';
        passInput.value = 'Pass1234!';
        blockP2PCheckbox.checked = false;
        showMessage('✅ تم إعادة تعيين الإعدادات الافتراضية', 'success', 2000);
    });
}

/**
 * تحديث معلومات الحالة عند تحميل الصفحة
 */
document.addEventListener('DOMContentLoaded', () => {
    updateStatus();
    // تحديث الحالة كل 10 ثواني
    setInterval(updateStatus, 10000);
});

/**
 * تنظيف عند إغلاق الصفحة
 */
window.addEventListener('beforeunload', () => {
    if (updateInterval) {
        clearInterval(updateInterval);
    }
});
