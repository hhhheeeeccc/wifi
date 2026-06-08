/**
 * معالجات نقطة الاتصال (Hotspot)
 */

const { execAsync, runPowerShell } = require('../utils/processUtils');
const { sanitizeInput } = require('../utils/validators');
const logger = require('../utils/logger');

let hotspotState = {
  isRunning: false,
  ssid: '',
  startTime: null,
};

/**
 * بناء نص WinRT PowerShell مشترك
 */
function buildWinRTScript(innerLogic) {
  return `
    Add-Type -AssemblyName Windows.Networking
    try {
      [Windows.Networking.Connectivity.NetworkInformation, Windows.Networking.Connectivity, ContentType=WindowsRuntime] | Out-Null
      [Windows.Networking.NetworkOperators.NetworkOperatorTetheringManager, Windows.Networking.NetworkOperators, ContentType=WindowsRuntime] | Out-Null
      $connectionProfile = [Windows.Networking.Connectivity.NetworkInformation]::GetInternetConnectionProfile()
      ${innerLogic}
    } catch {
      throw $_
    }
  `;
}

/**
 * تشغيل نقطة الاتصال
 */
async function startHotspot(event, { ssid, password }) {
  try {
    logger.info(`Starting hotspot with SSID: ${ssid}`);
    
    const safeSsid = sanitizeInput(ssid);
    const safePassword = sanitizeInput(password);
    
    // محاولة تفعيل نقطة الاتصال عبر WinRT API
    const result = await enableWinRTHotspot(safeSsid, safePassword);
    
    if (!result.success) {
      logger.error(`Failed to start hotspot: ${result.error}`);
      return result;
    }
    
    // تفعيل مشاركة الإنترنت (ICS)
    const icsResult = await enableICS();
    if (!icsResult.success) {
      logger.warn('ICS enablement warning:', icsResult.error);
    }
    
    hotspotState.isRunning = true;
    hotspotState.ssid = ssid;
    hotspotState.startTime = new Date();
    
    logger.info('Hotspot started successfully');
    return { success: true };
  } catch (error) {
    logger.error('Error starting hotspot:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * إيقاف نقطة الاتصال
 */
async function stopHotspot() {
  try {
    logger.info('Stopping hotspot...');
    
    const script = buildWinRTScript(`
      if ($null -ne $connectionProfile) {
        $manager = [Windows.Networking.NetworkOperators.NetworkOperatorTetheringManager]::CreateFromConnectionProfile($connectionProfile)
        $manager.StopTetheringAsync().GetResults()
      }
    `);
    
    await runPowerShell(script);
    
    hotspotState.isRunning = false;
    hotspotState.ssid = '';
    hotspotState.startTime = null;
    
    logger.info('Hotspot stopped successfully');
    return { success: true };
  } catch (error) {
    logger.error('Error stopping hotspot:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * الحصول على حالة نقطة الاتصال
 */
function getStatus() {
  return hotspotState;
}

/**
 * تفعيل نقطة الاتصال عبر WinRT API
 */
async function enableWinRTHotspot(ssid, password) {
  try {
    const script = buildWinRTScript(`
      if ($null -eq $connectionProfile) {
        throw "No internet connection found"
      }
      $manager = [Windows.Networking.NetworkOperators.NetworkOperatorTetheringManager]::CreateFromConnectionProfile($connectionProfile)
      $config = $manager.GetCurrentAccessPointConfiguration()
      $config.Ssid = '${ssid}'
      $config.Passphrase = '${password}'
      $manager.ConfigureAccessPointAsync($config).GetResults()
      $manager.StartTetheringAsync().GetResults()
    `);
    
    await runPowerShell(script);
    return { success: true };
  } catch (error) {
    logger.error('WinRT hotspot error:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * تفعيل مشاركة الإنترنت (ICS)
 */
async function enableICS() {
  try {
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
    
    await runPowerShell(script);
    logger.info('ICS enabled successfully');
    return { success: true };
  } catch (error) {
    logger.error('ICS enablement error:', error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  startHotspot,
  stopHotspot,
  getStatus,
};
