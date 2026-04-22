var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/lib/extension/background.ts
var background_exports = {};
__export(background_exports, {
  backgroundJs: () => backgroundJs
});
module.exports = __toCommonJS(background_exports);
var backgroundJs = `
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'screenshot-extract',
    title: '\u622A\u56FE\u63D0\u53D6\u63D0\u793A\u8BCD',
    contexts: ['all']
  });
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'screenshot-extract') {
    chrome.tabs.sendMessage(tab.id, { action: 'startScreenshot' });
  }
});

chrome.commands.onCommand.addListener((command) => {
  if (command === 'trigger-screenshot') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'startScreenshot' });
      }
    });
  }
});

let tasks = [];
let isProcessing = false;
let abortControllers = {};

// Load tasks on startup
chrome.storage.local.get(['tasks'], (res) => {
  if (res.tasks) {
    tasks = res.tasks.map(t => {
      if (t.status === 'processing') {
        t.status = 'error';
        t.error = '\u670D\u52A1\u8FDB\u7A0B\u91CD\u542F\uFF0C\u4EFB\u52A1\u5DF2\u4E2D\u65AD';
      }
      return t;
    });
    chrome.storage.local.set({ tasks });
  }
});

function generateTaskId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

function broadcastTasks() {
  chrome.storage.local.set({ tasks });
  chrome.runtime.sendMessage({ action: 'tasksUpdated', tasks }).catch(() => {});
}

async function fetchOllamaWithStream(url, bodyObject, controller, timeoutMs) {
  bodyObject.stream = true; // FORCE stream mode to allow immediate abort logic in Go server
  
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify(bodyObject)
    });

    if (!response.ok) {
       let errText = '';
       try { errText = await response.text(); } catch(e){}
       throw new Error('Ollama API Error: ' + errText);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';
    let buffer = '';
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split(/\\r?\\n/);
      buffer = lines.pop();
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const parsed = JSON.parse(line);
          if (parsed.response !== undefined) fullText += parsed.response;
          if (parsed.message && parsed.message.content !== undefined) fullText += parsed.message.content; // Compat with chat API formats if needed
          if (parsed.error) {
            clearTimeout(timeoutId);
            throw new Error(parsed.error);
          }
        } catch(e) {
          if (e.message && line.includes('"error"')) {
            throw e;
          }
        }
      }
    }
    if (buffer.trim()) {
      try {
        const parsed = JSON.parse(buffer);
        if (parsed.response !== undefined) fullText += parsed.response;
        else if (parsed.message && parsed.message.content !== undefined) fullText += parsed.message.content;
      } catch(e) {}
    }
    clearTimeout(timeoutId);
    return fullText.trim();
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Ollama \u8BF7\u6C42\u8D85\u65F6\u6216\u5DF2\u88AB\u7EC8\u6B62');
    }
    throw err;
  }
}

async function processQueue() {
  if (isProcessing) return;
  const nextTask = tasks.find(t => t.status === 'pending');
  if (!nextTask) return;
  
  isProcessing = true;
  nextTask.status = 'processing';
  broadcastTasks();
  
  const controller = new AbortController();
  abortControllers[nextTask.id] = controller;
  
  try {
    const result = await new Promise((resolve) => {
      chrome.storage.local.get(['geminiApiKey', 'geminiModel', 'ollamaUrl', 'ollamaModel', 'promptTemplates', 'activeTemplateId'], async (res) => {
        let { geminiApiKey, geminiModel, ollamaUrl, ollamaModel, promptTemplates, activeTemplateId } = res;
        geminiApiKey = geminiApiKey || '';
        geminiModel = geminiModel || 'gemini-3.1-flash-lite-preview';
        ollamaUrl = (!ollamaUrl || ollamaUrl.trim() === '') ? 'http://127.0.0.1:11434' : ollamaUrl.trim();
        ollamaModel = (!ollamaModel || ollamaModel.trim() === '') ? 'qwen3.5:9b' : ollamaModel.trim();

        if (!geminiApiKey && !ollamaUrl) {
          resolve({ error: '\u672A\u914D\u7F6E\u4EFB\u4F55\u53EF\u7528\u7684 Gemini API Key \u6216 Ollama URL' });
          return;
        }
        
        const defaultTemplates = [
          { id: 'default-txt', name: '\u590D\u6742/\u9ED8\u8BA4\u7ED3\u6784', content: \`\u4F5C\u4E3A\u4E00\u540D\u4E13\u4E1A\u7684\u56FE\u50CF\u5206\u6790\u5E08\uFF0C\u4F60\u7684\u4EFB\u52A1\u662F\u5BA2\u89C2\u3001\u7CBE\u786E\u3001\u6781\u5176\u8BE6\u7EC6\u5730\u5206\u6790\u6240\u63D0\u4F9B\u7684\u56FE\u50CF\u3002\u4F60\u5FC5\u987B\u4E25\u683C\u63CF\u8FF0\u753B\u9762\u4E2D\u5B9E\u9645\u5B58\u5728\u7684\u5185\u5BB9\uFF0C\u7981\u6B62\u63A8\u65AD\u3001\u60F3\u8C61\u6216\u6DFB\u52A0\u4EFB\u4F55\u753B\u9762\u4EE5\u5916\u7684\u5143\u7D20\u3002
\u6838\u5FC3\u539F\u5219:
\u7EDD\u5BF9\u5BA2\u89C2: \u53EA\u63CF\u8FF0\u4F60\u6240\u770B\u5230\u7684\u3002
\u4E3B\u4F53\u4F18\u5148: \u9996\u5148\u8BC6\u522B\u56FE\u50CF\u7684\u6838\u5FC3\u4E3B\u4F53\u3002
\u7CBE\u786E\u91CF\u5316: \u5BF9\u6570\u91CF\u3001\u4F4D\u7F6E\u3001\u89D2\u5EA6\u8981\u5C3D\u53EF\u80FD\u7CBE\u786E\u3002
\u53CD\u5411\u89E3\u6790\u4E3A\u300C\u63099\u5927\u6A21\u5757\u987A\u5E8F\u8F93\u51FA\u7684\u4E2D\u6587\u957F\u53E5\u63D0\u793A\u8BCD\u300D\uFF0C\u7528\u4E8E\u76F4\u63A5\u751F\u6210\u9AD8\u8D28\u91CFAI\u56FE\u50CF\u3002
\u26A0\uFE0F \u4E25\u683C\u89C4\u5219\uFF08\u5FC5\u987B\u9075\u5B88\uFF09\uFF1A
\u6700\u7EC8\u53EA\u8F93\u51FA\u3010\u4E00\u6574\u6BB5\u4E2D\u6587\u957F\u53E5\u3011\uFF0C\u4E0D\u5206\u6BB5\u3001\u4E0D\u6362\u884C\u3002
\u6309\u300C1\u21929\u6A21\u5757\u987A\u5E8F\u300D\u7EC4\u7EC7\u5185\u5BB9\uFF0C\u4F46\u4E0D\u51FA\u73B0\u6A21\u5757\u7F16\u53F7\u6216\u5B57\u6BB5\u540D\u3002
\u5404\u4FE1\u606F\u7528\u53E5\u53F7\u5206\u9694\uFF0C\u6574\u4F53\u8BED\u4E49\u8FDE\u8D2F\u81EA\u7136\u3002
\u82E5\u56FE\u7247\u4E2D\u4E0D\u5B58\u5728\u67D0\u5B57\u6BB5\u4FE1\u606F \u2192 \u8BE5\u5B57\u6BB5\u76F4\u63A5\u8DF3\u8FC7\uFF0C\u4E0D\u8865\u5145\u3001\u4E0D\u81C6\u9020\u3002
\u7981\u6B62\u51FA\u73B0\u201C\u8FD9\u662F\u4E00\u5F20/\u753B\u9762\u4E2D/\u56FE\u7247\u91CC\u201D\u7B49\u8BF4\u660E\u6027\u5F00\u5934\u3002
\u{1F9E0} \u8F93\u51FA\u903B\u8F91\uFF08\u9690\u5F0F\u6267\u884C\uFF0C\u4E0D\u8981\u8F93\u51FA\u7ED3\u6784\uFF09\uFF1A
1\uFE0F\u20E3 \u98CE\u683C\u4E0E\u6548\u679C \u2192 \u98CE\u683C\u3001\u5149\u5F71\u7C7B\u578B\u3001\u6574\u4F53\u89C6\u89C9\u98CE\u683C\u3001\u540E\u671F\u8272\u5F69\u503E\u5411
2\uFE0F\u20E3 \u5149\u5F71\u4E0E\u673A\u4F4D \u2192 \u4E3B\u5149\u7C7B\u578B\u3001\u5149\u6BD4\u3001\u9634\u5F71\u7279\u5F81\u3001\u666F\u522B\u3001\u673A\u4F4D\u89D2\u5EA6\u3001\u7126\u6BB5\u3001\u73AF\u5883\u5149\u53CD\u5C04\u3001\u5C40\u90E8\u5149\u6548\u3001\u4E3B\u4F53\u4E0E\u80CC\u666F\u5173\u7CFB
3\uFE0F\u20E3 \u4E3B\u4F53\u4E0E\u59FF\u6001 \u2192 \u4EBA\u7269\u5C5E\u6027\u3001\u8868\u60C5\u3001\u773C\u795E\u3001\u5FAE\u52A8\u4F5C\u3001\u4E3B\u4F53\u4F4D\u7F6E\u3001\u5934\u90E8\u3001\u8EAF\u5E72\u3001\u56DB\u80A2\u59FF\u6001\u3001\u811A\u90E8\u7EC6\u8282
4\uFE0F\u20E3 \u4E3B\u8272\u4E0E\u6C1B\u56F4 \u2192 \u4E3B\u8272\u3001\u526F\u8272\u3001\u70B9\u7F00\u8272\u3001\u6574\u4F53\u6C1B\u56F4\u3001\u6E10\u53D8\u3001\u73AF\u5883\u53CD\u5C04
5\uFE0F\u20E3 \u80CC\u666F\u4E0E\u7A7A\u95F4 \u2192 \u51E0\u4F55\u7ED3\u6784\u3001\u6BD4\u4F8B\u3001\u6750\u8D28\u3001\u5149\u5F71\u4E92\u52A8\u3001\u7A7A\u95F4\u5C42\u6B21
6\uFE0F\u20E3 \u9053\u5177\u4E0E\u4E92\u52A8 \u2192 \u9053\u5177\u7C7B\u578B\u3001\u4E92\u52A8\u65B9\u5F0F\u3001\u624B\u90E8\u7EC6\u8282\u3001\u7EC7\u7269\u72B6\u6001\u3001\u5360\u6BD4\u5173\u7CFB
7\uFE0F\u20E3 \u52A8\u4F5C\u4E0E\u7EC6\u8282 \u2192 \u4E3B\u4F53\u52A8\u4F5C\u3001\u624B\u90E8\u72B6\u6001\u3001\u914D\u9970\u3001\u7EC6\u5FAE\u52A8\u6001
8\uFE0F\u20E3 \u7A7F\u642D\u4E0E\u98CE\u683C \u2192 \u4E0A\u88C5\u3001\u4E0B\u88C5\u3001\u978B\u5B50\u3001\u6750\u8D28\u53CD\u5149\u4E0E\u8936\u76B1\u3001\u914D\u8272\u5173\u7CFB\u3001\u6574\u4F53\u7EDF\u4E00\u6027
9\uFE0F\u20E3 \u7279\u6B8A\u6548\u679C \u2192 \u7279\u6548\u7C7B\u578B\u3001\u540E\u671F\u5904\u7406\u3001\u6750\u8D28\u8868\u73B0\u7CBE\u5EA6\uFF1B
\u73B0\u5728\u5F00\u59CB\u89E3\u6790\u56FE\u7247\u5E76\u8F93\u51FA\uFF1A\` },
          { id: 'simple-txt', name: '\u7B80\u5355', content: \`\u4F60\u662F\u4E00\u4F4D\u9876\u7EA7AI\u7ED8\u753B\u63D0\u793A\u8BCD\u5DE5\u7A0B\u5E08\uFF08Midjourney / Stable Diffusion\uFF09\u3002

\u4EFB\u52A1\uFF1A\u5C06\u6211\u63D0\u4F9B\u7684\u56FE\u7247\uFF0C\u53CD\u5411\u89E3\u6790\u4E3A\u201C\u53EF\u76F4\u63A5\u7528\u4E8E\u751F\u56FE\u7684\u4E00\u884C\u4E2D\u6587Prompt\u201D\u3002

\u26A0 \u4E25\u683C\u89C4\u5219\uFF08\u5FC5\u987B\u9075\u5B88\uFF09\uFF1A
- \u53EA\u8F93\u51FA\u3010\u6700\u7EC8Prompt\u3011\uFF0C\u4E0D\u505A\u4EFB\u4F55\u89E3\u91CA
- \u8F93\u51FA\u4E3A\u3010\u5355\u884C\u4E2D\u6587\u3011\uFF0C\u7528\u9017\u53F7\u5206\u9694\u5173\u952E\u8BCD
- \u4E0D\u8981\u5206\u6BB5
- \u4E0D\u8981\u6807\u9898
- \u4E0D\u8981\u89E3\u91CA\u6027\u8BED\u8A00\uFF08\u5982\uFF1Athis image shows / a photo of\uFF09
- \u4E0D\u8981\u7ED3\u6784\u6807\u7B7E\uFF08\u5982 Subject / Style \u7B49\uFF09
- \u4FDD\u6301\u4E13\u4E1A\u3001\u7CBE\u7B80\u3001\u53EF\u76F4\u63A5\u590D\u5236\u4F7F\u7528

\u2699 Prompt\u5185\u5BB9\u5FC5\u987B\u5305\u542B\uFF1A
[\u4E3B\u4F53\u4E0E\u52A8\u4F5C],
[\u6784\u56FE\u4E0E\u673A\u4F4D],
[\u98CE\u683C],
[\u5149\u5F71],
[\u8272\u5F69],
[\u6750\u8D28\u4E0E\u7EC6\u8282],
[\u7A7A\u95F4\u4E0E\u80CC\u666F],
[\u8D28\u91CF\u4E0E\u6E32\u67D3]

\u73B0\u5728\u5F00\u59CB\u89E3\u6790\u56FE\u7247\u5E76\u8F93\u51FA\uFF1A\` }
        ];
        
        let templates = promptTemplates || defaultTemplates;
        
        // Force update old templates
        if (templates.length === 1 && templates[0].id === 'default-txt' && templates[0].name === '\u9ED8\u8BA4\u7ED3\u6784') {
          templates = defaultTemplates;
        }

        const defaultIndex = templates.findIndex(t => t.id === 'default-txt');
        if (defaultIndex >= 0) {
           templates[defaultIndex] = defaultTemplates[0];
           const simpleIndex = templates.findIndex(t => t.id === 'simple-txt');
           if (simpleIndex === -1) {
             templates.push(defaultTemplates[1]);
           } else {
             templates[simpleIndex] = defaultTemplates[1];
           }
        }
        const activeId = activeTemplateId === 'default' ? 'default-txt' : (activeTemplateId || 'default-txt');
        const activeTpl = templates.find(t => t.id === activeId) || templates[0];
        
        if (ollamaUrl && !ollamaUrl.startsWith('http')) {
          ollamaUrl = 'http://' + ollamaUrl;
        }
        
        let imgMimeType = 'image/jpeg';
        
        let base64Image;
        
        // Always try to load the image as a Blob first, avoiding huge string concats
        let sourceBlob = null;
        try {
          const imgResponse = await fetch(nextTask.dataUrl);
          sourceBlob = await imgResponse.blob();
          imgMimeType = sourceBlob.type || 'image/jpeg';
        } catch (e) {
          resolve({ error: '\u65E0\u6CD5\u83B7\u53D6\u56FE\u7247\u6570\u636E' });
          return;
        }

        // Resize image if it's too large to prevent Ollama from getting stuck, and always convert to JPEG
        try {
          const bitmap = await createImageBitmap(sourceBlob);
          let width = bitmap.width;
          let height = bitmap.height;
          const maxSize = 512; // Speed up vision processing
          
          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = Math.round((height * maxSize) / width);
              width = maxSize;
            } else {
              width = Math.round((width * maxSize) / height);
              height = maxSize;
            }
          }
          
          const canvas = new OffscreenCanvas(width, height);
          const ctx = canvas.getContext('2d');
          ctx.drawImage(bitmap, 0, 0, width, height);
          sourceBlob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.8 });
          imgMimeType = 'image/jpeg';
          
          // Efficiently convert Blob to Base64
          const buffer = await sourceBlob.arrayBuffer();
          const bytes = new Uint8Array(buffer);
          const chunks = [];
          const chunkSize = 8192;
          for (let i = 0; i < bytes.length; i += chunkSize) {
            chunks.push(String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize)));
          }
          base64Image = btoa(chunks.join(''));
          
        } catch(e) {
          console.error('Image resize/convert failed', e);
          // Fallback to raw dataUrl processing if the offscreen canvas fails
          if (nextTask.dataUrl.startsWith('data:')) {
            const dataUrlParts = nextTask.dataUrl.split(',');
            imgMimeType = dataUrlParts[0].split(':')[1].split(';')[0];
            base64Image = dataUrlParts[1];
          } else {
            resolve({ error: '\u56FE\u7247\u5904\u7406\u7CFB\u7EDF\u6545\u969C\uFF0C\u8BF7\u91CD\u8BD5' });
            return;
          }
        }

        const prompt = activeTpl.content;
        const isJson = prompt.toLowerCase().includes('json');
        const isDefault = activeId === 'default-txt';

        let parsedData = null;
        let usedModel = '';
        let geminiErrorMsg = null;

        if (geminiApiKey) {
          try {
            usedModel = \`Gemini (\${geminiModel})\`;
            const requestBody = {
              contents: [{ parts: [{ inlineData: { mimeType: imgMimeType, data: base64Image } }, { text: prompt }] }],
              generationConfig: { temperature: 0.1 }
            };
            if (isJson) requestBody.generationConfig.responseMimeType = "application/json";

            const apiResponse = await fetch(\`https://generativelanguage.googleapis.com/v1beta/models/\${geminiModel}:generateContent?key=\${geminiApiKey}\`, {
              method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal, body: JSON.stringify(requestBody)
            });
            const data = await apiResponse.json();
            if (data.error) throw new Error(data.error.message);

            let rawText = data.candidates[0].content.parts[0].text.trim();
            if (rawText.toLowerCase().includes('<think>')) {
              rawText = rawText.replace(/<think>[\\s\\S]*?<\\/think>/gi, '').trim();
            }
            if (isJson) {
              try {
                let jsonStr = rawText;
                const mkRegex = /\`\`\`(?:json)?\\s*([sS]*?)\\s*\`\`\`/i;
                const match = jsonStr.match(mkRegex);
                if (match) jsonStr = match[1];

                const startIdx = jsonStr.indexOf('{');
                const endIdx = jsonStr.lastIndexOf('}');
                if (startIdx !== -1 && endIdx !== -1) jsonStr = jsonStr.substring(startIdx, endIdx + 1);
                parsedData = JSON.parse(jsonStr);
              } catch (e) { parsedData = rawText; }
            } else { parsedData = rawText; }
          } catch (err) {
            if (err.name === 'AbortError') { resolve({ error: '\u4EFB\u52A1\u5DF2\u53D6\u6D88' }); return; }
            geminiErrorMsg = err.message;
            if (!ollamaUrl) { resolve({ error: 'Gemini \u8BF7\u6C42\u5931\u8D25: ' + err.message }); return; }
            console.error('Gemini vision failed, falling back to Ollama', err);
            usedModel = '\u26A0\uFE0FGemini\u5931\u8D25\uFF0C\u56DE\u9000\u81F3: '; // mark error
          }
        }

        if (!parsedData && ollamaUrl) {
          try {
            let baseOllamaModel = 'Ollama (' + (ollamaModel || 'qwen3.5:9b') + ')';
            usedModel = usedModel.includes('Gemini\u5931\u8D25') ? usedModel + baseOllamaModel : baseOllamaModel;
            let rawText = await fetchOllamaWithStream(
              ollamaUrl + "/api/generate",
              { model: ollamaModel || 'qwen3.5:9b', format: isJson ? 'json' : undefined, prompt: prompt, images: base64Image ? [base64Image] : [], options: { num_gpu: 99, num_predict: 1024, temperature: 0.1 }, keep_alive: 0 },
              controller, 600000
            );

            if (rawText.toLowerCase().includes('<think>')) {
              rawText = rawText.replace(/<think>[\\s\\S]*?<\\/think>/gi, '').trim();
            }

            if (isJson) {
              try {
                let jsonStr = rawText;
                const mkRegex = /\`\`\`(?:json)?\\s*([sS]*?)\\s*\`\`\`/i;
                const match = jsonStr.match(mkRegex);
                if (match) jsonStr = match[1];

                const startIdx = jsonStr.indexOf('{');
                const endIdx = jsonStr.lastIndexOf('}');
                if (startIdx !== -1 && endIdx !== -1) jsonStr = jsonStr.substring(startIdx, endIdx + 1);
                parsedData = JSON.parse(jsonStr);
              } catch (e) { parsedData = rawText; }
            } else { parsedData = rawText; }
          } catch (err) {
            if (err.name === 'AbortError') { resolve({ error: '\u4EFB\u52A1\u5DF2\u53D6\u6D88' }); return; }
            const fallbackMsg = geminiErrorMsg ? \`Gemini\u5931\u8D25(\${geminiErrorMsg}) \u4E14 Ollama\u56DE\u9000\u5931\u8D25(\${err.message})\` : \`Ollama \u8BF7\u6C42\u5931\u8D25: \${err.message}\`;
            resolve({ error: fallbackMsg }); return;
          }
        }

        if (parsedData === null || parsedData === undefined || (typeof parsedData === 'string' && parsedData.trim() === '') || (typeof parsedData === 'object' && Object.keys(parsedData).length === 0) || (typeof parsedData === 'object' && parsedData.zh && Object.keys(parsedData.zh).length === 0)) {
          resolve({ error: '\u6A21\u578B\u8FD4\u56DE\u4E86\u65E0\u6548\u6216\u7A7A\u6570\u636E\uFF0C\u8BF7\u91CD\u8BD5\u3002' });
          return;
        }
        
        resolve({ data: parsedData, model: usedModel });
      });
    });
    
    if (nextTask.status === 'cancelled' || result.error === '\u4EFB\u52A1\u5DF2\u53D6\u6D88') {
      nextTask.status = 'cancelled';
      isProcessing = false;
      delete abortControllers[nextTask.id];
      broadcastTasks();
      processQueue();
      return;
    }
    
    if (result.error) {
      nextTask.status = 'error';
      nextTask.error = result.error;
    } else {
      nextTask.status = 'completed';
      nextTask.resultData = result.data;
      nextTask.model = result.model;
      
      chrome.storage.local.get(['promptHistory'], (res) => {
        const history = res.promptHistory || [];
        const uniqueId = Date.now();
        nextTask.historyId = uniqueId;
        history.unshift({
          id: uniqueId,
          url: nextTask.dataUrl,
          data: { zh: result.data.zh || result.data },
          model: result.model,
          timestamp: new Date().getTime()
        });
        if (history.length > 100) history.pop();
        chrome.storage.local.set({ promptHistory: history }, () => {
          chrome.runtime.sendMessage({ action: 'analysisComplete', data: result.data, url: nextTask.dataUrl }).catch(() => {});
        });
      });
    }
  } catch (err) {
    if (err.name !== 'AbortError') {
      nextTask.status = 'error';
      nextTask.error = '\u5185\u90E8\u9519\u8BEF: ' + err.message;
    } else {
      nextTask.status = 'cancelled';
    }
  }
  
  isProcessing = false;
  delete abortControllers[nextTask.id];
  broadcastTasks();
  
  // Give a small delay before processing next queue item to ensure UI updates
  setTimeout(processQueue, 100);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'ping') {
    sendResponse({ pong: true });
    return true;
  }

  if (request.action === 'enqueueTask') {
    if (sender && sender.tab && sender.tab.windowId && chrome.sidePanel && chrome.sidePanel.open) {
      try {
        chrome.sidePanel.open({ windowId: sender.tab.windowId }).catch(() => {});
      } catch(e) {}
    }
    chrome.storage.local.get(['activeChatId'], (res) => {
      const taskId = generateTaskId();
      tasks.push({ id: taskId, chatId: res.activeChatId || 'default', dataUrl: request.dataUrl, status: 'pending' });
      chrome.storage.local.set({ tasks });
      broadcastTasks();
      processQueue();
    });
    sendResponse({ success: true });
    return true;
  }
  
  if (request.action === 'getTasks') {
    chrome.storage.local.get(['tasks'], (res) => {
      // Ensure memory tasks are synchronized with storage in case init was slow
      if (res.tasks && tasks.length === 0) {
        tasks = res.tasks;
      }
      sendResponse({ tasks: tasks });
    });
    return true;
  }
  
  if (request.action === 'deleteTask') {
    const taskIndex = tasks.findIndex(t => t.id === request.taskId);
    if (taskIndex !== -1) {
      const task = tasks[taskIndex];
      tasks.splice(taskIndex, 1);
      chrome.storage.local.set({ tasks });
      
      // Also remove from library history if historyId exists
      if (task.historyId) {
        chrome.storage.local.get(['promptHistory'], (res) => {
          let history = res.promptHistory || [];
          history = history.filter(h => h.id !== task.historyId);
          chrome.storage.local.set({ promptHistory: history }, () => {
             // broadcast update so library removes it immediately
             chrome.runtime.sendMessage({ action: 'analysisComplete' }).catch(() => {});
          });
        });
      }
      broadcastTasks();
    }
    sendResponse({ success: true });
    return true;
  }
  
  if (request.action === 'cancelTask') {
    const task = tasks.find(t => t.id === request.taskId);
    if (task) {
      task.status = 'cancelled';
      if (abortControllers[request.taskId]) {
        abortControllers[request.taskId].abort();
        delete abortControllers[request.taskId];
        
        chrome.storage.local.get(['ollamaUrl', 'ollamaModel'], (res) => {
          let oUrl = (!res.ollamaUrl || res.ollamaUrl.trim() === '') ? 'http://127.0.0.1:11434' : res.ollamaUrl.trim();
          let oModel = (!res.ollamaModel || res.ollamaModel.trim() === '') ? 'qwen3.5:9b' : res.ollamaModel.trim();
          if (oUrl && !oUrl.startsWith('http')) oUrl = 'http://' + oUrl;
          if (oUrl) {
            fetch(oUrl + '/api/generate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ model: oModel || 'qwen3.5:9b', keep_alive: 0 })
            }).catch(() => {});
          }
        });
      }
      broadcastTasks();
    }
    sendResponse({ success: true });
    return true;
  }

  if (request.action === 'captureScreenshot') {
    chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
      sendResponse({ dataUrl: dataUrl });
    });
    return true;
  }
  
  if (request.action === 'smartOptimize') {
    chrome.storage.local.get(['ollamaUrl', 'ollamaModel', 'geminiApiKey', 'geminiModel'], async (result) => {
      let { ollamaUrl, ollamaModel, geminiApiKey, geminiModel } = result;
      geminiApiKey = geminiApiKey || '';
      geminiModel = geminiModel || 'gemini-3.1-flash-lite-preview';
      ollamaUrl = (!ollamaUrl || ollamaUrl.trim() === '') ? 'http://127.0.0.1:11434' : ollamaUrl.trim();
      ollamaModel = (!ollamaModel || ollamaModel.trim() === '') ? 'qwen3.5:9b' : ollamaModel.trim();
      if (ollamaUrl && !ollamaUrl.startsWith('http')) ollamaUrl = 'http://' + ollamaUrl;
      
      if (!geminiApiKey && !ollamaUrl) {
         sendResponse({ success: false, error: '\u672A\u914D\u7F6E\u4EFB\u4F55\u53EF\u7528\u7684 Gemini API Key \u6216 Ollama URL' });
         return;
      }
      
      const optimizePrompt = "\u8BF7\u4F18\u5316\u4EE5\u4E0B\u63D0\u793A\u8BCD\uFF0C\u4F7F\u5176\u66F4\u9002\u5408 AI \u751F\u56FE\uFF0C\u589E\u5F3A\u753B\u9762\u7EC6\u8282\u548C\u6784\u56FE\u63CF\u8FF0\uFF1A\\n\\n" + request.prompt;

      let success = false;
      let geminiErrorMsg = null;
      if (geminiApiKey) {
        try {
          const response = await fetch(\`https://generativelanguage.googleapis.com/v1beta/models/\${geminiModel}:generateContent?key=\${geminiApiKey}\`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: optimizePrompt }] }] })
          });
          const data = await response.json();
          if (data.error) throw new Error(data.error.message);
          sendResponse({ data: data.candidates[0].content.parts[0].text.trim() });
          success = true;
          return;
        } catch (e) {
          geminiErrorMsg = e.message;
          if (!ollamaUrl) {
            sendResponse({ error: 'Gemini \u4F18\u5316\u5931\u8D25: ' + e.message });
            return;
          }
          console.error('Gemini optimization failed, falling back to Ollama', e);
        }
      }

      if (!success && ollamaUrl) {
        try {
          const controller = new AbortController();
          const rawText = await fetchOllamaWithStream(
            ollamaUrl + "/api/generate",
            { model: ollamaModel || 'qwen3.5:9b', prompt: optimizePrompt, options: { num_gpu: 99, num_predict: 1024 }, keep_alive: 0 },
            controller,
            600000
          );
          sendResponse({ data: rawText });
          return;
        } catch (e) {
          const fallbackMsg = geminiErrorMsg ? \`Gemini\u5931\u8D25(\${geminiErrorMsg})\u4E14Ollama\u5931\u8D25(\${e.message})\` : \`Ollama \u8BF7\u6C42\u5931\u8D25: \${e.message}\`;
          sendResponse({ error: fallbackMsg });
        }
      }
    });
    return true;
  }

  if (request.action === 'chat') {
    chrome.storage.local.get(['ollamaUrl', 'ollamaModel', 'geminiApiKey', 'geminiModel'], async (result) => {
      let { ollamaUrl, ollamaModel, geminiApiKey, geminiModel } = result;
      geminiApiKey = geminiApiKey || '';
      geminiModel = geminiModel || 'gemini-3.1-flash-lite-preview';
      ollamaUrl = (!ollamaUrl || ollamaUrl.trim() === '') ? 'http://127.0.0.1:11434' : ollamaUrl.trim();
      ollamaModel = (!ollamaModel || ollamaModel.trim() === '') ? 'qwen3.5:9b' : ollamaModel.trim();
      if (ollamaUrl && !ollamaUrl.startsWith('http')) ollamaUrl = 'http://' + ollamaUrl;
      
      if (!geminiApiKey && !ollamaUrl) {
         sendResponse({ success: false, error: '\u672A\u914D\u7F6E\u4EFB\u4F55\u53EF\u7528\u7684 Gemini API Key \u6216 Ollama URL' });
         return;
      }
      
      const chatPrompt = "\u7528\u6237\u95EE\u9898\uFF1A" + request.message;
      const hasImage = !!request.image;

      let success = false;
      let geminiErrorMsg = null;
      if (geminiApiKey) {
        try {
          const parts = [{ text: chatPrompt }];
          if (hasImage) {
            parts.unshift({ inlineData: { mimeType: "image/jpeg", data: request.image } });
          }
          const response = await fetch(\`https://generativelanguage.googleapis.com/v1beta/models/\${geminiModel}:generateContent?key=\${geminiApiKey}\`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: parts }] })
          });
          const data = await response.json();
          if (data.error) throw new Error(data.error.message);
          sendResponse({ data: data.candidates[0].content.parts[0].text.trim() });
          success = true;
          return;
        } catch (e) {
          geminiErrorMsg = e.message;
          if (!ollamaUrl) {
            sendResponse({ error: 'Gemini \u804A\u5929\u5931\u8D25: ' + e.message });
            return;
          }
          console.error('Gemini chat failed, falling back to Ollama', e);
        }
      }

      if (!success && ollamaUrl) {
        try {
          const body = { model: ollamaModel || 'qwen3.5:9b', prompt: chatPrompt, options: { num_gpu: 99, num_predict: 2048 }, keep_alive: 0 };
          if (hasImage) body.images = [request.image];
          const controller = new AbortController();
          const rawText = await fetchOllamaWithStream(
            ollamaUrl + "/api/generate",
            body,
            controller,
            600000
          );
          sendResponse({ data: rawText });
          return;
        } catch (e) {
          const fallbackMsg = geminiErrorMsg ? \`Gemini\u5931\u8D25(\${geminiErrorMsg})\u4E14Ollama\u5931\u8D25(\${e.message})\` : \`Ollama \u8BF7\u6C42\u5931\u8D25: \${e.message}\`;
          sendResponse({ error: fallbackMsg });
        }
      }
    });
    return true;
  }

  if (request.action === 'rewritePrompt') {
    chrome.storage.local.get(['geminiApiKey', 'geminiModel', 'ollamaUrl', 'ollamaModel'], async (result) => {
      let { geminiApiKey, geminiModel, ollamaUrl, ollamaModel } = result;
      geminiApiKey = geminiApiKey || '';
      geminiModel = geminiModel || 'gemini-3.1-flash-lite-preview';
      ollamaUrl = (!ollamaUrl || ollamaUrl.trim() === '') ? 'http://127.0.0.1:11434' : ollamaUrl.trim();
      ollamaModel = (!ollamaModel || ollamaModel.trim() === '') ? 'qwen3.5:9b' : ollamaModel.trim();
      if (ollamaUrl && !ollamaUrl.startsWith('http')) ollamaUrl = 'http://' + ollamaUrl;
      
      if (!geminiApiKey && !ollamaUrl) {
         sendResponse({ success: false, error: '\u672A\u914D\u7F6E\u4EFB\u4F55\u53EF\u7528\u7684 Gemini API Key \u6216 Ollama URL' });
         return;
      }

      try {
        const promptText = \`\u8BF7\u4E00\u952E\u6E05\u9664\u4EE5\u4E0B\u63D0\u793A\u8BCD\u4E2D\u6240\u6709\u5173\u4E8E\u670D\u88C5\u7684\u63CF\u8FF0\uFF08\u6B3E\u5F0F\u3001\u989C\u8272\u3001\u5F62\u6001\u7B49\uFF09\uFF0C\u5E76\u5728\u63D0\u793A\u8BCD\u6700\u524D\u9762\u589E\u52A0\u201C\u56FE\u4E2D\u7684\u6A21\u7279\u7A7F\u7740\u56FE\u4E2D\u7684\u670D\u9970\u201D\u3002\u76F4\u63A5\u8F93\u51FA\u4FEE\u6539\u540E\u7684\u5B8C\u6574\u63D0\u793A\u8BCD\uFF0C\u4E0D\u8981\u5305\u542B\u4EFB\u4F55\u5176\u4ED6\u89E3\u91CA\u6216\u591A\u4F59\u7684\u8BDD\u3002

\u539F\u59CB\u63D0\u793A\u8BCD\uFF1A
\${request.prompt}\`;

        let rewrittenPrompt = null;
        let geminiErrorMsg = null;

        if (geminiApiKey) {
          try {
            const response = await fetch(\`https://generativelanguage.googleapis.com/v1beta/models/\${geminiModel}:generateContent?key=\${geminiApiKey}\`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }], generationConfig: { temperature: 0.1 } })
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error.message);
            rewrittenPrompt = data.candidates[0].content.parts[0].text.trim();
          } catch (e) {
            geminiErrorMsg = e.message;
            if (!ollamaUrl) {
              sendResponse({ error: 'Gemini \u4FEE\u6539\u5931\u8D25: ' + e.message });
              return;
            }
            console.error('Gemini rewrite failed', e);
          }
        }

        if (!rewrittenPrompt && ollamaUrl) {
          try {
            const controller = new AbortController();
            rewrittenPrompt = await fetchOllamaWithStream(
               ollamaUrl + "/api/generate",
              { model: ollamaModel || 'qwen3.5:9b', prompt: promptText, options: { num_gpu: 99, num_predict: 1024, temperature: 0.1 }, keep_alive: 0 },
              controller,
              600000
            );
            if (rewrittenPrompt && rewrittenPrompt.toLowerCase().includes('<think>')) {
              rewrittenPrompt = rewrittenPrompt.replace(/<think>[\\s\\S]*?<\\/think>/gi, '').trim();
            }
          } catch(e) {
             const fallbackMsg = geminiErrorMsg ? \`Gemini\u5931\u8D25(\${geminiErrorMsg})\u4E14Ollama\u5931\u8D25(\${e.message})\` : \`Ollama \u8BF7\u6C42\u5931\u8D25: \${e.message}\`;
             sendResponse({ error: fallbackMsg });
             return;
          }
        }
        
        if (rewrittenPrompt !== null && rewrittenPrompt !== undefined) {
          if (rewrittenPrompt === '') rewrittenPrompt = '\uFF08\u6A21\u578B\u672A\u8F93\u51FA\u4EFB\u4F55\u5185\u5BB9\uFF0C\u8BF7\u68C0\u67E5\u6A21\u578B\u80FD\u529B\u6216\u63D0\u793A\u8BCD\uFF09';
          sendResponse({ data: rewrittenPrompt });
        } else {
          sendResponse({ error: '\u91CD\u5199\u5931\u8D25\uFF0C\u83B7\u53D6\u5230\u7A7A\u54CD\u5E94' });
        }
      } catch (err) {
        sendResponse({ error: '\u5185\u90E8\u9519\u8BEF: ' + err.message });
      }
    });
    return true;
  }
});
`;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  backgroundJs
});
