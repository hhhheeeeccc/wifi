/**
 * معالجات مشاركة الملفات
 */

const { app, shell } = require('electron');
const express = require('express');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

let server = null;
const sharedDirPath = path.join(app.getPath('userData'), 'shared');

// Ensure directory exists
if (!fs.existsSync(sharedDirPath)) {
    fs.mkdirSync(sharedDirPath, { recursive: true });
}

/**
 * تشغيل خادم المشاركة
 */
async function startSharing(event, { port = 8080 }) {
    try {
        if (server) return { success: true, url: `http://localhost:${port}` };

        const expressApp = express();

        // واجهة بسيطة لعرض الملفات
        expressApp.get('/', (req, res) => {
            const files = fs.readdirSync(sharedDirPath);
            let html = `
                <html lang="ar" dir="rtl">
                <head>
                    <meta charset="UTF-8">
                    <title>WiFi Hotspot Pro - ملفات مشتركة</title>
                    <style>
                        body { font-family: sans-serif; padding: 20px; background: #f0f2f5; }
                        h1 { color: #1a73e8; }
                        .file-list { background: white; border-radius: 8px; padding: 0; list-style: none; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                        .file-item { padding: 15px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; }
                        .file-item:last-child { border-bottom: none; }
                        a { color: #1a73e8; text-decoration: none; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <h1>📂 الملفات المشتركة</h1>
                    <ul class="file-list">
                        ${files.length === 0 ? '<li class="file-item">لا توجد ملفات حالياً</li>' : ''}
                        ${files.map(f => `
                            <li class="file-item">
                                <span>${f}</span>
                                <a href="/download/${encodeURIComponent(f)}" download>تحميل</a>
                            </li>
                        `).join('')}
                    </ul>
                </body>
                </html>
            `;
            res.send(html);
        });

        expressApp.get('/download/:filename', (req, res) => {
            const filePath = path.join(sharedDirPath, req.params.filename);
            res.download(filePath);
        });

        server = expressApp.listen(port, () => {
            logger.info(`Sharing server started on port ${port}`);
        });

        return { success: true, url: `http://192.168.137.1:${port}` }; // Default Windows Hotspot IP
    } catch (error) {
        logger.error('Error starting sharing server:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * إيقاف خادم المشاركة
 */
async function stopSharing() {
    if (server) {
        server.close();
        server = null;
        logger.info('Sharing server stopped');
    }
    return { success: true };
}

/**
 * فتح مجلد المشاركة
 */
function openSharedFolder() {
    shell.openPath(sharedDirPath);
    return { success: true };
}

module.exports = {
    startSharing,
    stopSharing,
    openSharedFolder
};
