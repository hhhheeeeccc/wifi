/**
 * WiFi Hotspot Pro - تطبيق الواجهة الرئيسية
 */

const translations = {
    ar: {
        appTitle: "WiFi Hotspot Pro",
        appSubtitle: "تطبيق احترافي لمشاركة الإنترنت عبر نقطة اتصال واي فاي",
        tabHome: "🏠 الرئيسية",
        tabClients: "👥 الأجهزة",
        tabSharing: "📂 المشاركة",
        tabLogs: "📋 السجلات",
        tabSettings: "⚙️ الإعدادات",
        systemStatus: "🔍 حالة النظام",
        privileges: "الصلاحيات",
        protection: "الحماية",
        hotspotState: "حالة الشبكة",
        closed: "مغلقة",
        networkName: "اسم الشبكة",
        quickConnect: "📱 رمز الاتصال السريع",
        scanToConnect: "امسح الكود للاتصال فوراً",
        networkControl: "⚙️ التحكم بالشبكة",
        ssidLabel: "اسم الشبكة (SSID)",
        passwordLabel: "كلمة المرور",
        startHotspot: "تشغيل الشبكة",
        stopHotspot: "إيقاف الشبكة",
        qrCode: "رمز QR",
        connectedDevices: "👥 الأجهزة المتصلة",
        noClients: "لا توجد أجهزة متصلة حالياً",
        fileSharing: "📂 مشاركة الملفات المحلية",
        sharingDesc: "شارك الملفات مع الأجهزة المتصلة بالشبكة بسهولة.",
        startSharing: "تشغيل خادم المشاركة",
        stopSharing: "إيقاف المشاركة",
        sharingLink: "رابط المشاركة:",
        sharingLinkDesc: "يمكن للمتصلين فتح هذا الرابط في المتصفح",
        openSharedFolder: "فتح مجلد المشاركة",
        connectionLogs: "📋 سجلات الاتصال",
        clearLogs: "مسح السجل",
        logTime: "الوقت",
        logEvent: "الحدث",
        advancedSecurity: "🔒 الأمان المتقدم",
        blockP2PLabel: "حظر تطبيقات مشاركة الملفات (P2P)",
        enableLogsLabel: "تفعيل تتبع الروابط (Logging)",
        enablePortalLabel: "تفعيل بوابة المصادقة (Captive Portal)",
        languageLabel: "اللغة (Language)",
        saveSettings: "حفظ الإعدادات",
        openSource: "تطبيق مفتوح المصدر",
        allRightsReserved: "جميع الحقوق محفوظة ©",
        portForwarding: "توجيه المنافذ (Port Forwarding)"
    },
    en: {
        appTitle: "WiFi Hotspot Pro",
        appSubtitle: "Professional Internet Sharing via WiFi Hotspot",
        tabHome: "🏠 Home",
        tabClients: "👥 Clients",
        tabSharing: "📂 Sharing",
        tabLogs: "📋 Logs",
        tabSettings: "⚙️ Settings",
        systemStatus: "🔍 System Status",
        privileges: "Privileges",
        protection: "Protection",
        hotspotState: "Hotspot State",
        closed: "Closed",
        networkName: "Network Name",
        quickConnect: "📱 Quick Connect",
        scanToConnect: "Scan code to connect instantly",
        networkControl: "⚙️ Network Control",
        ssidLabel: "Network Name (SSID)",
        passwordLabel: "Password",
        startHotspot: "Start Network",
        stopHotspot: "Stop Network",
        qrCode: "QR Code",
        connectedDevices: "👥 Connected Devices",
        noClients: "No devices connected currently",
        fileSharing: "📂 Local File Sharing",
        sharingDesc: "Share files easily with connected devices.",
        startSharing: "Start Sharing Server",
        stopSharing: "Stop Sharing",
        sharingLink: "Sharing Link:",
        sharingLinkDesc: "Clients can open this link in their browser",
        openSharedFolder: "Open Shared Folder",
        connectionLogs: "📋 Connection Logs",
        clearLogs: "Clear Logs",
        logTime: "Time",
        logEvent: "Event",
        advancedSecurity: "🔒 Advanced Security",
        blockP2PLabel: "Block P2P File Sharing",
        enableLogsLabel: "Enable URL Logging",
        enablePortalLabel: "Enable Captive Portal",
        languageLabel: "Language",
        saveSettings: "Save Settings",
        openSource: "Open Source App",
        allRightsReserved: "All rights reserved ©",
        portForwarding: "Port Forwarding"
    }
};

class WiFiHotspotApp {
  constructor() {
    this.state = {
      isHotspotRunning: false,
      isSharingRunning: false,
      updateInterval: null,
      blacklist: [],
      language: 'ar'
    };
    this.initializeElements();
    this.attachEventListeners();
    this.initializeApp();
  }

  initializeElements() {
    this.elements = {
      adminStatus: document.getElementById('adminStatus'),
      s1Status: document.getElementById('s1Status'),
      hotspotStatus: document.getElementById('hotspotStatus'),
      hotspotStatusBadge: document.getElementById('hotspotStatusBadge'),
      currentSSID: document.getElementById('currentSSID'),
      clientCount: document.getElementById('clientCount'),
      connectedBadge: document.getElementById('connectedBadge'),
      ssidInput: document.getElementById('ssid'),
      passwordInput: document.getElementById('password'),
      blockP2PCheckbox: document.getElementById('blockP2P'),
      enableLogsCheckbox: document.getElementById('enableLogs'),
      enablePortalCheckbox: document.getElementById('enablePortal'),
      langSelect: document.getElementById('langSelect'),
      startBtn: document.getElementById('startBtn'),
      saveSettingsBtn: document.getElementById('saveSettingsBtn'),
      showQRBtn: document.getElementById('showQRBtn'),
      startSharingBtn: document.getElementById('startSharingBtn'),
      stopSharingBtn: document.getElementById('stopSharingBtn'),
      openFolderBtn: document.getElementById('openFolderBtn'),
      clearLogsBtn: document.getElementById('clearLogsBtn'),
      addPortBtn: document.getElementById('addPortBtn'),
      listenPortInput: document.getElementById('listenPort'),
      targetIpInput: document.getElementById('targetIp'),
      targetPortInput: document.getElementById('targetPort'),
      clientList: document.getElementById('clientList'),
      logsTableBody: document.getElementById('logsTableBody'),
      messageElement: document.getElementById('msg'),
      tabs: document.querySelectorAll('.tab'),
      tabContents: document.querySelectorAll('.tab-content'),
      qrContainer: document.getElementById('qrContainer'),
      qrImage: document.getElementById('qrImage'),
      shareInfo: document.getElementById('shareInfo'),
      shareUrlText: document.getElementById('shareUrlText'),
    };
  }

  attachEventListeners() {
    this.elements.startBtn?.addEventListener('click', () => this.handleStartStop());
    this.elements.saveSettingsBtn?.addEventListener('click', () => this.handleSaveSettings());
    this.elements.showQRBtn?.addEventListener('click', () => this.toggleQR());
    this.elements.startSharingBtn?.addEventListener('click', () => this.startSharing());
    this.elements.stopSharingBtn?.addEventListener('click', () => this.stopSharing());
    this.elements.openFolderBtn?.addEventListener('click', () => window.electronAPI.openSharedFolder());
    this.elements.clearLogsBtn?.addEventListener('click', () => this.clearLogs());
    this.elements.addPortBtn?.addEventListener('click', () => this.addPortForward());
    this.elements.tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            this.switchTab(tab.dataset.target);
            if (tab.dataset.target === 'logsTab') this.updateLogs();
        });
    });
    this.elements.langSelect?.addEventListener('change', (e) => this.setLanguage(e.target.value));
  }

  switchTab(targetId) {
    this.elements.tabs.forEach(tab => tab.classList.toggle('active', tab.dataset.target === targetId));
    this.elements.tabContents.forEach(content => content.classList.toggle('active', content.id === targetId));
  }

  async initializeApp() {
    try { this.state.blacklist = await window.electronAPI.getBlacklist() || []; } catch(e) { this.state.blacklist = []; }
    this.setLanguage('ar');
    document.addEventListener('DOMContentLoaded', () => this.updateStatus());
    setInterval(() => this.updateStatus(), 10000);
  }

  setLanguage(lang) {
    this.state.language = lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) el.textContent = translations[lang][key];
    });
  }

  async updateStatus() {
    try {
      const info = await window.electronAPI.getSystemInfo();
      this.updateStatusElements(info);
      if (this.state.isHotspotRunning) await this.updateClientList();
    } catch (error) {
      console.error('Error updating status');
    }
  }

  updateStatusElements(info) {
    this.elements.adminStatus.textContent = info.isAdmin ? '✅' : '❌';
    this.elements.s1Status.textContent = info.s1Running ? '🔒' : '✓';
  }

  async updateClientList() {
    try {
      const clients = await window.electronAPI.getConnectedClients();
      if (!clients || clients.length === 0) {
        this.elements.clientList.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📶</div><p data-i18n="noClients">${translations[this.state.language].noClients}</p></div>`;
        this.elements.clientCount.textContent = '0';
        this.elements.connectedBadge.textContent = '0';
        return;
      }
      this.elements.clientCount.textContent = clients.length;
      this.elements.connectedBadge.textContent = clients.length;
      this.elements.clientList.innerHTML = '';
      clients.forEach((client, index) => {
        const isBlocked = this.state.blacklist.includes(client.mac);
        const li = document.createElement('li');
        li.className = 'client-item' + (isBlocked ? ' blocked-client' : '');
        li.innerHTML = `
          <div class="client-info">
            <span class="client-name"><strong>${index + 1}. ${client.name}</strong></span>
            <span class="client-mac">MAC: ${client.mac}</span>
          </div>
          <div class="client-ip">${client.ip}</div>
          <div class="client-actions">
            ${isBlocked
                ? `<button class="btn btn-success btn-sm" onclick="app.unblockDevice('${client.mac}')">Unblock</button>`
                : `<button class="btn btn-danger btn-sm" onclick="app.blockDevice('${client.mac}', '${client.ip}')">Block</button>`
            }
          </div>`;
        this.elements.clientList.appendChild(li);
      });
    } catch (error) { console.error('Error updating client list:', error); }
  }

  async blockDevice(mac, ip) {
    if (confirm(`Block device ${mac}?`)) {
        const result = await window.electronAPI.blockDevice({ mac, ip });
        if (result.success) {
            this.state.blacklist.push(mac);
            this.updateClientList();
        }
    }
  }

  async unblockDevice(mac) {
    const result = await window.electronAPI.unblockDevice(mac);
    if (result.success) {
        this.state.blacklist = this.state.blacklist.filter(m => m !== mac);
        this.updateClientList();
    }
  }

  async updateLogs() {
    try {
        const logs = await window.electronAPI.getLogs();
        this.elements.logsTableBody.innerHTML = logs.map(log => `<tr><td>${log.timestamp}</td><td>${log.event_type}</td><td>${log.mac || '-'}</td><td>${log.ip || '-'}</td></tr>`).join('') || '<tr><td colspan="4" style="text-align:center">No logs</td></tr>';
    } catch (error) { console.error('Error updating logs:', error); }
  }

  async clearLogs() {
    if (confirm('Clear all logs?')) {
        const result = await window.electronAPI.clearLogs();
        if (result.success) this.updateLogs();
    }
  }

  async startSharing() {
    const result = await window.electronAPI.startSharing({});
    if (result.success) {
        this.state.isSharingRunning = true;
        this.elements.startSharingBtn.style.display = 'none';
        this.elements.stopSharingBtn.style.display = 'inline-block';
        this.elements.shareInfo.style.display = 'block';
        this.elements.shareUrlText.textContent = result.url;
    }
  }

  async stopSharing() {
    await window.electronAPI.stopSharing();
    this.state.isSharingRunning = false;
    this.elements.startSharingBtn.style.display = 'inline-block';
    this.elements.stopSharingBtn.style.display = 'none';
    this.elements.shareInfo.style.display = 'none';
  }

  async addPortForward() {
      const listenPort = this.elements.listenPortInput.value;
      const connectAddr = this.elements.targetIpInput.value;
      const connectPort = this.elements.targetPortInput.value;
      if (!listenPort || !connectAddr || !connectPort) {
          this.showMessage('Please fill all fields', 'error');
          return;
      }
      const result = await window.electronAPI.addPortForward({ listenPort, connectAddr, connectPort });
      if (result.success) this.showMessage('Port forward added', 'success');
      else this.showMessage('Failed to add port forward', 'error');
  }

  async handleStartStop() {
    if (this.state.isHotspotRunning) await this.stopHotspot();
    else await this.startHotspot();
  }

  async startHotspot() {
    if (this.elements.passwordInput.value.length < 8) { this.showMessage('Password too short', 'error'); return; }
    try {
      const result = await window.electronAPI.startHotspot({ ssid: this.elements.ssidInput.value, password: this.elements.passwordInput.value });
      if (result.success) {
        this.state.isHotspotRunning = true;
        this.elements.hotspotStatus.textContent = translations[this.state.language].appTitle + ' Active';
        this.elements.hotspotStatusBadge.className = 'status-badge badge-on';
        this.elements.currentSSID.textContent = this.elements.ssidInput.value;
        this.elements.startBtn.innerHTML = '<span>⏹️</span><span>' + translations[this.state.language].stopHotspot + '</span>';
        this.elements.startBtn.className = 'btn btn-danger';
        this.elements.showQRBtn.style.display = 'block';
        this.generateQR();
        if (this.elements.enablePortalCheckbox.checked) await window.electronAPI.startPortal({});
        this.state.updateInterval = setInterval(() => this.updateStatus(), 5000);
      }
    } finally { this.elements.startBtn.disabled = false; }
  }

  async stopHotspot() {
    try {
      const result = await window.electronAPI.stopHotspot();
      if (result.success) {
        this.state.isHotspotRunning = false;
        this.elements.hotspotStatus.textContent = translations[this.state.language].closed;
        this.elements.hotspotStatusBadge.className = 'status-badge badge-off';
        this.elements.startBtn.innerHTML = '<span>▶️</span><span>' + translations[this.state.language].startHotspot + '</span>';
        this.elements.startBtn.className = 'btn btn-success';
        this.elements.showQRBtn.style.display = 'none';
        this.elements.qrContainer.style.display = 'none';
        await window.electronAPI.stopPortal();
        if (this.state.updateInterval) { clearInterval(this.state.updateInterval); this.state.updateInterval = null; }
      }
    } finally { this.elements.startBtn.disabled = false; }
  }

  async generateQR() {
    try {
        const result = await window.electronAPI.generateWifiQR({ ssid: this.elements.ssidInput.value, password: this.elements.passwordInput.value });
        if (result.success) this.elements.qrImage.src = result.qrDataUrl;
    } catch (error) { console.error('Error generating QR:', error); }
  }

  toggleQR() {
    const isHidden = this.elements.qrContainer.style.display === 'none' || !this.elements.qrContainer.style.display;
    this.elements.qrContainer.style.display = isHidden ? 'block' : 'none';
  }

  async handleSaveSettings() {
    this.showMessage('Applying settings...', 'info');
    await window.electronAPI.toggleP2PBlock(this.elements.blockP2PCheckbox.checked);
    this.showMessage('Settings saved', 'success');
  }

  showMessage(message, type = 'info') {
    this.elements.messageElement.textContent = message;
    this.elements.messageElement.className = `msg-${type}`;
    setTimeout(() => { this.elements.messageElement.textContent = ''; this.elements.messageElement.className = ''; }, 3000);
  }
}

document.addEventListener('DOMContentLoaded', () => { window.app = new WiFiHotspotApp(); });
