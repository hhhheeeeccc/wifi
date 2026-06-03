/**
 * WiFi Hotspot Pro - تطبيق الواجهة الرئيسية
 */

class WiFiHotspotApp {
  constructor() {
    this.state = {
      isHotspotRunning: false,
      updateInterval: null,
    };
    this.initializeElements();
    this.attachEventListeners();
    this.initializeApp();
  }

  /**
   * تهيئة عناصر DOM
   */
  initializeElements() {
    this.elements = {
      // حالة
      adminStatus: document.getElementById('adminStatus'),
      s1Status: document.getElementById('s1Status'),
      hotspotStatus: document.getElementById('hotspotStatus'),
      hotspotStatusBadge: document.getElementById('hotspotStatusBadge'),
      currentSSID: document.getElementById('currentSSID'),
      clientCount: document.getElementById('clientCount'),
      connectedBadge: document.getElementById('connectedBadge'),
      
      // الإدخالات
      ssidInput: document.getElementById('ssid'),
      passwordInput: document.getElementById('password'),
      blockP2PCheckbox: document.getElementById('blockP2P'),
      
      // الأزرار
      startBtn: document.getElementById('startBtn'),
      saveSettingsBtn: document.getElementById('saveSettingsBtn'),
      resetBtn: document.querySelector('button:nth-of-type(2)'),
      
      // القوائم
      clientList: document.getElementById('clientList'),
      
      // الرسائل
      messageElement: document.getElementById('msg'),
    };
  }

  /**
   * ربط مستمعي الأحداث
   */
  attachEventListeners() {
    this.elements.startBtn?.addEventListener('click', () => this.handleStartStop());
    this.elements.saveSettingsBtn?.addEventListener('click', () => this.handleSaveSettings());
    this.elements.resetBtn?.addEventListener('click', () => this.handleReset());
  }

  /**
   * تهيئة التطبيق
   */
  async initializeApp() {
    document.addEventListener('DOMContentLoaded', () => this.updateStatus());
    setInterval(() => this.updateStatus(), 10000);
  }

  /**
   * تحديث الحالة
   */
  async updateStatus() {
    try {
      const info = await window.electronAPI.getSystemInfo();
      this.updateStatusElements(info);
      
      if (this.state.isHotspotRunning) {
        await this.updateClientList();
      }
    } catch (error) {
      this.showMessage('خطأ في تحديث الحالة: ' + error.message, 'error');
    }
  }

  /**
   * تحديث عناصر الحالة
   */
  updateStatusElements(info) {
    this.elements.adminStatus.textContent = info.isAdmin ? '✅ نعم' : '❌ لا';
    this.elements.s1Status.textContent = info.s1Running ? '🔒 يعمل (محمي)' : '✓ غير موجود';
  }

  /**
   * تحديث قائمة الأجهزة
   */
  async updateClientList() {
    try {
      const clients = await window.electronAPI.getConnectedClients();
      
      if (!clients || clients.length === 0) {
        this.elements.clientList.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">📶</div>
            <p>لا توجد أجهزة متصلة حالياً</p>
          </div>
        `;
        this.elements.clientCount.textContent = '0';
        this.elements.connectedBadge.textContent = '0';
        return;
      }
      
      this.elements.clientCount.textContent = clients.length;
      this.elements.connectedBadge.textContent = clients.length;
      this.elements.clientList.innerHTML = '';
      
      clients.forEach((client, index) => {
        const li = document.createElement('li');
        li.className = 'client-item';
        li.innerHTML = `
          <div class="client-info">
            <span class="client-name"><strong>${index + 1}. ${client.name}</strong></span>
            <span class="client-mac">MAC: ${client.mac}</span>
          </div>
          <div class="client-ip">${client.ip}</div>
        `;
        this.elements.clientList.appendChild(li);
      });
    } catch (error) {
      console.error('Error updating client list:', error);
    }
  }

  /**
   * معالج بدء/إيقاف نقطة الاتصال
   */
  async handleStartStop() {
    if (this.state.isHotspotRunning) {
      await this.stopHotspot();
    } else {
      await this.startHotspot();
    }
  }

  /**
   * تشغيل نقطة الاتصال
   */
  async startHotspot() {
    if (this.elements.passwordInput.value.length < 8) {
      this.showMessage('❌ كلمة المرور يجب أن تكون 8 أحرف على الأقل', 'error');
      return;
    }
    
    if (!this.elements.ssidInput.value?.trim()) {
      this.showMessage('❌ يجب إدخال اسم الشبكة', 'error');
      return;
    }
    
    this.showMessage('جاري تشغيل نقطة الاتصال...', 'info');
    this.elements.startBtn.disabled = true;
    
    try {
      const result = await window.electronAPI.startHotspot({
        ssid: this.elements.ssidInput.value,
        password: this.elements.passwordInput.value,
      });
      
      if (result.success) {
        this.state.isHotspotRunning = true;
        this.elements.hotspotStatus.textContent = 'نشطة الآن ✓';
        this.elements.hotspotStatusBadge.className = 'status-badge badge-on';
        this.elements.currentSSID.textContent = this.elements.ssidInput.value;
        this.elements.startBtn.innerHTML = '<span>⏹️</span><span>إيقاف الشبكة</span>';
        this.elements.startBtn.className = 'btn btn-danger';
        this.showMessage('✅ تم تشغيل الشبكة بنجاح!', 'success');
        
        this.state.updateInterval = setInterval(() => this.updateStatus(), 5000);
      } else {
        this.showMessage('❌ فشل التشغيل: ' + result.error, 'error');
      }
    } finally {
      this.elements.startBtn.disabled = false;
    }
  }

  /**
   * إيقاف نقطة الاتصال
   */
  async stopHotspot() {
    this.showMessage('جاري إيقاف نقطة الاتصال...', 'info');
    this.elements.startBtn.disabled = true;
    
    try {
      const result = await window.electronAPI.stopHotspot();
      
      if (result.success) {
        this.state.isHotspotRunning = false;
        this.elements.hotspotStatus.textContent = 'مغلقة';
        this.elements.hotspotStatusBadge.className = 'status-badge badge-off';
        this.elements.currentSSID.textContent = '---';
        this.elements.startBtn.innerHTML = '<span>▶️</span><span>تشغيل الشبكة</span>';
        this.elements.startBtn.className = 'btn btn-success';
        this.showMessage('✅ تم إيقاف نقطة الاتصال بنجاح', 'success');
        
        if (this.state.updateInterval) {
          clearInterval(this.state.updateInterval);
          this.state.updateInterval = null;
        }
        
        this.updateClientList();
      } else {
        this.showMessage('❌ فشل الإيقاف: ' + result.error, 'error');
      }
    } finally {
      this.elements.startBtn.disabled = false;
    }
  }

  /**
   * معالج حفظ الإعدادات
   */
  async handleSaveSettings() {
    this.elements.saveSettingsBtn.disabled = true;
    this.showMessage('جاري تطبيق الإعدادات...', 'info');
    
    try {
      const result = await window.electronAPI.toggleP2PBlock(
        this.elements.blockP2PCheckbox.checked
      );
      
      if (result.success) {
        const action = this.elements.blockP2PCheckbox.checked ? 'تفعيل' : 'تعطيل';
        this.showMessage(`✅ تم ${action} حظر P2P بنجاح`, 'success');
      } else {
        this.showMessage('❌ فشل تطبيق الإعدادات: ' + result.error, 'error');
      }
    } finally {
      this.elements.saveSettingsBtn.disabled = false;
    }
  }

  /**
   * معالج إعادة التعيين
   */
  handleReset() {
    this.elements.ssidInput.value = 'WiFiHotspotPro';
    this.elements.passwordInput.value = 'Pass1234!';
    this.elements.blockP2PCheckbox.checked = false;
    this.showMessage('✅ تم إعادة تعيين الإعدادات الافتراضية', 'success');
  }

  /**
   * عرض الرسائل
   */
  showMessage(message, type = 'info', duration = 3000) {
    const msg = this.elements.messageElement;
    msg.textContent = message;
    msg.className = `msg-${type}`;
    
    if (duration > 0) {
      setTimeout(() => {
        msg.textContent = '';
        msg.className = '';
      }, duration);
    }
  }
}

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  window.app = new WiFiHotspotApp();
});
