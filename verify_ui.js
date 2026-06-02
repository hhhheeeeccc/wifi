const { _electron: electron } = require('playwright-core');

(async () => {
  const electronApp = await electron.launch({
    args: ['.'],
    executablePath: './node_modules/electron/dist/electron'
  });
  const window = await electronApp.firstWindow();

  await window.waitForTimeout(2000);
  await window.screenshot({ path: 'status_tab.png' });

  await window.click('button[data-tab="clients"]');
  await window.waitForTimeout(500);
  await window.screenshot({ path: 'clients_tab.png' });

  await window.click('button[data-tab="settings"]');
  await window.waitForTimeout(500);
  await window.screenshot({ path: 'settings_tab.png' });

  await electronApp.close();
})();
