const adminStatus = document.getElementById('adminStatus');
const s1Status = document.getElementById('s1Status');
const hotspotStatus = document.getElementById('hotspotStatus');
const hotspotStatusBadge = document.getElementById('hotspotStatusBadge');
const currentSSID = document.getElementById('currentSSID');
const clientCount = document.getElementById('clientCount');
const ssidInput = document.getElementById('ssid');
const passInput = document.getElementById('password');
const startBtn = document.getElementById('startBtn');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const blockP2PCheckbox = document.getElementById('blockP2P');
const clientList = document.getElementById('clientList');
const msg = document.getElementById('msg');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

let isHotspotRunning = false;

// Tab Switching Logic
tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabId = btn.getAttribute('data-tab');

        tabButtons.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));

        btn.classList.add('active');
        document.getElementById(tabId).classList.add('active');
    });
});

async function updateStatus() {
    try {
        const info = await window.electronAPI.getSystemInfo();
        adminStatus.textContent = info.isAdmin ? 'نعم' : 'لا';
        s1Status.textContent = info.s1Running ? 'يعمل (محمي)' : 'غير موجود';

        // Update client list if hotspot is running
        if (isHotspotRunning) {
            const clients = await window.electronAPI.getConnectedClients();
            updateClientList(clients);
        }
    } catch (err) {
        console.error('Error updating status:', err);
    }
}

function updateClientList(clients) {
    if (!clients || clients.length === 0) {
        clientList.innerHTML = `
            <li style="text-align: center; color: var(--text-muted); margin-top: 40px;">
                <div style="font-size: 3rem; margin-bottom: 10px; opacity: 0.2;">📶</div>
                لا توجد أجهزة متصلة حالياً بالشبكة
            </li>
        `;
        clientCount.textContent = '0';
        return;
    }

    clientCount.textContent = clients.length;
    clientList.innerHTML = '';
    clients.forEach(client => {
        const li = document.createElement('li');
        li.className = 'client-item';
        li.innerHTML = `
            <div class="client-info">
                <span class="client-name">${client.name || 'جهاز غير معروف'}</span>
                <span class="client-mac">${client.mac}</span>
            </div>
            <div class="client-ip">${client.ip}</div>
        `;
        clientList.appendChild(li);
    });
}

startBtn.addEventListener('click', async () => {
    if (isHotspotRunning) {
        msg.textContent = 'جارٍ إيقاف نقطة الاتصال...';
        startBtn.disabled = true;
        const result = await window.electronAPI.stopHotspot();
        if (result.success) {
            isHotspotRunning = false;
            hotspotStatus.textContent = 'مغلق';
            hotspotStatusBadge.className = 'status-badge badge-off';
            currentSSID.textContent = '---';
            startBtn.innerHTML = '<span>تشغيل نقطة الاتصال</span>';
            startBtn.className = 'btn btn-primary';
            msg.style.color = 'var(--accent-color)';
            msg.textContent = '✅ تم إيقاف نقطة الاتصال بنجاح';
            clientCount.textContent = '0';
            updateClientList([]);
        } else {
            msg.style.color = 'var(--danger-color)';
            msg.textContent = '❌ فشل الإيقاف: ' + result.error;
        }
        startBtn.disabled = false;
        return;
    }

    if (passInput.value.length < 8) {
        msg.style.color = 'var(--danger-color)';
        msg.textContent = '❌ كلمة المرور يجب أن تكون 8 أحرف على الأقل';
        return;
    }

    msg.style.color = 'var(--text-muted)';
    msg.textContent = 'جارٍ تشغيل نقطة الاتصال...';
    startBtn.disabled = true;

    const result = await window.electronAPI.startHotspot({
        ssid: ssidInput.value,
        password: passInput.value
    });

    if (result.success) {
        isHotspotRunning = true;
        hotspotStatus.textContent = 'يعمل الآن';
        hotspotStatusBadge.className = 'status-badge badge-on';
        currentSSID.textContent = ssidInput.value;
        startBtn.innerHTML = '<span>إيقاف نقطة الاتصال</span>';
        startBtn.className = 'btn btn-danger';
        msg.style.color = 'var(--accent-color)';
        msg.textContent = '✅ تم تشغيل الشبكة بنجاح!';
    } else {
        msg.style.color = 'var(--danger-color)';
        msg.textContent = '❌ فشل التشغيل: ' + result.error;
    }
    startBtn.disabled = false;
});

saveSettingsBtn.addEventListener('click', async () => {
    saveSettingsBtn.disabled = true;
    msg.style.color = 'var(--text-muted)';
    msg.textContent = 'جارٍ تطبيق الإعدادات الحماية...';

    const shouldBlock = blockP2PCheckbox.checked;
    const result = await window.electronAPI.toggleP2PBlock(shouldBlock);

    if (result.success) {
        msg.style.color = 'var(--accent-color)';
        msg.textContent = '✅ تم حفظ الإعدادات وتحديث قواعد جدار الحماية';
    } else {
        msg.style.color = 'var(--danger-color)';
        msg.textContent = '❌ فشل تطبيق القواعد: ' + result.error;
    }

    setTimeout(() => {
        msg.textContent = '';
        saveSettingsBtn.disabled = false;
    }, 3000);
});

// Initial update
updateStatus();
// Periodically update client list and status
setInterval(updateStatus, 5000);
