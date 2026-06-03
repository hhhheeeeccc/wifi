/**
 * معالجات إدارة الأجهزة (Blacklist)
 */

const { app } = require('electron');
const fs = require('fs');
const path = require('path');
const { execAsync } = require('../utils/processUtils');
const logger = require('../utils/logger');

const blacklistPath = path.join(app.getPath('userData'), 'blacklist.json');

// Ensure file exists
if (!fs.existsSync(blacklistPath)) {
    try {
        fs.writeFileSync(blacklistPath, JSON.stringify([]));
    } catch (e) {
        console.error('Failed to create blacklist file', e);
    }
}

/**
 * الحصول على قائمة الأجهزة المحظورة
 */
function getBlacklist() {
    try {
        if (!fs.existsSync(blacklistPath)) return [];
        const data = fs.readFileSync(blacklistPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        logger.error('Error reading blacklist:', error.message);
        return [];
    }
}

/**
 * إضافة جهاز للقائمة السوداء
 */
async function blockDevice(event, { mac, ip }) {
    try {
        logger.info(`Blocking device: ${mac} (${ip})`);
        const blacklist = getBlacklist();

        if (!blacklist.includes(mac)) {
            blacklist.push(mac);
            fs.writeFileSync(blacklistPath, JSON.stringify(blacklist));
        }

        // محاولة حظر الـ IP في جدار الحماية فوراً
        if (ip) {
            const ruleName = `WiFiHotspotPro_Block_${mac.replace(/:/g, '')}`;
            // Ignore errors if rule already exists
            try {
                await execAsync(`netsh advfirewall firewall add rule name="${ruleName}" dir=in action=block protocol=ANY remoteip=${ip}`);
                await execAsync(`netsh advfirewall firewall add rule name="${ruleName}" dir=out action=block protocol=ANY remoteip=${ip}`);
            } catch (e) {
                logger.warn(`Firewall rule for ${mac} might already exist or failed: ${e.message}`);
            }
        }

        return { success: true };
    } catch (error) {
        logger.error('Error blocking device:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * إزالة جهاز من القائمة السوداء
 */
async function unblockDevice(event, mac) {
    try {
        logger.info(`Unblocking device: ${mac}`);
        let blacklist = getBlacklist();
        blacklist = blacklist.filter(m => m !== mac);
        fs.writeFileSync(blacklistPath, JSON.stringify(blacklist));

        const ruleName = `WiFiHotspotPro_Block_${mac.replace(/:/g, '')}`;
        try {
            await execAsync(`netsh advfirewall firewall delete rule name="${ruleName}"`);
        } catch (e) {
            logger.warn(`Firewall rule for ${mac} not found: ${e.message}`);
        }

        return { success: true };
    } catch (error) {
        logger.error('Error unblocking device:', error.message);
        return { success: false, error: error.message };
    }
}

module.exports = {
    getBlacklist,
    blockDevice,
    unblockDevice
};
