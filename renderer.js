const adminStatus = document.getElementById('adminStatus');
const s1Status = document.getElementById('s1Status');
const hotspotStatus = document.getElementById('hotspotStatus');
const topStatus = document.getElementById('topStatus');
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
        adminStatus.textContent = info.isAdmin ? 'نشط' : 'غير نشط';
        s1Status.textContent = info.s1Running ? 'محمي' : 'غير موجود';

        // Dynamic colors for footer status
        adminStatus.style.color = info.isAdmin ? 'var(--success)' : 'var(--danger)';
        s1Status.style.color = info.s1Running ? 'var(--success)' : 'var(--text-muted)';

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
            <li style="text-align: center; color: var(--text-muted); padding: 60px 0;">
                <div style="font-size: 4rem; margin-bottom: 16px; opacity: 0.1;">📶</div>
                <p style="font-weight: 600;">لا توجد أجهزة متصلة حالياً</p>
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

const playIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
const stopIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="6" width="12" height="12"></rect></svg>';

startBtn.addEventListener('click', async () => {
    if (isHotspotRunning) {
        msg.style.color = 'var(--text-muted)';
        msg.textContent = 'جارٍ إيقاف نقطة الاتصال...';
        startBtn.disabled = true;

        const result = await window.electronAPI.stopHotspot();
        if (result.success) {
            isHotspotRunning = false;
            hotspotStatus.textContent = 'مغلق';
            topStatus.className = 'status-badge badge-off';
            currentSSID.textContent = '---';
            startBtn.innerHTML = `${playIcon} <span>تشغيل نقطة الاتصال</span>`;
            startBtn.className = 'btn btn-primary';
            msg.style.color = 'var(--success)';
            msg.textContent = '✅ تم إيقاف نقطة الاتصال بنجاح';
            clientCount.textContent = '0';
            updateClientList([]);
        } else {
            msg.style.color = 'var(--danger)';
            msg.textContent = '❌ فشل الإيقاف: ' + result.error;
        }
        startBtn.disabled = false;
        return;
    }

    if (passInput.value.length < 8) {
        msg.style.color = 'var(--danger)';
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
        topStatus.className = 'status-badge badge-on';
        currentSSID.textContent = ssidInput.value;
        startBtn.innerHTML = `${stopIcon} <span>إيقاف نقطة الاتصال</span>`;
        startBtn.className = 'btn btn-danger';
        msg.style.color = 'var(--success)';
        msg.textContent = '✅ تم تشغيل الشبكة بنجاح!';
    } else {
        msg.style.color = 'var(--danger)';
        msg.textContent = '❌ فشل التشغيل: ' + result.error;
    }
    startBtn.disabled = false;
});

saveSettingsBtn.addEventListener('click', async () => {
    saveSettingsBtn.disabled = true;
    msg.style.color = 'var(--text-muted)';
    msg.textContent = 'جارٍ تطبيق إعدادات الحماية...';

    const shouldBlock = blockP2PCheckbox.checked;
    const result = await window.electronAPI.toggleP2PBlock(shouldBlock);

    if (result.success) {
        msg.style.color = 'var(--success)';
        msg.textContent = '✅ تم حفظ الإعدادات وتحديث قواعد جدار الحماية';
    } else {
        msg.style.color = 'var(--danger)';
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
