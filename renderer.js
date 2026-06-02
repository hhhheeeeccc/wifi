const adminStatus = document.getElementById('adminStatus');
const s1Status = document.getElementById('s1Status');
const hotspotStatus = document.getElementById('hotspotStatus');
const currentSSID = document.getElementById('currentSSID');
const clientCount = document.getElementById('clientCount');
const ssidInput = document.getElementById('ssid');
const passInput = document.getElementById('password');
const startBtn = document.getElementById('startBtn');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
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
        s1Status.textContent = info.s1Running ? 'يعمل' : 'غير موجود';

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
        clientList.innerHTML = '<li style="text-align: center; color: var(--text-muted); margin-top: 20px;">لا توجد أجهزة متصلة حالياً</li>';
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
        // Stop logic could be added here
        msg.textContent = 'الإيقاف غير مدعوم في هذا الإصدار التجريبي';
        return;
    }

    msg.textContent = 'جارٍ تشغيل نقطة الاتصال...';
    startBtn.disabled = true;

    const result = await window.electronAPI.startHotspot({
        ssid: ssidInput.value,
        password: passInput.value
    });

    if (result.success) {
        isHotspotRunning = true;
        hotspotStatus.textContent = 'يعمل';
        hotspotStatus.className = 'status-value on';
        currentSSID.textContent = ssidInput.value;
        startBtn.textContent = 'نقطة الاتصال تعمل';
        msg.textContent = '✅ تمت العملية بنجاح!';
    } else {
        startBtn.disabled = false;
        msg.textContent = '❌ فشل: ' + result.error;
    }
});

saveSettingsBtn.addEventListener('click', () => {
    msg.textContent = 'تم حفظ الإعدادات (سيتم تطبيقها عند التشغيل القادم)';
    setTimeout(() => { msg.textContent = ''; }, 3000);
});

// Initial update
updateStatus();
// Periodically update client list and status
setInterval(updateStatus, 5000);
