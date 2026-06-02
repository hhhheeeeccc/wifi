const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function checkAdmin() {
  try {
    await execPromise('net session');
    return true;
  } catch (e) {
    return false;
  }
}

async function checkSentinelOne() {
  try {
    const { stdout } = await execPromise('tasklist /FI "IMAGENAME eq SentinelAgent.exe"');
    return stdout.includes('SentinelAgent.exe');
  } catch (e) {
    return false;
  }
}

async function getWifiInfo() {
  try {
    const { stdout } = await execPromise('powershell "Get-NetAdapter | Where-Object {$_.MediaType -eq \'Native 802.11\'} | Select-Object Name, Status, InterfaceDescription | ConvertTo-Json"');
    if (!stdout.trim()) return [];
    return JSON.parse(stdout);
  } catch (e) {
    return { error: e.message };
  }
}

async function getConnectedClients() {
  try {
    const script = `
      Get-NetNeighbor | Where-Object { $_.State -eq 'Reachable' -and $_.IPAddress -notlike '169.254.*' -and $_.IPAddress -notlike 'fe80*' } |
      Select-Object IPAddress, LinkLayerAddress | ConvertTo-Json
    `;
    const { stdout } = await execPromise(`powershell "${script.replace(/\n/g, '')}"`);
    if (!stdout.trim()) return [];
    const neighbors = JSON.parse(stdout);
    return (Array.isArray(neighbors) ? neighbors : [neighbors]).map(n => ({
      ip: n.IPAddress,
      mac: n.LinkLayerAddress,
      name: 'Connected Device'
    }));
  } catch (e) {
    return [];
  }
}

function sanitizeInput(str) {
  return str.replace(/["';`$()]/g, '');
}

async function tryWinRT(ssid, password) {
  const safeSsid = sanitizeInput(ssid);
  const safePassword = sanitizeInput(password);

  const script = `
    Add-Type -AssemblyName Windows.Networking
    $manager = [Windows.Networking.NetworkOperators.NetworkOperatorTetheringManager, Windows.Networking.NetworkOperators, ContentType=WindowsRuntime]::CreateFromConnectionProfile([Windows.Networking.Connectivity.NetworkInformation, Windows.Networking.Connectivity, ContentType=WindowsRuntime]::GetInternetConnectionProfile())
    $config = $manager.GetCurrentAccessPointConfiguration()
    $config.Ssid = "${safeSsid}"
    $config.Passphrase = "${safePassword}"
    $manager.ConfigureAccessPointAsync($config).GetResults()
    $manager.StartTetheringAsync().GetResults()
  `;
  try {
    await execPromise(`powershell "${script.replace(/\n/g, '')}"`);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function enableICS() {
  const script = `
    $publicAdapter = Get-NetAdapter | Where-Object { $_.Status -eq 'Up' -and $_.MediaType -ne 'Native 802.11' } | Select-Object -First 1
    $privateAdapter = Get-NetAdapter | Where-Object { $_.InterfaceDescription -like '*Wi-Fi Direct*' } | Select-Object -First 1
    $netShare = New-Object -ComObject HNetCfg.HNetShare
    $publicConn = $netShare.EnumEveryConnection | Where-Object { $netShare.NetConnectionProps($_).Name -eq $publicAdapter.Name }
    $privateConn = $netShare.EnumEveryConnection | Where-Object { $netShare.NetConnectionProps($_).Name -eq $privateAdapter.Name }
    $publicConfig = $netShare.INetSharingConfigurationForINetConnection($publicConn)
    $privateConfig = $netShare.INetSharingConfigurationForINetConnection($privateConn)
    $publicConfig.EnableSharing(0)
    $privateConfig.EnableSharing(1)
  `;
  try {
    await execPromise(`powershell "${script.replace(/\n/g, '')}"`);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 650,
    height: 550,
    resizable: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  ipcMain.handle('get-system-info', async () => {
    const isAdmin = await checkAdmin();
    const s1Running = await checkSentinelOne();
    const wifiInfo = await getWifiInfo();
    return { isAdmin, s1Running, wifiInfo };
  });

  ipcMain.handle('get-connected-clients', async () => {
    return await getConnectedClients();
  });

  ipcMain.handle('start-hotspot', async (event, { ssid, password }) => {
    const winrtResult = await tryWinRT(ssid, password);
    if (winrtResult.success) {
      await enableICS();
      return { success: true };
    }
    return winrtResult;
  });

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
