const fs = require('fs');
const file = 'src/lib/extension/sidepanel.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  `chrome.runtime.sendMessage({ action: 'chat', message: instruction, image: null }, (response) => {`,
  `chrome.runtime.sendMessage({ action: 'rewritePrompt', prompt: text }, (response) => {\n    if (chrome.runtime.lastError) {\n      const loadingEl = document.getElementById(loadingId);\n      if (loadingEl) loadingEl.remove();\n      addMessage('扩展后台服务已断开或超时，请重试', false);\n      return;\n    }`
);

fs.writeFileSync(file, code);
console.log('Fixed sidepanel rewrite request');
