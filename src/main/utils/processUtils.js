/**
 * أدوات تنفيذ العمليات
 */

const { exec } = require('child_process');
const util = require('util');

const execAsync = util.promisify(exec);

/**
 * تنفيذ نص PowerShell متعدد الأسطر
 */
async function runPowerShell(script) {
  const formattedScript = script
    .split('\n')
    .map(l => l.trim())
    .filter(l => l)
    .join('; ');

  return await execAsync(`powershell "${formattedScript}"`);
}

module.exports = {
  execAsync,
  runPowerShell,
};
