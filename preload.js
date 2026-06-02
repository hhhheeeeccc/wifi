const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  getConnectedClients: () => ipcRenderer.invoke('get-connected-clients'),
  startHotspot: (credentials) => ipcRenderer.invoke('start-hotspot', credentials)
});
