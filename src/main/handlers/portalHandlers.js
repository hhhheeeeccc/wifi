/**
 * معالجات بوابة المصادقة (Captive Portal)
 */

const express = require('express');
const logger = require('../utils/logger');

let portalServer = null;

async function startPortal(event, { port = 80 }) {
    try {
        if (portalServer) return { success: true };

        const app = express();

        app.get('/', (req, res) => {
            res.send(`
                <html lang="ar" dir="rtl">
                <head>
                    <meta charset="UTF-8">
                    <title>أهلاً بك في WiFi Hotspot Pro</title>
                    <style>
                        body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f0f2f5; }
                        .card { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); text-align: center; max-width: 400px; }
                        h1 { color: #1a73e8; margin-bottom: 20px; }
                        p { color: #5f6368; line-height: 1.6; }
                        .btn { background: #1a73e8; color: white; border: none; padding: 12px 30px; border-radius: 25px; cursor: pointer; font-size: 16px; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <h1>📡 WiFi Hotspot Pro</h1>
                        <p>أهلاً بك في الشبكة. يرجى الضغط على الزر أدناه للمتابعة واستخدام الإنترنت.</p>
                        <button class="btn" onclick="window.location.href='https://www.google.com'">دخول</button>
                    </div>
                </body>
                </html>
            `);
        });

        portalServer = app.listen(port, () => {
            logger.info(`Captive Portal started on port ${port}`);
        });

        return { success: true };
    } catch (error) {
        logger.error('Error starting portal:', error.message);
        return { success: false, error: error.message };
    }
}

async function stopPortal() {
    if (portalServer) {
        portalServer.close();
        portalServer = null;
    }
    return { success: true };
}

module.exports = {
    startPortal,
    stopPortal
};
