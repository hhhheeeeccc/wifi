/**
 * معالجات توجيه المنافذ (Port Forwarding)
 */

const { execAsync } = require('../utils/processUtils');
const logger = require('../utils/logger');

/**
 * إضافة توجيه منفذ
 */
async function addPortForward(event, { listenPort, connectAddr, connectPort }) {
    try {
        const cmd = `netsh interface portproxy add v4tov4 listenport=${listenPort} connectaddress=${connectAddr} connectport=${connectPort}`;
        await execAsync(cmd);
        logger.info(`Port forward added: ${listenPort} -> ${connectAddr}:${connectPort}`);
        return { success: true };
    } catch (error) {
        logger.error('Error adding port forward:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * مسح جميع التوجيهات
 */
async function clearPortForwards() {
    try {
        await execAsync('netsh interface portproxy reset');
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

module.exports = {
    addPortForward,
    clearPortForwards
};
