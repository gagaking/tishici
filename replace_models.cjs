const fs = require('fs');

function globalSearchReplace(file, searchStr, replaceStr) {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    let regex = new RegExp(searchStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    content = content.replace(regex, replaceStr);
    fs.writeFileSync(file, content);
}

// 1. Replace default ollama model
const filesToUpdate = [
    './src/lib/extension/background.ts',
    './src/lib/extension/sidepanel.ts',
    './src/lib/ollamaExtensionFiles.ts',
    './src/App.tsx'
];

for (const file of filesToUpdate) {
    globalSearchReplace(file, "gemma4:e4b", "qwen3.5:9b");
}

console.log("Replaced gemma4:e4b to qwen3.5:9b");

// 2. Replace gemini-1.5-flash with gemini-3.1-flash-preview
for (const file of filesToUpdate) {
    globalSearchReplace(file, "gemini-1.5-flash", "gemini-3.1-flash-preview");
    // Also cover potential gemini-2.5-flash if exists
    globalSearchReplace(file, "gemini-2.5-flash", "gemini-3.1-flash-preview");
}

console.log("Replaced gemini-1.5-flash to gemini-3.1-flash-preview");

// 3. Remove text warning for qwen3.5:9b in sidepanel.ts
const sidepanelFile = './src/lib/extension/sidepanel.ts';
if (fs.existsSync(sidepanelFile)) {
    let sidepanelCode = fs.readFileSync(sidepanelFile, 'utf8');
    let warningStr = "比如 qwen3.5:9b 仅为文本模型";
    let replaceWarning = "确保模型本身具备多模态能力";
    sidepanelCode = sidepanelCode.replace(new RegExp(warningStr, 'g'), replaceWarning);
    fs.writeFileSync(sidepanelFile, sidepanelCode);
}

console.log("Updated sidepanel warning message.");
