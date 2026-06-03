const { _electron: electron } = require('playwright-core');

(async () => {
  console.log('Starting UI verification...');
  const electronApp = await electron.launch({
    args: ['.'],
    executablePath: './node_modules/electron/dist/electron'
  });

  try {
    const window = await electronApp.firstWindow();
    console.log('Window loaded.');

    await window.waitForTimeout(3000);
    await window.screenshot({ path: 'status_tab.png' });
    console.log('Screenshot saved: status_tab.png');

    // تأكد من وجود العناصر الأساسية
    const title = await window.innerText('h1');
    console.log('Page Title:', title);

    if (title.includes('WiFi Hotspot Pro')) {
        console.log('✅ UI elements verified successfully.');
    } else {
        console.error('❌ UI elements verification failed.');
        process.exit(1);
    }

  } catch (error) {
    console.error('Verification Error:', error);
    process.exit(1);
  } finally {
    await electronApp.close();
  }
})();
