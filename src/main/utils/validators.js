/**
 * أدوات التحقق والتطهير
 */

/**
 * تطهير مدخلات المستخدم من الأحرف الخطرة
 */
function sanitizeInput(str) {
  return str.replace(/[\
