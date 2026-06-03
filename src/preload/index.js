/**
 * Preload Script - جسر آمن بين العمليات
 */

const { contextBridge, ipcRenderer } = require('electron');

/**
 * تعريض API الآمن للواجهة
 */
contextBridge.exposeInMainWorld('electronAPI', {
  // معالجات النظام
  getSystemInfo: async () => {
    const [isAdmin, s1Running, wifiInfo] = await Promise.all([
      ipcRenderer.invoke('system:check-admin'),
      ipcRenderer.invoke('system:check-sentinel-one'),
      ipcRenderer.invoke('system:get-wifi-info'),
    ]);
    return { isAdmin, s1Running, wifiInfo };
  },
  
  getConnectedClients: () => ipcRenderer.invoke('system:get-connected-clients'),
  
  // معالجات نقطة الاتصال
  startHotspot: (credentials) => ipcRenderer.invoke('hotspot:start', credentials),
  stopHotspot: () => ipcRenderer.invoke('hotspot:stop'),
  getHotspotStatus: () => ipcRenderer.invoke('hotspot:get-status'),
  
  // معالجات الجدار الناري
  toggleP2PBlock: (enable) => ipcRenderer.invoke('firewall:toggle-p2p-block', enable),

  // معالجات QR
  generateWifiQR: (credentials) => ipcRenderer.invoke('qr:generate', credentials),

  // معالجات الأجهزة
  getBlacklist: () => ipcRenderer.invoke('devices:get-blacklist'),
  blockDevice: (data) => ipcRenderer.invoke('devices:block', data),
  unblockDevice: (mac) => ipcRenderer.invoke('devices:unblock', mac),

  // معالجات المشاركة
  startSharing: (options) => ipcRenderer.invoke('sharing:start', options),
  stopSharing: () => ipcRenderer.invoke('sharing:stop'),
  openSharedFolder: () => ipcRenderer.invoke('sharing:open-folder'),

  // معالجات السجلات
  getLogs: () => ipcRenderer.invoke('logs:get'),
  clearLogs: () => ipcRenderer.invoke('logs:clear'),

  // معالجات البوابة
  startPortal: (options) => ipcRenderer.invoke('portal:start', options),
  stopPortal: () => ipcRenderer.invoke('portal:stop'),

  // معالجات المنافذ
  addPortForward: (data) => ipcRenderer.invoke('ports:add', data),
  resetPortForwards: () => ipcRenderer.invoke('ports:reset'),
});
