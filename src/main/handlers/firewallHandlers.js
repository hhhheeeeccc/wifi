/**
 * معالجات جدار الحماية (Firewall)
 */

const { execAsync } = require('../utils/processUtils');
const logger = require('../utils/logger');

const FIREWALL_RULES = {
  p2pBlockOut: 'WiFiHotspotPro_BlockP2P_Out',
  p2pBlockIn: 'WiFiHotspotPro_BlockP2P_In',
};

const P2P_PORTS = '6881-6889,1214,6346,4662';

/**
 * تفعيل/تعطيل حظر P2P
 */
async function toggleP2PBlock(event, enable) {
  try {
    if (enable) {
      logger.info('Enabling P2P block...');
      await addP2PBlockRules();
    } else {
      logger.info('Disabling P2P block...');
      await removeP2PBlockRules();
    }
    
    logger.info(`P2P block ${enable ? 'enabled' : 'disabled'} successfully`);
    return { success: true };
  } catch (error) {
    logger.error('Error toggling P2P block:', error.message);
    if (!enable) return { success: true }; // تجاهل الأخطاء عند التعطيل
    return { success: false, error: error.message };
  }
}

/**
 * إضافة قوانين حظر P2P
 */
async function addP2PBlockRules() {
  try {
    // حظر الاتجاه الخارج (Outbound)
    await execAsync(
      `netsh advfirewall firewall add rule name="${FIREWALL_RULES.p2pBlockOut}" dir=out action=block protocol=TCP remoteport=${P2P_PORTS}`
    );
    
    // حظر الاتجاه الداخل (Inbound)
    await execAsync(
      `netsh advfirewall firewall add rule name="${FIREWALL_RULES.p2pBlockIn}" dir=in action=block protocol=TCP localport=${P2P_PORTS}`
    );
  } catch (error) {
    logger.error('Error adding P2P block rules:', error.message);
    throw error;
  }
}

/**
 * حذف قوانين حظر P2P
 */
async function removeP2PBlockRules() {
  const rules = [FIREWALL_RULES.p2pBlockOut, FIREWALL_RULES.p2pBlockIn];
  
  for (const rule of rules) {
    try {
      await execAsync(`netsh advfirewall firewall delete rule name="${rule}"`);
    } catch {
      // تجاهل الأخطاء إذا كانت القاعدة غير موجودة
      logger.warn(`Rule "${rule}" not found or already deleted`);
    }
  }
}

module.exports = {
  toggleP2PBlock,
};
