
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'screenshot-extract',
    title: '截图提取提示词',
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
        t.error = '服务进程重启，任务已中断';
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
      throw new Error('Ollama 请求超时或已被终止');
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
          resolve({ error: '未配置任何可用的 Gemini API Key 或 Ollama URL' });
          return;
        }
        
        const defaultTemplates = [
          { id: 'default-txt', name: '复杂/默认结构', content: \`作为一名专业的图像分析师，你的任务是客观、精确、极其详细地分析所提供的图像。你必须严格描述画面中实际存在的内容，禁止推断、想象或添加任何画面以外的元素。
核心原则:
绝对客观: 只描述你所看到的。
主体优先: 首先识别图像的核心主体。
精确量化: 对数量、位置、角度要尽可能精确。
反向解析为「按9大模块顺序输出的中文长句提示词」，用于直接生成高质量AI图像。
⚠️ 严格规则（必须遵守）：
最终只输出【一整段中文长句】，不分段、不换行。
按「1→9模块顺序」组织内容，但不出现模块编号或字段名。
各信息用句号分隔，整体语义连贯自然。
若图片中不存在某字段信息 → 该字段直接跳过，不补充、不臆造。
禁止出现“这是一张/画面中/图片里”等说明性开头。
🧠 输出逻辑（隐式执行，不要输出结构）：
1️⃣ 风格与效果 → 风格、光影类型、整体视觉风格、后期色彩倾向
2️⃣ 光影与机位 → 主光类型、光比、阴影特征、景别、机位角度、焦段、环境光反射、局部光效、主体与背景关系
3️⃣ 主体与姿态 → 人物属性、表情、眼神、微动作、主体位置、头部、躯干、四肢姿态、脚部细节
4️⃣ 主色与氛围 → 主色、副色、点缀色、整体氛围、渐变、环境反射
5️⃣ 背景与空间 → 几何结构、比例、材质、光影互动、空间层次
6️⃣ 道具与互动 → 道具类型、互动方式、手部细节、织物状态、占比关系
7️⃣ 动作与细节 → 主体动作、手部状态、配饰、细微动态
8️⃣ 穿搭与风格 → 上装、下装、鞋子、材质反光与褶皱、配色关系、整体统一性
9️⃣ 特殊效果 → 特效类型、后期处理、材质表现精度；
现在开始解析图片并输出：\` },
          { id: 'simple-txt', name: '简单', content: \`你是一位顶级AI绘画提示词工程师（Midjourney / Stable Diffusion）。

任务：将我提供的图片，反向解析为“可直接用于生图的一行中文Prompt”。

⚠ 严格规则（必须遵守）：
- 只输出【最终Prompt】，不做任何解释
- 输出为【单行中文】，用逗号分隔关键词
- 不要分段
- 不要标题
- 不要解释性语言（如：this image shows / a photo of）
- 不要结构标签（如 Subject / Style 等）
- 保持专业、精简、可直接复制使用

⚙ Prompt内容必须包含：
[主体与动作],
[构图与机位],
[风格],
[光影],
[色彩],
[材质与细节],
[空间与背景],
[质量与渲染]

现在开始解析图片并输出：\` }
        ];
        
        let templates = promptTemplates || defaultTemplates;
        
        // Force update old templates
        if (templates.length === 1 && templates[0].id === 'default-txt' && templates[0].name === '默认结构') {
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
          resolve({ error: '无法获取图片数据' });
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
            resolve({ error: '图片处理系统故障，请重试' });
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
            const requestBody: any = {
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
                const mkRegex = /\`\`\`(?:json)?\\s*([\\s\\S]*?)\\s*\`\`\`/i;
                const match = jsonStr.match(mkRegex);
                if (match) jsonStr = match[1];

                const startIdx = jsonStr.indexOf('{');
                const endIdx = jsonStr.lastIndexOf('}');
                if (startIdx !== -1 && endIdx !== -1) jsonStr = jsonStr.substring(startIdx, endIdx + 1);
                parsedData = JSON.parse(jsonStr);
              } catch (e) { parsedData = rawText; }
            } else { parsedData = rawText; }
          } catch (err) {
            if (err.name === 'AbortError') { resolve({ error: '任务已取消' }); return; }
            geminiErrorMsg = err.message;
            if (!ollamaUrl) { resolve({ error: 'Gemini 请求失败: ' + err.message }); return; }
            console.error('Gemini vision failed, falling back to Ollama', err);
            usedModel = '⚠️Gemini失败，回退至: '; // mark error
          }
        }

        if (!parsedData && ollamaUrl) {
          try {
            let baseOllamaModel = 'Ollama (' + (ollamaModel || 'qwen3.5:9b') + ')';
            usedModel = usedModel.includes('Gemini失败') ? usedModel + baseOllamaModel : baseOllamaModel;
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
                const mkRegex = /\`\`\`(?:json)?\\s*([\\s\\S]*?)\\s*\`\`\`/i;
                const match = jsonStr.match(mkRegex);
                if (match) jsonStr = match[1];

                const startIdx = jsonStr.indexOf('{');
                const endIdx = jsonStr.lastIndexOf('}');
                if (startIdx !== -1 && endIdx !== -1) jsonStr = jsonStr.substring(startIdx, endIdx + 1);
                parsedData = JSON.parse(jsonStr);
              } catch (e) { parsedData = rawText; }
            } else { parsedData = rawText; }
          } catch (err) {
            if (err.name === 'AbortError') { resolve({ error: '任务已取消' }); return; }
            const fallbackMsg = geminiErrorMsg ? \`Gemini失败(\${geminiErrorMsg}) 且 Ollama回退失败(\${err.message})\` : \`Ollama 请求失败: \${err.message}\`;
            resolve({ error: fallbackMsg }); return;
          }
        }

        if (parsedData === null || parsedData === undefined || (typeof parsedData === 'string' && parsedData.trim() === '') || (typeof parsedData === 'object' && Object.keys(parsedData).length === 0) || (typeof parsedData === 'object' && parsedData.zh && Object.keys(parsedData.zh).length === 0)) {
          resolve({ error: '模型返回了无效或空数据，请重试。' });
          return;
        }
        
        resolve({ data: parsedData, model: usedModel });
      });
    });
    
    if (nextTask.status === 'cancelled' || result.error === '任务已取消') {
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
      nextTask.error = '内部错误: ' + err.message;
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
         sendResponse({ success: false, error: '未配置任何可用的 Gemini API Key 或 Ollama URL' });
         return;
      }
      
      const optimizePrompt = "请优化以下提示词，使其更适合 AI 生图，增强画面细节和构图描述：\\n\\n" + request.prompt;

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
            sendResponse({ error: 'Gemini 优化失败: ' + e.message });
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
          const fallbackMsg = geminiErrorMsg ? \`Gemini失败(\${geminiErrorMsg})且Ollama失败(\${e.message})\` : \`Ollama 请求失败: \${e.message}\`;
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
         sendResponse({ success: false, error: '未配置任何可用的 Gemini API Key 或 Ollama URL' });
         return;
      }
      
      const chatPrompt = "用户问题：" + request.message;
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
            sendResponse({ error: 'Gemini 聊天失败: ' + e.message });
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
          const fallbackMsg = geminiErrorMsg ? \`Gemini失败(\${geminiErrorMsg})且Ollama失败(\${e.message})\` : \`Ollama 请求失败: \${e.message}\`;
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
         sendResponse({ success: false, error: '未配置任何可用的 Gemini API Key 或 Ollama URL' });
         return;
      }

      try {
        const promptText = \`请一键清除以下提示词中所有关于服装的描述（款式、颜色、形态等），并在提示词最前面增加“图中的模特穿着图中的服饰”。直接输出修改后的完整提示词，不要包含任何其他解释或多余的话。\n\n原始提示词：\n\${request.prompt}\`;

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
              sendResponse({ error: 'Gemini 修改失败: ' + e.message });
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
              rewrittenPrompt = rewrittenPrompt.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
            }
          } catch(e) {
             const fallbackMsg = geminiErrorMsg ? \`Gemini失败(\${geminiErrorMsg})且Ollama失败(\${e.message})\` : \`Ollama 请求失败: \${e.message}\`;
             sendResponse({ error: fallbackMsg });
             return;
          }
        }
        
        if (rewrittenPrompt !== null && rewrittenPrompt !== undefined) {
          if (rewrittenPrompt === '') rewrittenPrompt = '（模型未输出任何内容，请检查模型能力或提示词）';
          sendResponse({ data: rewrittenPrompt });
        } else {
          sendResponse({ error: '重写失败，获取到空响应' });
        }
      } catch (err) {
        sendResponse({ error: '内部错误: ' + err.message });
      }
    });
    return true;
  }
});
