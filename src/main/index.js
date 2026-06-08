const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const systemHandlers = require('./handlers/systemHandlers');
const hotspotHandlers = require('./handlers/hotspotHandlers');
const firewallHandlers = require('./handlers/firewallHandlers');
const qrHandlers = require('./handlers/qrHandlers');
const deviceHandlers = require('./handlers/deviceHandlers');
const sharingHandlers = require('./handlers/sharingHandlers');
const logHandlers = require('./handlers/logHandlers');
const portalHandlers = require('./handlers/portalHandlers');
const portHandlers = require('./handlers/portHandlers');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 700,
    height: 800,
    resizable: true,
    autoHideMenuBar: true,
    icon: path.join(__dirname, '../../assets/icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
    },
  });
  mainWindow.loadFile(path.join(__dirname, '../../src/ui/index.html'));
}

function registerIpcHandlers() {
  ipcMain.handle('system:check-admin', systemHandlers.checkAdmin);
  ipcMain.handle('system:check-sentinel-one', systemHandlers.checkSentinelOne);
  ipcMain.handle('system:get-wifi-info', systemHandlers.getWifiInfo);
  ipcMain.handle('system:get-connected-clients', systemHandlers.getConnectedClients);
  ipcMain.handle('hotspot:start', hotspotHandlers.startHotspot);
  ipcMain.handle('hotspot:stop', hotspotHandlers.stopHotspot);
  ipcMain.handle('hotspot:get-status', hotspotHandlers.getStatus);
  ipcMain.handle('firewall:toggle-p2p-block', firewallHandlers.toggleP2PBlock);
  ipcMain.handle('qr:generate', qrHandlers.generateWifiQR);
  ipcMain.handle('devices:get-blacklist', deviceHandlers.getBlacklist);
  ipcMain.handle('devices:block', deviceHandlers.blockDevice);
  ipcMain.handle('devices:unblock', deviceHandlers.unblockDevice);
  ipcMain.handle('sharing:start', sharingHandlers.startSharing);
  ipcMain.handle('sharing:stop', sharingHandlers.stopSharing);
  ipcMain.handle('sharing:open-folder', sharingHandlers.openSharedFolder);
  ipcMain.handle('logs:get', logHandlers.getLogs);
  ipcMain.handle('logs:clear', logHandlers.clearLogs);
  ipcMain.handle('portal:start', portalHandlers.startPortal);
  ipcMain.handle('portal:stop', portalHandlers.stopPortal);
  ipcMain.handle('ports:add', portHandlers.addPortForward);
  ipcMain.handle('ports:reset', portHandlers.clearPortForwards);
}

app.whenReady().then(() => { createWindow(); registerIpcHandlers(); });
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
