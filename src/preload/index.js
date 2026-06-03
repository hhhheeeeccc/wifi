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
});
