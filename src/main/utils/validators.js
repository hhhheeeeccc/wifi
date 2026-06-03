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
function validatePassword(password) {
  if (!password) return false;
  if (password.length < 8) return false;
  return true;
}

/**
 * التحقق من SSID
 */
function validateSSID(ssid) {
  if (!ssid) return false;
  if (ssid.trim().length === 0) return false;
  if (ssid.length > 32) return false;
  return true;
}

module.exports = {
  sanitizeInput,
  validatePassword,
  validateSSID,
};
