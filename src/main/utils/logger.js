/**
 * نظام تسجيل الأحداث
 */

const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(process.env.APPDATA || process.env.HOME, 'WiFiHotspotPro', 'logs');
const LOG_FILE = path.join(LOG_DIR, `app-${new Date().toISOString().split('T')[0]}.log`);

// إنشاء مجلد السجلات إذا لم يكن موجوداً
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

function formatLog(level, message) {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level}] ${message}`;
}

function writeLog(level, message) {
  const log = formatLog(level, message);
  
  // كتابة في الملف
  fs.appendFileSync(LOG_FILE, log + '\n');
  
  // طباعة في console
  console[level.toLowerCase() === 'error' ? 'error' : 'log'](log);
}

module.exports = {
  info: (message) => writeLog('INFO', message),
  warn: (message) => writeLog('WARN', message),
  error: (message) => writeLog('ERROR', message),
  debug: (message) => writeLog('DEBUG', message),
};
