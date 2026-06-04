/**
 * معالجات نظام الحاسوب
 */

const { execAsync } = require('../utils/processUtils');
const logger = require('../utils/logger');

/**
 * التحقق من صلاحيات المسؤول
 */
async function checkAdmin() {
  try {
    await execAsync('net session');
    logger.info('Admin privileges: YES');
    return true;
  } catch (_error) {
    logger.warn('Admin privileges: NO');
    return false;
  }
}

/**
 * التحقق من وجود SentinelOne
 */
async function checkSentinelOne() {
  try {
    const { stdout } = await execAsync('tasklist /FI "IMAGENAME eq SentinelAgent.exe"');
    const isRunning = stdout.includes('SentinelAgent.exe');
    logger.info(`SentinelOne status: ${isRunning ? 'RUNNING' : 'NOT RUNNING'}`);
    return isRunning;
  } catch (error) {
    logger.error('Error checking SentinelOne:', error.message);
    return false;
  }
}

/**
 * الحصول على معلومات WiFi
 */
async function getWifiInfo() {
  try {
    const powershellCmd = "Get-NetAdapter | Where-Object {$_.MediaType -eq 'Native 802.11'} | Select-Object Name, Status, InterfaceDescription | ConvertTo-Json";
    const { stdout } = await execAsync(`powershell "${powershellCmd}"`);
    
    if (!stdout.trim()) {
      logger.warn('No WiFi adapters found');
      return [];
    }
    
    const result = JSON.parse(stdout);
    const adapters = Array.isArray(result) ? result : [result];
    logger.info(`Found ${adapters.length} WiFi adapter(s)`);
    return adapters;
  } catch (error) {
    logger.error('Error getting WiFi info:', error.message);
    return [];
  }
}

/**
 * الحصول على الأجهزة المتصلة
 */
async function getConnectedClients() {
  try {
    const script = "Get-NetNeighbor | Where-Object { $_.State -eq 'Reachable' -and $_.IPAddress -notlike '169.254.*' -and $_.IPAddress -notlike 'fe80*' } | Select-Object IPAddress, LinkLayerAddress | ConvertTo-Json";
    const { stdout } = await execAsync(`powershell "${script.replace(/\n/g, '')}"`);
    
    if (!stdout.trim()) {
      logger.warn('No connected clients found');
      return [];
    }
    
    const neighbors = JSON.parse(stdout);
    const clients = (Array.isArray(neighbors) ? neighbors : [neighbors]).map((n) => ({
      ip: n.IPAddress,
      mac: n.LinkLayerAddress,
      name: `Device (${n.IPAddress})`,
    }));
    
    logger.info(`Found ${clients.length} connected client(s)`);
    return clients;
  } catch (error) {
    logger.error('Error getting connected clients:', error.message);
    return [];
  }
}

module.exports = {
  checkAdmin,
  checkSentinelOne,
  getWifiInfo,
  getConnectedClients,
};
