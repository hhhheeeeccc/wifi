/**
 * معالجات رمز QR
 */

const QRCode = require('qrcode');
const logger = require('../utils/logger');

/**
 * توليد رمز QR للاتصال بالشبكة
 */
async function generateWifiQR(event, { ssid, password, encryption = 'WPA' }) {
  try {
    logger.info(`Generating QR for SSID: ${ssid}`);

    // تنسيق اتصال الواي فاي المعياري: WIFI:S:<SSID>;T:<TYPE>;P:<PASSWORD>;;
    const qrText = `WIFI:S:${ssid};T:${encryption};P:${password};;`;

    const qrDataUrl = await QRCode.toDataURL(qrText, {
      errorCorrectionLevel: 'M',
      margin: 4,
      width: 300,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });

    return { success: true, qrDataUrl };
  } catch (error) {
    logger.error('Error generating QR:', error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  generateWifiQR,
};
