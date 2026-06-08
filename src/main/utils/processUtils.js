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
    .map(function(l) { return l.trim(); })
    .filter(Boolean)
    .join('; ');

  return await execAsync(`powershell "${formattedScript}"`);
}

module.exports = {
  execAsync,
  runPowerShell,
};
