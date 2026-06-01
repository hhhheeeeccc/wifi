const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  startHotspot: (credentials) => ipcRenderer.invoke('start-hotspot', credentials),
  enableSafeMode: () => ipcRenderer.invoke('enable-safe-mode'),
  disableSafeMode: () => ipcRenderer.invoke('disable-safe-mode'),
  openDocs: () => ipcRenderer.send('open-docs')
});
