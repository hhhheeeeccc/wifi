/**
 * أدوات التحقق والتطهير
 */

/**
 * تطهير مدخلات المستخدم من الأحرف الخطرة
 */
const sanitizeInput = (str) => {
  return str.replace(/[\
