/**
 * معالجات السجلات (Logging)
 */

const { app } = require('electron');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

const dbPath = path.join(app.getPath('userData'), 'history.db');
let db;

export const initDatabase = () => {
  try {
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    db = new Database(dbPath);
    // إنشاء الجداول إذا لم تكن موجودة
    db.prepare(`
        CREATE TABLE IF NOT EXISTS connection_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            event_type TEXT,
            mac TEXT,
            ip TEXT,
            details TEXT
        )
    `).run();

    db.prepare(`
        CREATE TABLE IF NOT EXISTS url_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            client_ip TEXT,
            url TEXT
        )
    `).run();

    logger.info('Database initialized successfully');
    return { success: true };
  } catch (error) {
    logger.error('Failed to initialize database:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * تسجيل حدث اتصال
 */
function logConnection(type, mac, ip, details = '') {
    try {
        const stmt = db.prepare('INSERT INTO connection_logs (event_type, mac, ip, details) VALUES (?, ?, ?, ?)');
        stmt.run(type, mac, ip, details);
    } catch (error) {
        logger.error('Error logging connection:', error.message);
    }
}

/**
 * الحصول على السجلات
 */
function getLogs() {
    try {
        return db.prepare('SELECT * FROM connection_logs ORDER BY timestamp DESC LIMIT 100').all();
    } catch {
        return [];
    }
}

/**
 * مسح السجلات
 */
function clearLogs() {
    try {
        db.prepare('DELETE FROM connection_logs').run();
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

module.exports = {
    initDatabase,
    logConnection,
    getLogs,
    clearLogs
};
