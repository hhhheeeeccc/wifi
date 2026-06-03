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
    const result = JSON.parse(stdout);
    // ✅ إصلاح: التأكد من إرجاع Array دائماً
    return Array.isArray(result) ? result : [result];
  } catch (e) {
    console.error('WiFi Info Error:', e.message);
    return [];
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
    
    // ✅ إصلاح: Validation للـ JSON قبل الـ parsing
    let neighbors;
    try {
      neighbors = JSON.parse(stdout);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError.message);
      return [];
    }
    
    return (Array.isArray(neighbors) ? neighbors : [neighbors]).map(n => ({
      ip: n.IPAddress,
      mac: n.LinkLayerAddress,
      name: 'Connected Device'
    }));
  } catch (e) {
    console.error('Connected Clients Error:', e.message);
    return [];
  }
}

function sanitizeInput(str) {
  return str.replace(/["';`$()]/g, '');
}

async function tryWinRT(ssid, password) {
  const safeSsid = sanitizeInput(ssid);
  const safePassword = sanitizeInput(password);

  // ✅ إصلاح: أكمل كود WinRT المقطوع بشكل صحيح
  const script = `
    Add-Type -AssemblyName Windows.Networking
    try {
      [Windows.Networking.Connectivity.NetworkInformation, Windows.Networking.Connectivity, ContentType=WindowsRuntime] | Out-Null
      [Windows.Networking.NetworkOperators.NetworkOperatorTetheringManager, Windows.Networking.NetworkOperators, ContentType=WindowsRuntime] | Out-Null
      $connectionProfile = [Windows.Networking.Connectivity.NetworkInformation]::GetInternetConnectionProfile()
      if ($null -eq $connectionProfile) {
        throw "No internet connection found"
      }
      $manager = [Windows.Networking.NetworkOperators.NetworkOperatorTetheringManager]::CreateFromConnectionProfile($connectionProfile)
      $config = $manager.GetCurrentAccessPointConfiguration()
      $config.Ssid = "${safeSsid}"
      $config.Passphrase = "${safePassword}"
      $manager.ConfigureAccessPointAsync($config).GetResults()
      $manager.StartTetheringAsync().GetResults()
    } catch {
      throw $_
    }
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
    try {
      $publicAdapter = Get-NetAdapter | Where-Object { $_.Status -eq 'Up' -and $_.MediaType -ne 'Native 802.11' } | Select-Object -First 1
      $privateAdapter = Get-NetAdapter | Where-Object { $_.InterfaceDescription -like '*Wi-Fi Direct*' } | Select-Object -First 1
      
      if ($null -eq $publicAdapter -or $null -eq $privateAdapter) {
        throw "Cannot find suitable adapters"
      }
      
      $netShare = New-Object -ComObject HNetCfg.HNetShare
      $publicConn = $netShare.EnumEveryConnection | Where-Object { $netShare.NetConnectionProps($_).Name -eq $publicAdapter.Name }
      $privateConn = $netShare.EnumEveryConnection | Where-Object { $netShare.NetConnectionProps($_).Name -eq $privateAdapter.Name }
      $publicConfig = $netShare.INetSharingConfigurationForINetConnection($publicConn)
      $privateConfig = $netShare.INetSharingConfigurationForINetConnection($privateConn)
      $publicConfig.EnableSharing(0)
      $privateConfig.EnableSharing(1)
    } catch {
      throw $_
    }
  `;
  try {
    await execPromise(`powershell "${script.replace(/\n/g, '')}"`);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function toggleP2PBlock(enable) {
  // ✅ إصلاح: أسماء فريدة لكل اتجاه (In/Out)
  const ruleNameOut = "WiFiHotspotPro_BlockP2P_Out";
  const ruleNameIn = "WiFiHotspotPro_BlockP2P_In";
  try {
    if (enable) {
      await execPromise(`netsh advfirewall firewall add rule name="${ruleNameOut}" dir=out action=block protocol=TCP remoteport=6881-6889,1214,6346,4662`);
      await execPromise(`netsh advfirewall firewall add rule name="${ruleNameIn}" dir=in action=block protocol=TCP localport=6881-6889,1214,6346,4662`);
    } else {
      try {
        await execPromise(`netsh advfirewall firewall delete rule name="${ruleNameOut}"`);
      } catch (e) {
        // Ignore if rule doesn't exist
      }
      try {
        await execPromise(`netsh advfirewall firewall delete rule name="${ruleNameIn}"`);
      } catch (e) {
        // Ignore if rule doesn't exist
      }
    }
    return { success: true };
  } catch (e) {
    if (!enable) return { success: true };
    return { success: false, error: e.message };
  }
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 650,
    height: 600,
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

  ipcMain.handle('stop-hotspot', async () => {
    // ✅ إصلاح: أكمل كود WinRT المقطوع بشكل صحيح
    const script = `
      try {
        Add-Type -AssemblyName Windows.Networking
        [Windows.Networking.Connectivity.NetworkInformation, Windows.Networking.Connectivity, ContentType=WindowsRuntime] | Out-Null
        [Windows.Networking.NetworkOperators.NetworkOperatorTetheringManager, Windows.Networking.NetworkOperators, ContentType=WindowsRuntime] | Out-Null
        $connectionProfile = [Windows.Networking.Connectivity.NetworkInformation]::GetInternetConnectionProfile()
        if ($null -ne $connectionProfile) {
          $manager = [Windows.Networking.NetworkOperators.NetworkOperatorTetheringManager]::CreateFromConnectionProfile($connectionProfile)
          $manager.StopTetheringAsync().GetResults()
        }
      } catch {
        throw $_
      }
    `;
    try {
      await execPromise(`powershell "${script.replace(/\n/g, '')}"`);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  });

  ipcMain.handle('toggle-p2p-block', async (event, enable) => {
    return await toggleP2PBlock(enable);
  });

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
