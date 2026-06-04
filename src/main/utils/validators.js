/**
 * أدوات التحقق والتطهير
 */

/**
 * تطهير مدخلات المستخدم من الأحرف الخطرة
 */
function sanitizeInput(str) {
  return str.replace(/["';`$()]/g, '');
}

/**
 * التحقق من كلمة المرور
 */
export function validatePassword(password) {
  return Boolean(password && password.length >= 8);
}

/**
 * التحقق من SSID
 */
export function validateSSID(ssid) {
  return Boolean(ssid && ssid.trim().length > 0 && ssid.length <= 32);
}

module.exports = {
  sanitizeInput,
  validatePassword,
  validateSSID,
};
