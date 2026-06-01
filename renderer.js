const adminStatus = document.getElementById('adminStatus');
const s1Status = document.getElementById('s1Status');
const wifiName = document.getElementById('wifiName');
const ssidInput = document.getElementById('ssid');
const passInput = document.getElementById('password');
const startBtn = document.getElementById('startBtn');
const safeModeBtn = document.getElementById('safeModeBtn');
const normalModeBtn = document.getElementById('normalModeBtn');
const helpBtn = document.getElementById('helpBtn');
const msg = document.getElementById('msg');

async function updateStatus() {
    const info = await window.electronAPI.getSystemInfo();
    adminStatus.textContent = info.isAdmin ? 'True' : 'False';
    s1Status.textContent = info.s1Running ? 'RUNNING' : 'NOT FOUND';

    if (info.inSafeMode) {
        normalModeBtn.style.display = 'block';
        safeModeBtn.style.display = 'none';
    } else {
        normalModeBtn.style.display = 'none';
        safeModeBtn.style.display = 'block';
    }

    if (info.wifiInfo && !info.wifiInfo.error) {
        const adapter = Array.isArray(info.wifiInfo) ? info.wifiInfo[0] : info.wifiInfo;
        wifiName.textContent = adapter ? adapter.Name : 'No WiFi';
    } else {
        wifiName.textContent = 'Error';
    }
}

startBtn.addEventListener('click', async () => {
    msg.textContent = 'جارٍ التشغيل... قد يستغرق 10-20 ثانية';
    const result = await window.electronAPI.startHotspot({
        ssid: ssidInput.value,
        password: passInput.value
    });

    if (result.success) {
        msg.textContent = '✅ الهوتسبوت يعمل بنجاح!';
    } else {
        msg.textContent = '❌ فشل التشغيل: ' + result.error;
    }
});

safeModeBtn.addEventListener('click', async () => {
    if (confirm('سيتم إعادة تشغيل الكمبيوتر في الوضع الآمن (Safe Mode). هل أنت متأكد؟')) {
        await window.electronAPI.enableSafeMode();
    }
});

normalModeBtn.addEventListener('click', async () => {
    if (confirm('سيتم إعادة تشغيل الكمبيوتر في الوضع الطبيعي. هل أنت متأكد؟')) {
        await window.electronAPI.disableSafeMode();
    }
});

helpBtn.addEventListener('click', () => {
    window.electronAPI.openDocs();
});

updateStatus();
setInterval(updateStatus, 5000);
