/**
 * WiFi Hotspot Pro - Main Process
 * نقطة الدخول الرئيسية للتطبيق
 */

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// استيراد معالجات IPC
const systemHandlers = require('./handlers/systemHandlers');
const hotspotHandlers = require('./handlers/hotspotHandlers');
const firewallHandlers = require('./handlers/firewallHandlers');

/**
 * إنشاء نافذة التطبيق الرئيسية
 */
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 650,
    height: 600,
    resizable: false,
    autoHideMenuBar: true,
    icon: path.join(__dirname, '../../assets/icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      enableRemoteModule: false,
    },
  });

  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.loadFile(path.join(__dirname, '../../src/ui/index.html'));
}

/**
 * تسجيل معالجات IPC
 */
function registerIpcHandlers() {
  // معالجات النظام
  ipcMain.handle('system:check-admin', systemHandlers.checkAdmin);
  ipcMain.handle('system:check-sentinel-one', systemHandlers.checkSentinelOne);
  ipcMain.handle('system:get-wifi-info', systemHandlers.getWifiInfo);
  ipcMain.handle('system:get-connected-clients', systemHandlers.getConnectedClients);

  // معالجات نقطة الاتصال
  ipcMain.handle('hotspot:start', hotspotHandlers.startHotspot);
  ipcMain.handle('hotspot:stop', hotspotHandlers.stopHotspot);
  ipcMain.handle('hotspot:get-status', hotspotHandlers.getStatus);

  // معالجات الجدار الناري
  ipcMain.handle('firewall:toggle-p2p-block', firewallHandlers.toggleP2PBlock);
}

/**
 * التهيئة
 */
app.whenReady().then(() => {
  createWindow();
  registerIpcHandlers();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// التعامل مع الأخطاء
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});
