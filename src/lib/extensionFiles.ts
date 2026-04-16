export const manifestJson = `{
  "manifest_version": 3,
  "name": "AI 提示词提取器",
  "version": "1.2",
  "description": "使用 Gemini 或 Ollama 智能分析网页图片，一键反推高质量 AI 绘画提示词。",
  "permissions": [
    "storage",
    "unlimitedStorage",
    "contextMenus",
    "activeTab",
    "scripting",
    "sidePanel"
  ],
  "host_permissions": [
    "*://*/*"
  ],
  "side_panel": {
    "default_path": "sidepanel.html"
  },
  "content_scripts": [
    {
      "matches": ["*://*/*"],
      "css": ["content.css"],
      "js": ["content.js"]
    }
  ],
  "background": {
    "service_worker": "background.js"
  },
  "commands": {
    "trigger-screenshot": {
      "suggested_key": {
        "default": "Alt+Q"
      },
      "description": "截图提取提示词"
    }
  },
  "icons": {
    "16": "icon16.png",
    "48": "icon48.png",
    "128": "icon128.png"
  },
  "action": {
    "default_icon": {
      "16": "icon16.png",
      "48": "icon48.png",
      "128": "icon128.png"
    }
  }
}`;

export const contentCss = `
.ai-prompt-btn {
  position: absolute;
  z-index: 999999;
  background: rgba(15, 15, 20, 0.7);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 8px 14px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.4),
    0 0 20px rgba(139, 92, 246, 0.4);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  animation: ai-fade-in 0.3s ease-out;
}

.ai-prompt-btn:hover {
  transform: translateY(-2px) scale(1.02);
  background: rgba(24, 24, 27, 0.8);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 
    0 12px 32px rgba(0, 0, 0, 0.5),
    0 0 30px rgba(139, 92, 246, 0.6);
}

.ai-screenshot-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999999;
  background: rgba(0, 0, 0, 0.3);
  cursor: crosshair;
}

.ai-screenshot-selector {
  position: absolute;
  border: 2px solid #a855f7;
  background: rgba(168, 85, 247, 0.1);
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
}

.ai-notification {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 10000000;
  background: #18181b;
  color: #fff;
  padding: 12px 20px;
  border-radius: 12px;
  border: 1px solid rgba(168, 85, 247, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
  animation: ai-slide-up 0.3s ease-out;
}

@keyframes ai-slide-up {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.ai-prompt-btn span {
  font-size: 16px;
  filter: drop-shadow(0 0 4px rgba(251, 191, 36, 0.3));
}

@keyframes ai-fade-in {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.ai-prompt-card {
  position: absolute;
  z-index: 999999;
  width: 380px;
  background: rgba(15, 15, 20, 0.65);
  backdrop-filter: blur(40px) saturate(200%);
  -webkit-backdrop-filter: blur(40px) saturate(200%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  box-shadow: 
    0 0 0 1px rgba(255,255,255,0.05) inset,
    0 24px 64px rgba(0, 0, 0, 0.6),
    0 0 80px rgba(139, 92, 246, 0.15);
  color: #e4e4e7;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: ai-card-in 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.ai-prompt-card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at 50% 0%, rgba(139, 92, 246, 0.15), transparent 50%),
              radial-gradient(circle at 100% 100%, rgba(56, 189, 248, 0.1), transparent 50%);
  pointer-events: none;
  z-index: -1;
}

@keyframes ai-card-in {
  from { opacity: 0; transform: translateX(20px) scale(0.98); }
  to { opacity: 1; transform: translateX(0) scale(1); }
}

.ai-prompt-card-header {
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.02);
}

.ai-prompt-card-title {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 10px;
  letter-spacing: -0.01em;
}

.ai-prompt-card-close {
  background: transparent;
  border: none;
  color: #71717a;
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  display: flex;
  transition: all 0.2s;
}

.ai-prompt-card-close:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.ai-prompt-card-content {
  flex: 1;
  overflow-y: auto;
  max-height: 500px;
  padding: 20px;
}

.ai-prompt-card-content::-webkit-scrollbar {
  width: 6px;
}
.ai-prompt-card-content::-webkit-scrollbar-track {
  background: transparent;
}
.ai-prompt-card-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 10px;
}
.ai-prompt-card-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.25);
}

.ai-prompt-tabs {
  display: flex;
  background: rgba(255, 255, 255, 0.04);
  padding: 4px;
  border-radius: 12px;
  margin-bottom: 20px;
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.ai-prompt-tab {
  flex: 1;
  padding: 8px;
  border: none;
  background: transparent;
  color: #71717a;
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
  border-radius: 8px;
  transition: all 0.2s;
}

.ai-prompt-tab.active {
  background: #fff;
  color: #000;
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
}

.ai-prompt-result-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ai-prompt-item {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 14px;
  transition: all 0.2s;
}

.ai-prompt-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.ai-prompt-item-title {
  font-size: 11px;
  font-weight: 800;
  color: #71717a;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.ai-prompt-item-icon {
  font-size: 14px;
  filter: drop-shadow(0 0 4px rgba(255,255,255,0.1));
}

.ai-prompt-item-content {
  font-size: 14px;
  line-height: 1.6;
  color: #d4d4d8;
  font-weight: 500;
}

.ai-prompt-card-footer {
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.01);
}

.ai-prompt-copy-btn {
  width: 100%;
  padding: 12px;
  background: #fff;
  color: #000;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  font-weight: 800;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.2s;
}

.ai-prompt-copy-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(255, 255, 255, 0.2);
}

.ai-prompt-loading {
  text-align: center;
  padding: 60px 0;
  color: #a1a1aa;
  font-size: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.ai-prompt-spinner {
  width: 28px;
  height: 28px;
  border: 3px solid rgba(255,255,255,0.05);
  border-top-color: #fbbf24;
  border-radius: 50%;
  animation: spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.ai-status-panel {
  position: fixed;
  bottom: 24px;
  left: 24px;
  background: rgba(9, 9, 11, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 12px 16px;
  z-index: 10000;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateY(0);
  opacity: 1;
}

.ai-status-panel.hidden {
  transform: translateY(20px);
  opacity: 0;
  pointer-events: none;
}

.ai-status-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.1);
  border-top-color: #fbbf24;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
`;

export const contentJs = `
let currentCard = null;
let hoverBtn = null;
let currentImg = null;

function getHoverBtn() {
  if (hoverBtn) return hoverBtn;
  hoverBtn = document.createElement('button');
  hoverBtn.className = 'ai-prompt-btn';
  hoverBtn.innerHTML = \`AI 反推\`;
  hoverBtn.style.display = 'none';
  document.body.appendChild(hoverBtn);

  hoverBtn.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (currentImg) {
      enqueueScreenshot(currentImg.src);
      hoverBtn.style.display = 'none';
    }
  });

  hoverBtn.addEventListener('mouseleave', (e) => {
    if (currentImg && e.relatedTarget !== currentImg) {
      hoverBtn.style.display = 'none';
    }
  });

  return hoverBtn;
}

document.addEventListener('mouseover', (e) => {
  const target = e.target;
  if (target.tagName === 'IMG') {
    if (target.width < 100 || target.height < 100) return;
    
    currentImg = target;
    const btn = getHoverBtn();
    
    const rect = target.getBoundingClientRect();
    btn.style.top = (window.scrollY + rect.top + 12) + 'px';
    btn.style.left = (window.scrollX + rect.right - 120) + 'px'; // Top-right
    btn.style.display = 'flex';
  }
});

document.addEventListener('mouseout', (e) => {
  if (e.target.tagName === 'IMG' && e.target === currentImg) {
    const btn = getHoverBtn();
    if (e.relatedTarget !== btn && !btn.contains(e.relatedTarget)) {
      btn.style.display = 'none';
    }
  }
});

// Screenshot logic
let isSelecting = false;
let startX, startY, selectionBox;

function enqueueScreenshot(croppedDataUrl) {
  chrome.runtime.sendMessage({ action: 'enqueueTask', dataUrl: croppedDataUrl });
  showNotification('任务已发送至副驾驶对话框');
}

function startScreenshot() {
  const overlay = document.createElement('div');
  overlay.className = 'ai-screenshot-overlay';
  document.body.appendChild(overlay);

  overlay.addEventListener('mousedown', (e) => {
    isSelecting = true;
    startX = e.clientX;
    startY = e.clientY;
    selectionBox = document.createElement('div');
    selectionBox.className = 'ai-screenshot-selector';
    overlay.appendChild(selectionBox);
  });

  overlay.addEventListener('mousemove', (e) => {
    if (!isSelecting) return;
    const currentX = e.clientX;
    const currentY = e.clientY;
    const left = Math.min(startX, currentX);
    const top = Math.min(startY, currentY);
    const width = Math.abs(startX - currentX);
    const height = Math.abs(startY - currentY);
    selectionBox.style.left = left + 'px';
    selectionBox.style.top = top + 'px';
    selectionBox.style.width = width + 'px';
    selectionBox.style.height = height + 'px';
  });

  overlay.addEventListener('mouseup', async (e) => {
    isSelecting = false;
    const rect = selectionBox.getBoundingClientRect();
    
    if (rect.width < 10 || rect.height < 10) {
      overlay.remove();
      return;
    }

    // Remove overlay first to avoid capturing it
    overlay.remove();
    
    // Wait a tiny bit for the DOM to update and overlay to disappear
    setTimeout(() => {
      chrome.runtime.sendMessage({ 
        action: 'captureScreenshot'
      }, (response) => {
        if (response && response.dataUrl) {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const dpr = window.devicePixelRatio || 1;
            
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            
            ctx.drawImage(
              img,
              rect.left * dpr,
              rect.top * dpr,
              rect.width * dpr,
              rect.height * dpr,
              0, 0,
              rect.width * dpr,
              rect.height * dpr
            );
            
            const croppedDataUrl = canvas.toDataURL('image/png');
            enqueueScreenshot(croppedDataUrl);
          };
          img.src = response.dataUrl;
        } else {
          showNotification('截图失败，请重试');
        }
      });
    }, 50);
  });

  // Cancel on Escape
  const handleEsc = (e) => {
    if (e.key === 'Escape') {
      overlay.remove();
      document.removeEventListener('keydown', handleEsc);
    }
  };
  document.addEventListener('keydown', handleEsc);
}

function showNotification(text) {
  const notification = document.createElement('div');
  notification.className = 'ai-notification';
  notification.innerHTML = \`<span>✅</span> \${text}\`;
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(20px)';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startScreenshot') {
    startScreenshot();
  }
});


`;

export const backgroundJs = `
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
      chrome.storage.local.get(['geminiApiKey', 'ollamaUrl', 'ollamaModel', 'promptTemplates', 'activeTemplateId'], async (res) => {
        let { geminiApiKey, ollamaUrl, ollamaModel, promptTemplates, activeTemplateId } = res;
        if (!ollamaUrl) ollamaUrl = 'http://127.0.0.1:11434';
        if (!ollamaModel) ollamaModel = 'gemma4:e4b';
        
        const defaultTemplates = [
          { id: 'default', name: '默认结构', content: \`请深入分析这张图片，并根据以下 9 部分架构反推 AI 绘画提示词。
所有输出必须使用中文。

架构要求：
1. 风格与效果 (Style & Effect): 极其详细地描述画风（如：赛博朋克、油画、写实摄影、二次元等）、光影质感、后期色彩处理。
2. 光影与机位 (Lighting & Camera): 描述主光方向、光比、阴影细节、景别（特写/全景）、机位角度、镜头焦段、环境反射。
3. 主体与姿态 (Subject & Pose): 详细刻画人物特征、面部表情、眼神流转、肢体微动作、头部及躯干的精确姿态。
4. 主色与氛围 (Colors & Atmosphere): 核心色调、辅助色、点缀色的搭配，以及画面传达的整体情绪氛围。
5. 背景与空间 (Background & Space): 背景的几何构成、比例关系、材质纹理、空间深度感。
6. 道具与互动 (Props & Interaction): 道具的具体类型、人物与道具的互动方式、手指关节的精细角度。
7. 动作与细节 (Action & Details): 主体正在进行的具体动作、手部细节、配饰纹理、眼神光。
8. 穿搭与风格 (Outfit & Style): 详细描述衣着材质、褶皱感、色彩和谐度、穿搭的整体风格一致性。
9. 特殊效果 (Special Effects): 视觉特效（如：粒子、光晕）、后期处理痕迹、材质的微观精度。

输出格式要求：
返回一个 JSON 对象，包含两个键：
- "zh": 包含上述 9 部分的完整详细中文解析。
- "noOutfit": 同样包含 9 部分，但第 8 部分（穿搭与风格）必须修改为只描述“角色正在做什么”，严禁出现任何关于衣服、裤子、鞋子等服饰的描述。其他部分保持详细。
\` }
        ];
        
        const templates = promptTemplates || defaultTemplates;
        const activeId = activeTemplateId || 'default';
        const activeTpl = templates.find(t => t.id === activeId) || templates[0];
        
        if (ollamaUrl && !ollamaUrl.startsWith('http')) {
          ollamaUrl = 'http://' + ollamaUrl;
        }
        
        let base64Image;
        let mimeType = 'image/jpeg';
        
        if (nextTask.dataUrl.startsWith('data:')) {
          base64Image = nextTask.dataUrl.split(',')[1];
          mimeType = nextTask.dataUrl.split(';')[0].split(':')[1];
        } else {
          try {
            const imgResponse = await fetch(nextTask.dataUrl);
            const blob = await imgResponse.blob();
            const buffer = await blob.arrayBuffer();
            const bytes = new Uint8Array(buffer);
            let binary = '';
            for (let i = 0; i < bytes.byteLength; i++) {
              binary += String.fromCharCode(bytes[i]);
            }
            base64Image = btoa(binary);
            mimeType = blob.type || 'image/jpeg';
          } catch (e) {
            resolve({ error: '无法获取图片数据' });
            return;
          }
        }

        const prompt = activeTpl.content;
        const isJson = prompt.toLowerCase().includes('json');
        const isDefault = activeId === 'default';

        let parsedData = null;

        if (ollamaUrl) {
          try {
            const response = await fetch(ollamaUrl + "/api/generate", {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              signal: controller.signal,
              body: JSON.stringify({
                model: ollamaModel || 'gemma4:e4b',
                prompt: prompt,
                images: [base64Image],
                stream: false,
                format: isJson ? 'json' : undefined,
                options: { num_gpu: 99 },
                keep_alive: 0
              })
            });
            const data = await response.json();
            if (data.error) {
              throw new Error(data.error);
            }
            try {
              let rawText = data.response.trim();
              if (isJson) {
                if (rawText.startsWith('\`\`\`json')) {
                  rawText = rawText.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
                }
                parsedData = JSON.parse(rawText);
              } else {
                parsedData = rawText;
              }
            } catch(e) {
              parsedData = data.response;
            }
          } catch (e) {
            if (e.name === 'AbortError') {
              resolve({ error: '任务已取消' });
              return;
            }
            if (!geminiApiKey) {
              resolve({ error: 'Ollama 请求失败: ' + e.message });
              return;
            }
            console.error('Ollama vision failed, falling back to Gemini', e);
          }
        }

        if (!parsedData && geminiApiKey) {
          try {
            const requestBody = {
              contents: [
                {
                  parts: [
                    { inlineData: { mimeType: mimeType, data: base64Image } },
                    { text: prompt }
                  ]
                }
              ]
            };
            
            if (isDefault) {
              requestBody.generationConfig = {
                responseMimeType: "application/json",
                responseSchema: {
                  type: "OBJECT",
                  properties: {
                    zh: {
                      type: "OBJECT",
                      properties: {
                        part1: { type: "STRING" }, part2: { type: "STRING" }, part3: { type: "STRING" },
                        part4: { type: "STRING" }, part5: { type: "STRING" }, part6: { type: "STRING" },
                        part7: { type: "STRING" }, part8: { type: "STRING" }, part9: { type: "STRING" }
                      }
                    },
                    noOutfit: {
                      type: "OBJECT",
                      properties: {
                        part1: { type: "STRING" }, part2: { type: "STRING" }, part3: { type: "STRING" },
                        part4: { type: "STRING" }, part5: { type: "STRING" }, part6: { type: "STRING" },
                        part7: { type: "STRING" }, part8: { type: "STRING" }, part9: { type: "STRING" }
                      }
                    }
                  }
                }
              };
            } else if (isJson) {
              requestBody.generationConfig = {
                responseMimeType: "application/json"
              };
            }

            const apiResponse = await fetch(\`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=\${geminiApiKey}\`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              signal: controller.signal,
              body: JSON.stringify(requestBody)
            });

            const data = await apiResponse.json();
            
            if (data.error) {
              if (data.error.code === 429 || data.error.code === 503) {
                resolve({ error: '模型当前请求量过大，请稍后重试。' });
              } else {
                resolve({ error: data.error.message });
              }
              return;
            }

            let rawText = data.candidates[0].content.parts[0].text.trim();
            if (isJson) {
              try {
                if (rawText.startsWith('\`\`\`json')) {
                  rawText = rawText.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
                }
                parsedData = JSON.parse(rawText);
              } catch (e) {
                parsedData = rawText;
              }
            } else {
              parsedData = rawText;
            }
          } catch (err) {
            if (err.name === 'AbortError') {
              resolve({ error: '任务已取消' });
              return;
            }
            resolve({ error: 'Gemini 请求失败: ' + err.message });
            return;
          }
        }

        if (!parsedData) {
          resolve({ error: '分析失败，请检查模型配置。' });
          return;
        }
        
        resolve({ data: parsedData });
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
      
      chrome.storage.local.get(['promptHistory'], (res) => {
        const history = res.promptHistory || [];
        history.unshift({
          id: Date.now(),
          url: nextTask.dataUrl,
          data: { zh: result.data.zh || result.data },
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
    sendResponse({ tasks });
    return true;
  }
  
  if (request.action === 'cancelTask') {
    const task = tasks.find(t => t.id === request.taskId);
    if (task) {
      task.status = 'cancelled';
      if (abortControllers[request.taskId]) {
        abortControllers[request.taskId].abort();
        delete abortControllers[request.taskId];
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
    chrome.storage.local.get(['ollamaUrl', 'ollamaModel', 'geminiApiKey'], async (result) => {
      let { ollamaUrl, ollamaModel, geminiApiKey } = result;
      if (!ollamaUrl) ollamaUrl = 'http://127.0.0.1:11434';
      if (!ollamaModel) ollamaModel = 'gemma4:e4b';
      if (ollamaUrl && !ollamaUrl.startsWith('http')) ollamaUrl = 'http://' + ollamaUrl;
      
      const optimizePrompt = "请优化以下提示词，使其更适合 AI 生图，增强画面细节和构图描述：\\n\\n" + request.prompt;

      if (ollamaUrl) {
        try {
          const response = await fetch(ollamaUrl + "/api/generate", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: ollamaModel || 'gemma4:e4b', prompt: optimizePrompt, stream: false, options: { num_gpu: 99 }, keep_alive: 0 })
          });
          const data = await response.json();
          if (data.error) throw new Error(data.error);
          sendResponse({ data: data.response.trim() });
          return;
        } catch (e) {
          if (!geminiApiKey) {
            sendResponse({ error: 'Ollama 请求失败: ' + e.message });
            return;
          }
          console.error('Ollama optimization failed, falling back to Gemini', e);
        }
      }

      if (geminiApiKey) {
        try {
          const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=" + geminiApiKey, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: optimizePrompt }] }] })
          });
          const data = await response.json();
          if (data.error) throw new Error(data.error.message);
          sendResponse({ data: data.candidates[0].content.parts[0].text.trim() });
        } catch (e) {
          sendResponse({ error: 'Gemini 优化失败: ' + e.message });
        }
      }
    });
    return true;
  }

  if (request.action === 'chat') {
    chrome.storage.local.get(['ollamaUrl', 'ollamaModel', 'geminiApiKey'], async (result) => {
      let { ollamaUrl, ollamaModel, geminiApiKey } = result;
      if (!ollamaUrl) ollamaUrl = 'http://127.0.0.1:11434';
      if (!ollamaModel) ollamaModel = 'gemma4:e4b';
      if (ollamaUrl && !ollamaUrl.startsWith('http')) ollamaUrl = 'http://' + ollamaUrl;
      
      const chatPrompt = "用户问题：" + request.message;
      const hasImage = !!request.image;

      if (ollamaUrl) {
        try {
          const body = { model: ollamaModel || 'gemma4:e4b', prompt: chatPrompt, stream: false, options: { num_gpu: 99 }, keep_alive: 0 };
          if (hasImage) body.images = [request.image];
          const response = await fetch(ollamaUrl + "/api/generate", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          });
          const data = await response.json();
          if (data.error) throw new Error(data.error);
          sendResponse({ data: data.response.trim() });
          return;
        } catch (e) {
          if (!geminiApiKey) {
            sendResponse({ error: 'Ollama 请求失败: ' + e.message });
            return;
          }
          console.error('Ollama chat failed, falling back to Gemini', e);
        }
      }

      if (geminiApiKey) {
        try {
          const parts = [{ text: chatPrompt }];
          if (hasImage) {
            parts.unshift({ inlineData: { mimeType: "image/jpeg", data: request.image } });
          }
          const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=" + geminiApiKey, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: parts }] })
          });
          const data = await response.json();
          if (data.error) throw new Error(data.error.message);
          sendResponse({ data: data.candidates[0].content.parts[0].text.trim() });
        } catch (e) {
          sendResponse({ error: 'Gemini 聊天失败: ' + e.message });
        }
      }
    });
    return true;
  }

  if (request.action === 'rewritePrompt') {
    chrome.storage.local.get(['geminiApiKey', 'ollamaUrl', 'ollamaModel'], async (result) => {
      let { geminiApiKey, ollamaUrl, ollamaModel } = result;
      if (!ollamaUrl) ollamaUrl = 'http://127.0.0.1:11434';
      if (!ollamaModel) ollamaModel = 'gemma4:e4b';
      if (ollamaUrl && !ollamaUrl.startsWith('http')) ollamaUrl = 'http://' + ollamaUrl;

      try {
        const promptText = \`请一键清除以下提示词中所有关于服装的描述（款式、颜色、形态等），并在提示词最前面增加“图中的模特穿着图中的服饰”。直接输出修改后的完整提示词，不要包含任何其他解释或多余的话。\\n\\n原始提示词：\\n\${request.prompt}\`;

        if (ollamaUrl) {
          try {
            const response = await fetch(ollamaUrl + "/api/generate", {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ model: ollamaModel || 'gemma4:e4b', prompt: promptText, stream: false, options: { num_gpu: 99 }, keep_alive: 0 })
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error);
            sendResponse({ data: data.response.trim() });
            return;
          } catch(e) {
            if (!geminiApiKey) {
              sendResponse({ error: 'Ollama 请求失败: ' + e.message });
              return;
            }
            console.error('Ollama rewrite failed', e);
          }
        }

        if (geminiApiKey) {
          try {
            const response = await fetch(\`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=\${geminiApiKey}\`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{
                  parts: [{
                    text: promptText
                  }]
                }]
              })
            });
            
            const data = await response.json();
            if (data.error) throw new Error(data.error.message);
            
            const rewrittenPrompt = data.candidates[0].content.parts[0].text.trim();
            sendResponse({ data: rewrittenPrompt });
          } catch (e) {
            sendResponse({ error: 'Gemini 修改失败: ' + e.message });
          }
        }
      } catch (err) {
        sendResponse({ error: '内部错误: ' + err.message });
      }
    });
    return true;
  }
});
`;

export const popupHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Gemini 配置</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; width: 320px; padding: 0; margin: 0; background: #09090b; color: #e4e4e7; overflow: hidden; }
    .container { padding: 24px; background: linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%); }
    .header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
    .header span { font-size: 24px; filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.3)); }
    h2 { margin: 0; font-size: 18px; color: #fff; font-weight: 800; tracking: -0.02em; }
    p { font-size: 13px; color: #a1a1aa; margin: 0 0 20px 0; line-height: 1.6; }
    .input-group { margin-bottom: 20px; }
    label { display: block; font-size: 12px; font-weight: 700; color: #71717a; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em; }
    input { width: 100%; padding: 12px 14px; box-sizing: border-box; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 13px; outline: none; transition: all 0.2s; background: rgba(255,255,255,0.03); color: #fff; }
    input:focus { border-color: #fbbf24; background: rgba(255,255,255,0.06); box-shadow: 0 0 0 4px rgba(251, 191, 36, 0.1); }
    button { width: 100%; padding: 12px; background: #fff; color: #000; border: none; border-radius: 12px; cursor: pointer; font-weight: 700; font-size: 14px; transition: all 0.2s; }
    button:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2); }
    .secondary-btn { background: rgba(255,255,255,0.05); color: #e4e4e7; margin-top: 12px; border: 1px solid rgba(255,255,255,0.1); }
    .secondary-btn:hover { background: rgba(255,255,255,0.1); box-shadow: none; }
    #status { margin-top: 16px; font-size: 13px; color: #34d399; display: none; text-align: center; font-weight: 600; background: rgba(52, 211, 153, 0.1); padding: 10px; border-radius: 10px; border: 1px solid rgba(52, 211, 153, 0.1); }
    .links { margin-top: 24px; display: flex; justify-content: center; gap: 16px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 20px; }
    .links a { color: #71717a; text-decoration: none; font-size: 12px; font-weight: 600; transition: color 0.2s; }
    .links a:hover { color: #fff; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span>🦆</span>
      <h2>Gemini 在线版配置</h2>
    </div>
    <p>请输入您的 Gemini API Key 以启用在线图片分析功能。</p>
    <div class="input-group">
      <label for="apiKey">Gemini API Key</label>
      <input type="password" id="apiKey" placeholder="输入您的 API Key...">
    </div>
    <button id="saveBtn">保存配置</button>
    <button id="historyBtn" class="secondary-btn">查看提示词收藏夹</button>
    <div id="status">配置已安全保存</div>
    <div class="links">
      <a href="https://aistudio.google.com/app/apikey" target="_blank">获取 API Key</a>
      <a href="https://github.com" target="_blank">使用帮助</a>
    </div>
  </div>
  <script src="popup.js"></script>
</body>
</html>
`;

export const popupJs = `
document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('apiKey');
  const saveBtn = document.getElementById('saveBtn');
  const status = document.getElementById('status');

  // Load existing key
  chrome.storage.local.get(['geminiApiKey'], (result) => {
    if (result.geminiApiKey) {
      apiKeyInput.value = result.geminiApiKey;
    }
  });

  // Save key
  saveBtn.addEventListener('click', () => {
    const key = apiKeyInput.value.trim();
    chrome.storage.local.set({ geminiApiKey: key }, () => {
      status.style.display = 'block';
      setTimeout(() => {
        status.style.display = 'none';
      }, 2000);
    });
  });

  // Open History
  document.getElementById('historyBtn').addEventListener('click', () => {
    chrome.tabs.create({ url: 'collection.html' });
  });
});
`;

export const collectionHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>提示词收藏夹</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #09090b; color: #e4e4e7; margin: 0; padding: 40px; min-height: 100vh; }
    .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 40px; max-width: 1200px; margin-left: auto; margin-right: auto; }
    .header-actions { display: flex; gap: 12px; }
    .header h1 { margin: 0; font-size: 28px; display: flex; align-items: center; gap: 12px; font-weight: 800; }
    .btn-action { background: rgba(255,255,255,0.05); color: #e4e4e7; border: 1px solid rgba(255,255,255,0.1); padding: 10px 20px; border-radius: 12px; cursor: pointer; font-weight: 700; transition: all 0.2s; }
    .btn-action:hover { background: rgba(255,255,255,0.1); transform: translateY(-2px); }
    .clear-btn { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); padding: 10px 20px; border-radius: 12px; cursor: pointer; font-weight: 700; transition: all 0.2s; }
    .clear-btn:hover { background: rgba(239, 68, 68, 0.2); transform: translateY(-2px); }
    .search-input { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 10px 20px; border-radius: 12px; color: #fff; width: 240px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; max-width: 1200px; margin: 0 auto; }
    .table-view { width: 100%; max-width: 1200px; margin: 0 auto; border-collapse: collapse; background: rgba(255,255,255,0.03); border-radius: 24px; overflow: hidden; }
    .table-view th, .table-view td { padding: 20px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.05); }
    .table-view th { color: #71717a; font-size: 12px; text-transform: uppercase; }
    .table-img { width: 60px; height: 80px; object-fit: cover; border-radius: 8px; }
    .card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; overflow: hidden; display: flex; flex-direction: column; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); backdrop-filter: blur(20px); }
    .card:hover { border-color: rgba(139, 92, 246, 0.4); box-shadow: 0 12px 40px rgba(0,0,0,0.5), 0 0 30px rgba(139, 92, 246, 0.15); transform: translateY(-6px); }
    .card-img { width: 100%; aspect-ratio: 3 / 4; height: auto; object-fit: cover; background: #18181b; border-bottom: 1px solid rgba(255,255,255,0.05); }
    .card-content { padding: 16px; flex: 1; display: flex; flex-direction: column; }
    .time { font-size: 12px; color: #71717a; margin-bottom: 16px; font-weight: 600; }
    .actions { display: flex; gap: 12px; margin-top: auto; }
    .btn { flex: 1; padding: 12px; border-radius: 12px; border: none; cursor: pointer; font-weight: 700; font-size: 13px; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 6px; white-space: nowrap; }
    .btn-copy { background: #fff; color: #000; }
    .btn-copy:hover { background: #e4e4e7; transform: translateY(-2px); }
    .btn-replace { background: rgba(52, 211, 153, 0.1); color: #34d399; border: 1px solid rgba(52, 211, 153, 0.2); }
    .btn-replace:hover { background: rgba(52, 211, 153, 0.2); transform: translateY(-2px); }
    .btn-copy-mod { background: rgba(139, 92, 246, 0.1); color: #a78bfa; border: 1px solid rgba(139, 92, 246, 0.2); }
    .btn-copy-mod:hover { background: rgba(139, 92, 246, 0.2); transform: translateY(-2px); }
    .btn-del { background: rgba(255,255,255,0.05); color: #e4e4e7; border: 1px solid rgba(255,255,255,0.1); }
    .btn-del:hover { background: rgba(239, 68, 68, 0.2); color: #ef4444; border-color: rgba(239, 68, 68, 0.3); transform: translateY(-2px); }
    .empty { text-align: center; padding: 120px 0; color: #71717a; grid-column: 1 / -1; background: rgba(255,255,255,0.02); border-radius: 32px; border: 1px dashed rgba(255,255,255,0.05); }
    .empty h2 { color: #e4e4e7; margin-bottom: 8px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🦆 提示词收藏夹</h1>
    <div class="header-actions">
      <input type="text" id="search" class="search-input" placeholder="搜索关键词...">
      <button class="btn-action" id="exportBtn">导出 CSV</button>
      <button class="clear-btn" id="clearAll">清空全部记录</button>
    </div>
  </div>
  <div class="grid" id="grid"></div>
  <table class="table-view" id="tableView" style="display:none;">
    <thead><tr><th>图片</th><th>关键词</th></tr></thead>
    <tbody id="tableBody"></tbody>
  </table>
  <script src="collection.js"></script>
</body>
</html>
`;

export const collectionJs = `
document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('grid');
  const tableView = document.getElementById('tableView');
  const tableBody = document.getElementById('tableBody');
  const clearBtn = document.getElementById('clearAll');
  const searchInput = document.getElementById('search');
  const exportBtn = document.getElementById('exportBtn');
  
  let historyData = [];
  let isGridView = true;

  function render() {
    chrome.storage.local.get(['promptHistory'], (result) => {
      const allData = result.promptHistory || [];
      const searchTerm = searchInput.value.toLowerCase();
      historyData = allData.filter(item => {
        const d = item.data.zh;
        const keywords = Object.values(d).join(' ').toLowerCase();
        return keywords.includes(searchTerm);
      });

      if (historyData.length === 0) {
        grid.innerHTML = '<div class="empty"><h2>暂无收藏记录</h2><p>在网页上提取的提示词会自动保存在这里（存储于浏览器本地缓存）</p></div>';
        tableView.style.display = 'none';
        clearBtn.style.display = 'none';
        return;
      }
      
      clearBtn.style.display = 'block';
      
      if (isGridView) {
        grid.style.display = 'grid';
        tableView.style.display = 'none';
        grid.innerHTML = '';
        historyData.forEach(item => {
          const d = item.data.zh || item.data;
          const hasModified = !!item.modifiedPrompt;
          const card = document.createElement('div');
          card.className = 'card';
          card.innerHTML = \`
            <img src="\${item.url}" class="card-img" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMxODE4MWIiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZmlsbD0iIzcxNzE3YSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPkltYWdlIFVuYXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg=='">
            <div class="card-content">
              <div class="time">\${new Date(item.timestamp).toLocaleString()}</div>
              <div class="actions" style="display: flex; flex-wrap: wrap; gap: 8px;">
                \${hasModified ? \`
                  <button class="btn btn-copy" data-id="\${item.id}" style="flex: 1;">复制原提示词</button>
                  <button class="btn btn-copy-mod" data-id="\${item.id}" style="flex: 1;">复制修改后</button>
                \` : \`
                  <button class="btn btn-copy" data-id="\${item.id}" style="flex: 1;">复制提示词</button>
                  <button class="btn btn-replace" data-id="\${item.id}" style="flex: 1;">替换主体</button>
                \`}
                <button class="btn btn-del" data-id="\${item.id}" style="flex: 1 1 100%;">删除</button>
              </div>
            </div>
          \`;
          grid.appendChild(card);
        });
      } else {
        grid.style.display = 'none';
        tableView.style.display = 'table';
        tableBody.innerHTML = '';
        historyData.forEach(item => {
          const d = item.data.zh || item.data;
          const keywords = Object.keys(d).filter(k => k.startsWith('part')).map(k => d[k]).join(' ');
          const row = document.createElement('tr');
          row.innerHTML = \`
            <td><img src="\${item.url}" class="table-img"></td>
            <td>\${keywords.substring(0, 100)}...</td>
          \`;
          tableBody.appendChild(row);
        });
      }

      // Bind events
      document.querySelectorAll('.btn-copy').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = parseInt(e.currentTarget.dataset.id);
          const item = historyData.find(x => x.id === id);
          if (item) {
            const d = item.data.zh || item.data;
            const text = Object.keys(d).filter(k => k.startsWith('part')).map(k => d[k]).join(', ');
            navigator.clipboard.writeText(text);
            const originalText = e.currentTarget.innerText;
            e.currentTarget.innerText = '已复制!';
            setTimeout(() => e.currentTarget.innerText = originalText, 2000);
          }
        });
      });

      document.querySelectorAll('.btn-copy-mod').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = parseInt(e.currentTarget.dataset.id);
          const item = historyData.find(x => x.id === id);
          if (item && item.modifiedPrompt) {
            navigator.clipboard.writeText(item.modifiedPrompt);
            const originalText = e.currentTarget.innerText;
            e.currentTarget.innerText = '已复制!';
            setTimeout(() => e.currentTarget.innerText = originalText, 2000);
          }
        });
      });

      document.querySelectorAll('.btn-replace').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = parseInt(e.currentTarget.dataset.id);
          const item = historyData.find(x => x.id === id);
          if (item) {
            const d = item.data.zh || item.data;
            const originalPrompt = Object.keys(d).filter(k => k.startsWith('part')).map(k => d[k]).join(', ');
            
            e.currentTarget.innerText = '处理中...';
            e.currentTarget.disabled = true;
            
            chrome.runtime.sendMessage({ action: 'rewritePrompt', prompt: originalPrompt }, (response) => {
              if (response && response.data) {
                chrome.storage.local.get(['promptHistory'], (res) => {
                  const newHistory = (res.promptHistory || []).map(x => {
                    if (x.id === id) {
                      return { ...x, modifiedPrompt: response.data };
                    }
                    return x;
                  });
                  chrome.storage.local.set({ promptHistory: newHistory }, render);
                });
              } else {
                alert('替换失败: ' + (response?.error || '未知错误'));
                e.currentTarget.innerText = '替换主体';
                e.currentTarget.disabled = false;
              }
            });
          }
        });
      });

      document.querySelectorAll('.btn-del').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = parseInt(e.currentTarget.dataset.id);
          chrome.storage.local.get(['promptHistory'], (res) => {
            const newHistory = (res.promptHistory || []).filter(x => x.id !== id);
            chrome.storage.local.set({ promptHistory: newHistory }, render);
          });
        });
      });
    });
  }

  searchInput.addEventListener('input', render);
  
  exportBtn.addEventListener('click', () => {
    chrome.storage.local.get(['promptHistory'], (res) => {
      const history = res.promptHistory || [];
      if (history.length === 0) return;
      
      const headers = ['时间', '图片URL', '完整提示词'];
      const rows = history.map(item => {
        const d = item.data.zh || item.data; // Handle both Gemini and Ollama data structures
        const fullPrompt = [d.part1, d.part2, d.part3, d.part4, d.part5, d.part6, d.part7, d.part8, d.part9].filter(Boolean).join('\\n');
        return [
          new Date(item.timestamp).toLocaleString(),
          item.url,
          \`"\${fullPrompt.replace(/"/g, '""')}"\`
        ].join(',');
      });
      
      const csvContent = "\\uFEFF" + [headers.join(','), ...rows].join('\\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', \`ai_prompts_export_\${new Date().getTime()}.csv\`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  });

  clearBtn.addEventListener('click', () => {
    if (confirm('确定要清空所有收藏记录吗？此操作不可恢复。')) {
      chrome.storage.local.set({ promptHistory: [] }, render);
    }
  });

  render();
});
`;

export const sidepanelHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>AI 副驾驶</title>
  <style>
    :root {
      --glass-bg: rgba(255,255,255,0.55);
      --glass-border: rgba(255,255,255,0.6);
      --glass-highlight: rgba(255,255,255,0.7);
      --glass-shadow: rgba(0,0,0,0.1);
      --accent-start: #7aa2ff;
      --accent-end: #9b7bff;
      
      --bg-base: #f5f7fb;
      --bg-surface: var(--glass-bg);
      --border-color: var(--glass-border);
      --border-light: var(--glass-highlight);
      --text-main: #111827;
      --text-muted: #6b7280;
      --accent-blue: var(--accent-start);
      --accent-purple: var(--accent-end);
      --accent-gradient: linear-gradient(135deg, var(--accent-start), var(--accent-end));
      --accent-glow: 0 4px 20px rgba(120,140,255,0.4);
      --accent-glow-strong: 0 8px 30px rgba(120,140,255,0.6);
      --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.04);
      --shadow-md: 0 10px 40px var(--glass-shadow), 0 0 30px rgba(120,140,255,0.25);
      --liquid-blur: blur(30px) saturate(140%);
      --transition-liquid: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
      --icon-color: #7A7A7A;
    }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
      height: 100vh; 
      display: flex; 
      flex-direction: column; 
      margin: 0; 
      background: radial-gradient(circle at 20% 20%, rgba(120,140,255,0.08), transparent 40%), #f5f7fb;
      background-attachment: fixed;
      color: var(--text-main); 
    }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(120,140,255,0.4); border-radius: 10px; transition: var(--transition-liquid); }
    ::-webkit-scrollbar-thumb:hover { background: rgba(120,140,255,0.6); box-shadow: var(--accent-glow); }
    
    .glass { 
      background: var(--bg-surface); 
      border: 1px solid var(--border-color); 
      backdrop-filter: var(--liquid-blur);
      -webkit-backdrop-filter: var(--liquid-blur);
    }
    #nav { 
      display: flex; 
      padding: 0 16px;
      border-bottom: 1px solid var(--border-color);
      background: var(--bg-surface);
      backdrop-filter: var(--liquid-blur);
      -webkit-backdrop-filter: var(--liquid-blur);
      z-index: 10;
    }
    .tab { 
      padding: 6px; 
      cursor: pointer; 
      color: var(--text-muted);
      border-radius: 6px;
      transition: var(--transition-liquid);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .tab:hover { background: rgba(255,255,255,0.8); color: var(--accent-blue); box-shadow: var(--accent-glow); }
    .tab.active { 
      color: var(--accent-blue); 
      background: rgba(106, 168, 255, 0.05);
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.8);
    }
    #content { 
      flex: 1; 
      overflow-y: auto; 
      padding: 24px; 
      padding-bottom: 470px;
    }
    .view { display: none; min-height: 100%; flex-direction: column; }
    .view.active { display: flex; animation: fadeIn 0.3s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
    
    /* Settings View */
    .settings-group { margin-bottom: 20px; padding: 16px; border-radius: 12px; box-shadow: var(--shadow-sm); background: var(--bg-surface); backdrop-filter: var(--liquid-blur); -webkit-backdrop-filter: var(--liquid-blur); border: 1px solid var(--border-color); }
    .settings-group label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px; color: var(--text-main); }
    .settings-group input { width: 100%; padding: 14px; border: 1px solid rgba(255,255,255,0.5); border-radius: 16px; box-sizing: border-box; font-size: 14px; outline: none; transition: var(--transition-liquid); background: rgba(255,255,255,0.4); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); color: var(--text-main); }
    .settings-group input:focus { box-shadow: 0 0 20px rgba(120,140,255,0.4); }
    
    /* Library View */
    .library-header { display: flex; gap: 8px; margin-bottom: 16px; padding-right: 32px; }
    #library-search { flex: 1; padding: 14px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.5); font-size: 13px; outline: none; background: rgba(255,255,255,0.4); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); transition: var(--transition-liquid); }
    #library-search:focus { box-shadow: 0 0 20px rgba(120,140,255,0.4); }
    #export-csv-btn { padding: 8px 12px; border-radius: 8px; background: var(--bg-surface); backdrop-filter: var(--liquid-blur); -webkit-backdrop-filter: var(--liquid-blur); border: 1px solid var(--border-color); cursor: pointer; color: var(--text-main); font-size: 13px; display: flex; align-items: center; gap: 6px; transition: var(--transition-liquid); }
    #export-csv-btn:hover { background: rgba(255,255,255,0.9); transform: scale(1.02); box-shadow: var(--accent-glow); border-color: rgba(106, 168, 255, 0.2); }
    
    #library-grid { display: flex; flex-direction: column; gap: 12px; }
    .card { display: flex; gap: 12px; align-items: stretch; border-radius: 20px; padding: 12px; transition: var(--transition-liquid); position: relative; overflow: hidden; box-shadow: 0 10px 40px var(--glass-shadow), 0 0 30px rgba(120,140,255,0.25); background: var(--bg-surface); backdrop-filter: var(--liquid-blur); -webkit-backdrop-filter: var(--liquid-blur); border: 1px solid var(--border-color); }
    .card::before { content: ""; position: absolute; inset: 0; background: linear-gradient(120deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.25) 40%, rgba(255,255,255,0.05) 100%); pointer-events: none; border-radius: inherit; }
    .card:hover { transform: translateY(-2px) scale(1.01); box-shadow: 0 10px 40px var(--glass-shadow), 0 0 30px rgba(120,140,255,0.4); border-color: rgba(106, 168, 255, 0.2); }
    .card img { width: 80px; height: 106px; object-fit: cover; border-radius: 12px; margin-bottom: 0; flex-shrink: 0; }
    .card-text { font-size: 13px; color: var(--text-main); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.5; cursor: pointer; margin-bottom: 8px; }
    .card-actions { display: flex; gap: 8px; margin-top: auto; }
    .card-actions .icon-btn { flex: 1; background: rgba(255,255,255,0.4); border-radius: 8px; padding: 8px; display: flex; align-items: center; justify-content: center; box-shadow: inset 0 1px 0 rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.02); transition: var(--transition-liquid); }
    .card-actions .icon-btn:hover { background: rgba(255,255,255,0.9); color: var(--accent-blue); transform: scale(1.02); box-shadow: var(--accent-glow), inset 0 1px 0 rgba(255,255,255,1); border-color: rgba(106, 168, 255, 0.2); }
    
    /* Chat View */
    #chat-messages { display: flex; flex-direction: column; gap: 16px; padding-bottom: 20px; }
    .msg { padding: 12px 16px; border-radius: 18px; font-size: 14px; line-height: 1.6; position: relative; max-width: 85%; word-break: break-word; box-sizing: border-box; transition: var(--transition-liquid); backdrop-filter: var(--liquid-blur); -webkit-backdrop-filter: var(--liquid-blur); }
    .msg::before { content: ""; position: absolute; inset: 0; background: linear-gradient(120deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.25) 40%, rgba(255,255,255,0.05) 100%); pointer-events: none; border-radius: inherit; }
    .msg:hover { box-shadow: 0 10px 40px var(--glass-shadow), 0 0 30px rgba(120,140,255,0.25); border-color: rgba(106, 168, 255, 0.15); }
    .msg.user { align-self: flex-end; background: rgba(106, 168, 255, 0.1); color: var(--text-main); border: 1px solid rgba(106, 168, 255, 0.2); }
    .msg.ai { align-self: flex-start; background: var(--bg-surface); border: 1px solid var(--border-color); }
    .msg-content {
      max-height: calc(1.6em * 5);
      overflow-y: auto;
      padding-right: 4px;
    }
    .msg-actions { position: absolute; top: 8px; right: 8px; display: flex; gap: 4px; opacity: 0; transition: var(--transition-liquid); z-index: 2; }
    .msg:hover .msg-actions { opacity: 1; }
    .msg-action-btn { cursor: pointer; color: var(--icon-color); background: rgba(255, 255, 255, 0.6); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border: 1px solid var(--border-color); border-radius: 6px; padding: 4px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.05); transition: var(--transition-liquid); }
    .msg-action-btn:hover { color: var(--accent-blue); background: rgba(255, 255, 255, 0.95); box-shadow: var(--accent-glow); border-color: rgba(106, 168, 255, 0.2); transform: scale(1.05); }
    .msg-img { max-width: 100%; border-radius: 8px; margin-bottom: 8px; }
    
    /* Floating Action Bar */
    #action-bar-container {
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100%;
      padding: 16px;
      box-sizing: border-box;
      background: linear-gradient(to top, var(--bg-base) 80%, transparent);
      z-index: 20;
    }
    #action-bar { 
      background: var(--bg-surface);
      backdrop-filter: var(--liquid-blur);
      -webkit-backdrop-filter: var(--liquid-blur);
      border: 1px solid var(--border-color); 
      border-radius: 20px;
      box-shadow: 0 10px 40px var(--glass-shadow), 0 0 30px rgba(120,140,255,0.25), inset 0 1px 0 rgba(255,255,255,0.8);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: var(--transition-liquid);
      position: relative;
    }
    #action-bar::before {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(120deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.25) 40%, rgba(255,255,255,0.05) 100%);
      pointer-events: none;
    }
    #action-bar:focus-within {
      border-color: rgba(106, 168, 255, 0.3);
      box-shadow: var(--shadow-md), var(--accent-glow), inset 0 1px 0 rgba(255,255,255,0.8);
    }
    #image-preview-container {
      display: none;
      padding: 8px 12px 0;
      position: relative;
    }
    #image-preview {
      height: 60px;
      border-radius: 8px;
      object-fit: cover;
      border: 1px solid var(--border-color);
    }
    #remove-image {
      position: absolute;
      top: 4px;
      left: 60px;
      background: rgba(0,0,0,0.5);
      color: white;
      border: none;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
    }
    #prompt-input { 
      width: 100%; 
      padding: 14px; 
      border: 1px solid rgba(255,255,255,0.5); 
      border-radius: 16px;
      background: rgba(255,255,255,0.4); 
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      color: var(--text-main); 
      box-sizing: border-box; 
      font-family: inherit;
      resize: none;
      outline: none;
      line-height: 1.5;
      max-height: 120px;
      transition: var(--transition-liquid);
    }
    #prompt-input:focus {
      box-shadow: 0 0 20px rgba(120,140,255,0.4);
    }
    .action-bar-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      border-top: 1px solid var(--border-color);
    }
    .action-tools {
      display: flex;
      gap: 8px;
    }
    .icon-btn {
      background: rgba(255, 255, 255, 0.4);
      border: 1px solid var(--border-color);
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.02);
      color: var(--icon-color);
      transition: var(--transition-liquid);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      cursor: pointer;
      padding: 6px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .icon-btn svg { width: 16px; height: 16px; fill: currentColor; transition: var(--transition-liquid); }
    .icon-btn:hover {
      background: rgba(255, 255, 255, 0.9);
      color: var(--accent-blue);
      transform: scale(1.02);
      box-shadow: var(--accent-glow), inset 0 1px 0 rgba(255,255,255,1);
      border-color: rgba(106, 168, 255, 0.2);
    }
    .icon-btn:active {
      transform: scale(0.97);
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
    }
    .btn { padding: 10px 16px; border-radius: 14px; font-weight: 600; font-size: 13px; cursor: pointer; transition: var(--transition-liquid); border: 1px solid var(--border-color); background: var(--bg-surface); backdrop-filter: var(--liquid-blur); -webkit-backdrop-filter: var(--liquid-blur); color: var(--text-main); box-shadow: inset 0 1px 0 rgba(255,255,255,0.8), 0 2px 8px rgba(0,0,0,0.04); display: flex; align-items: center; justify-content: center; gap: 6px; }
    .btn:hover { background: rgba(255, 255, 255, 0.9); transform: scale(1.03); box-shadow: var(--accent-glow), inset 0 1px 0 rgba(255,255,255,1); border-color: rgba(106, 168, 255, 0.3); }
    .btn:active { transform: scale(0.96); box-shadow: inset 0 2px 6px rgba(0,0,0,0.2); }
    .btn-primary { background: linear-gradient(135deg, var(--accent-start), var(--accent-end)); color: white; border: none; box-shadow: inset 0 1px 2px rgba(255,255,255,0.4), 0 4px 20px rgba(120,140,255,0.4); }
    .btn-primary:hover { background: linear-gradient(135deg, #7BB2FF, #A88CFF); box-shadow: 0 8px 30px rgba(120,140,255,0.6); color: white; border-color: transparent; }
    
    /* SVG Icons */
    svg { width: 16px; height: 16px; fill: currentColor; }
    
    /* Modal */
    #modal-overlay {
      display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
      background: rgba(0,0,0,0.2); z-index: 100; align-items: center; justify-content: center;
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
    }
    #modal-content {
      background: var(--bg-surface); width: calc(100% - 32px); max-height: calc(100% - 32px); overflow-y: auto; 
      border-radius: 20px; padding: 24px; box-shadow: 0 10px 40px var(--glass-shadow), 0 0 30px rgba(120,140,255,0.25), 0 0 0 1px rgba(255,255,255,0.5) inset; position: relative;
      display: flex; flex-direction: column;
      backdrop-filter: var(--liquid-blur);
      -webkit-backdrop-filter: var(--liquid-blur);
      border: 1px solid var(--border-color);
    }
    #modal-content::before {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(120deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.25) 40%, rgba(255,255,255,0.05) 100%);
      pointer-events: none;
    }
    #close-modal-btn {
      position: absolute; top: 12px; right: 12px; background: transparent; border: none; 
      cursor: pointer; font-size: 20px; color: var(--text-muted); padding: 4px; line-height: 1;
      transition: var(--transition-liquid);
    }
    #close-modal-btn:hover { color: var(--accent-blue); transform: scale(1.1); }
    
    #history-dropdown {
      background: #ffffff;
      border: 1px solid var(--border-color);
      border-radius: 20px;
      box-shadow: 0 10px 40px var(--glass-shadow), 0 0 30px rgba(120,140,255,0.25), 0 0 0 1px rgba(255,255,255,0.5) inset;
      overflow: hidden;
      position: relative;
    }
    #history-dropdown::before {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(120deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.25) 40%, rgba(255,255,255,0.05) 100%);
      pointer-events: none;
    }
    .history-item { padding: 10px 12px; border-bottom: 1px solid var(--border-color); cursor: pointer; transition: var(--transition-liquid); font-size: 13px; }
    .history-item:hover { background: rgba(106, 168, 255, 0.05); box-shadow: inset 2px 0 0 var(--accent-blue); }
    
    /* Custom Dropdown */
    .custom-select-wrapper {
      position: relative;
      display: inline-block;
    }
    .custom-select {
      padding: 8px 12px;
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.5);
      font-size: 13px;
      font-weight: 500;
      background: rgba(255,255,255,0.4);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      color: var(--text-main);
      cursor: pointer;
      transition: var(--transition-liquid);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      user-select: none;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .custom-select:hover {
      background: rgba(255,255,255,0.6);
      box-shadow: 0 4px 12px rgba(120,140,255,0.15);
    }
    .custom-select::after {
      content: "";
      display: inline-block;
      width: 0;
      height: 0;
      border-left: 4px solid transparent;
      border-right: 4px solid transparent;
      border-top: 5px solid var(--text-muted);
      transition: transform 0.2s;
      flex-shrink: 0;
    }
    .custom-select.open::after {
      transform: rotate(180deg);
    }
    .custom-options {
      position: absolute;
      top: 100%;
      left: 0;
      min-width: 100%;
      margin-top: 6px;
      background: var(--bg-surface);
      backdrop-filter: var(--liquid-blur);
      -webkit-backdrop-filter: var(--liquid-blur);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      box-shadow: 0 10px 40px var(--glass-shadow), 0 0 30px rgba(120,140,255,0.25), 0 0 0 1px rgba(255,255,255,0.5) inset;
      overflow: hidden;
      z-index: 100;
      display: none;
      flex-direction: column;
      max-height: 200px;
      overflow-y: auto;
    }
    .custom-options::before {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(120deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.25) 40%, rgba(255,255,255,0.05) 100%);
      pointer-events: none;
      z-index: -1;
    }
    .custom-options.open {
      display: flex;
    }
    .custom-option {
      padding: 10px 12px;
      font-size: 13px;
      color: var(--text-main);
      cursor: pointer;
      transition: var(--transition-liquid);
      border-bottom: 1px solid rgba(255,255,255,0.1);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .custom-option:last-child {
      border-bottom: none;
    }
    .custom-option:hover, .custom-option.selected {
      background: rgba(120,140,255,0.15);
      color: var(--accent-blue);
    }
  </style>
</head>
<body>
  <div id="nav" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 16px; border-bottom: 1px solid var(--border-color); background: var(--bg-surface); z-index: 10;">
    <div style="display: flex; gap: 8px; align-items: center; flex: 1;">
      <div class="custom-select-wrapper" id="top-template-wrapper" style="max-width: 140px;">
        <div class="custom-select" id="top-template-display" title="选择反推架构">默认结构</div>
        <div class="custom-options" id="top-template-options"></div>
        <select id="top-template-select" style="display: none;"></select>
      </div>
      
      <div style="position: relative;">
        <button class="icon-btn" id="history-toggle-btn" title="历史对话" style="padding: 6px;"><svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg></button>
        <div id="history-dropdown" style="display: none; position: absolute; top: 100%; left: -50px; margin-top: 8px; width: 240px; max-height: 300px; overflow-y: auto; z-index: 50; border-radius: 12px; background: #ffffff;">
          <div style="padding: 12px; border-bottom: 1px solid var(--border-color); font-weight: 600; font-size: 14px; position: sticky; top: 0; background: #ffffff; z-index: 2;">历史对话</div>
          <div id="history-list" style="padding: 8px;"></div>
        </div>
      </div>
      
      <button class="icon-btn" id="new-chat-btn" title="新建对话" style="padding: 6px;"><svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg></button>
    </div>
    <div style="display: flex; gap: 4px; align-items: center;">
      <div class="icon-btn" id="open-library-btn" title="灵感库"><svg viewBox="0 0 24 24"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z"/></svg></div>
      <div class="icon-btn" id="open-settings-btn" title="设置"><svg viewBox="0 0 24 24"><path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.06-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.73,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.06,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.49-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/></svg></div>
    </div>
  </div>
  
  <div id="content">
    <div id="chat-view" class="view active">
      <div id="chat-messages"></div>
    </div>

    <div id="library-view" style="display: none; flex-direction: column; height: 100%;">
      <div class="library-header">
        <input type="text" id="library-search" placeholder="搜索提示词...">
        <button id="export-csv-btn" title="导出CSV" style="background: transparent; border: none; cursor: pointer; color: var(--text-muted);">
          <svg viewBox="0 0 24 24" width="20" height="20"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
        </button>
      </div>
      <div id="library-grid-container" style="padding: 12px; padding-bottom: 20px;"></div>
    </div>
    
    <div id="settings-view" style="display: none;">
      <div class="settings-group">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <label style="margin: 0;">编辑预设模版</label>
          <div class="custom-select-wrapper" id="template-wrapper" style="width: 160px;">
            <div class="custom-select" id="template-display">默认结构</div>
            <div class="custom-options" id="template-options"></div>
            <select id="template-select" style="display: none;"></select>
          </div>
        </div>
        <div style="position: relative; margin-bottom: 8px;">
          <textarea id="template-content" rows="6" style="width: 100%; padding: 14px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.5); resize: none; font-family: inherit; font-size: 13px; background: rgba(255,255,255,0.4); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); outline: none; transition: var(--transition-liquid); color: var(--text-main); box-sizing: border-box;" placeholder="输入模版内容..."></textarea>
          <button id="expand-template-btn" class="icon-btn" style="position: absolute; bottom: 8px; right: 8px; padding: 4px; background: rgba(255,255,255,0.6);" title="展开/收起">
            <svg viewBox="0 0 24 24"><path d="M7 14l5 5 5-5zM7 10l5-5 5 5z"/></svg>
          </button>
        </div>
        <div style="display: flex; gap: 8px;">
          <input type="text" id="new-template-name" placeholder="模版名称" style="flex: 1; padding: 14px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.5); font-size: 13px; background: rgba(255,255,255,0.4); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); outline: none; transition: var(--transition-liquid); color: var(--text-main);">
          <button class="btn btn-primary" id="save-template-btn" style="padding: 8px 16px;">保存</button>
          <button class="btn btn-secondary" id="delete-template-btn" style="padding: 8px 16px; color: #ef4444;">删除</button>
        </div>
      </div>
      
      <div class="settings-group">
        <label>Gemini API Key (云端)</label>
        <input type="password" id="gemini-key" placeholder="AIzaSy...">
      </div>
      <div class="settings-group">
        <label>Ollama URL (本地)</label>
        <input type="text" id="ollama-url" placeholder="http://localhost:11434">
      </div>
      <div class="settings-group">
        <label>Ollama 模型</label>
        <input type="text" id="ollama-model" placeholder="gemma4:e4b">
      </div>
      <button class="btn btn-primary" id="save-settings-btn" style="width: 100%; padding: 10px;">保存配置</button>
      <div id="save-status" style="margin-top: 12px; font-size: 13px; color: #10b981; text-align: center; display: none;">保存成功！</div>
    </div>
  </div>

  <div id="modal-overlay">
    <div id="modal-content">
      <button id="close-modal-btn">&times;</button>
      <div id="modal-body"></div>
    </div>
  </div>

  <div id="action-bar-container">
    <div id="action-bar">
      <div id="image-preview-container">
        <img id="image-preview" src="" alt="Preview">
        <button id="remove-image">×</button>
      </div>
      <div id="quote-preview-container" style="display: none; padding: 8px 12px 0; position: relative;">
        <div id="quote-preview-text" style="background: rgba(106, 168, 255, 0.1); padding: 8px 12px; border-radius: 8px; font-size: 12px; color: var(--text-muted); border-left: 3px solid var(--accent-blue); max-height: 60px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; box-shadow: inset 0 1px 0 rgba(255,255,255,0.5);"></div>
        <button id="remove-quote" style="position: absolute; top: 4px; right: 8px; background: rgba(0,0,0,0.3); color: white; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 12px; backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); transition: var(--transition-liquid);">×</button>
      </div>
      <textarea id="prompt-input" rows="1" placeholder="发送消息..."></textarea>
      <div class="action-bar-bottom">
        <div class="action-tools">
          <input type="file" id="file-upload" accept="image/*" style="display: none;">
          <button class="icon-btn" id="upload-btn" title="上传图片">
            <svg viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
          </button>
          <button class="icon-btn" id="optimize-btn" title="智能优化">
            <svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 9h-2V7h-2v5H6v2h2v5h2v-5h2v-2z"/></svg>
          </button>
        </div>
        <button class="icon-btn" id="send-btn" style="color: var(--accent-blue);" title="发送">
          <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>
    </div>
  </div>
  <script src="sidepanel.js"></script>
</body>
</html>
`;;

export const sidepanelJs = `
const promptInput = document.getElementById('prompt-input');
let currentQuoteText = null;

const quotePreviewContainer = document.getElementById('quote-preview-container');
const quotePreviewText = document.getElementById('quote-preview-text');
const removeQuoteBtn = document.getElementById('remove-quote');

function setQuote(text) {
  currentQuoteText = text;
  quotePreviewText.textContent = text;
  quotePreviewContainer.style.display = 'block';
  promptInput.focus();
}

function removeQuote() {
  currentQuoteText = null;
  quotePreviewText.textContent = '';
  quotePreviewContainer.style.display = 'none';
}

removeQuoteBtn.addEventListener('click', removeQuote);

// Auto-resize textarea
promptInput.addEventListener('input', function() {
  this.style.height = 'auto';
  this.style.height = (this.scrollHeight) + 'px';
  if (this.value === '') {
    this.style.height = 'auto';
  }
});

// Settings Logic
const geminiKeyInput = document.getElementById('gemini-key');
const ollamaUrlInput = document.getElementById('ollama-url');
const ollamaModelInput = document.getElementById('ollama-model');

chrome.storage.local.get(['geminiApiKey', 'ollamaUrl', 'ollamaModel'], (res) => {
  if (res.geminiApiKey) geminiKeyInput.value = res.geminiApiKey;
  if (res.ollamaUrl) ollamaUrlInput.value = res.ollamaUrl;
  if (res.ollamaModel) ollamaModelInput.value = res.ollamaModel;
});

document.getElementById('save-settings-btn').addEventListener('click', () => {
  chrome.storage.local.set({
    geminiApiKey: geminiKeyInput.value.trim(),
    ollamaUrl: ollamaUrlInput.value.trim(),
    ollamaModel: ollamaModelInput.value.trim()
  }, () => {
    const status = document.getElementById('save-status');
    status.style.display = 'block';
    setTimeout(() => status.style.display = 'none', 2000);
  });
});

// Template Logic
const defaultTemplates = [
  { id: 'default', name: '默认结构', content: \`请深入分析这张图片，并根据以下 9 部分架构反推 AI 绘画提示词。
所有输出必须使用中文。

架构要求：
1. 风格与效果 (Style & Effect): 极其详细地描述画风（如：赛博朋克、油画、写实摄影、二次元等）、光影质感、后期色彩处理。
2. 光影与机位 (Lighting & Camera): 描述主光方向、光比、阴影细节、景别（特写/全景）、机位角度、镜头焦段、环境反射。
3. 主体与姿态 (Subject & Pose): 详细刻画人物特征、面部表情、眼神流转、肢体微动作、头部及躯干的精确姿态。
4. 主色与氛围 (Colors & Atmosphere): 核心色调、辅助色、点缀色的搭配，以及画面传达的整体情绪氛围。
5. 背景与空间 (Background & Space): 背景的几何构成、比例关系、材质纹理、空间深度感。
6. 道具与互动 (Props & Interaction): 道具的具体类型、人物与道具的互动方式、手指关节的精细角度。
7. 动作与细节 (Action & Details): 主体正在进行的具体动作、手部细节、配饰纹理、眼神光。
8. 穿搭与风格 (Outfit & Style): 详细描述衣着材质、褶皱感、色彩和谐度、穿搭的整体风格一致性。
9. 特殊效果 (Special Effects): 视觉特效（如：粒子、光晕）、后期处理痕迹、材质的微观精度。

输出格式要求：
返回一个 JSON 对象，包含两个键：
- "zh": 包含上述 9 部分的完整详细中文解析。
- "noOutfit": 同样包含 9 部分，但第 8 部分（穿搭与风格）必须修改为只描述“角色正在做什么”，严禁出现任何关于衣服、裤子、鞋子等服饰的描述。其他部分保持详细。\` }
];

const topTemplateSelect = document.getElementById('top-template-select');
const templateSelect = document.getElementById('template-select');
const templateContent = document.getElementById('template-content');
const newTemplateName = document.getElementById('new-template-name');
const saveTemplateBtn = document.getElementById('save-template-btn');
const deleteTemplateBtn = document.getElementById('delete-template-btn');

function loadTemplates() {
  chrome.storage.local.get(['promptTemplates', 'activeTemplateId'], (res) => {
    const templates = res.promptTemplates || defaultTemplates;
    const activeId = res.activeTemplateId || 'default';
    
    if (topTemplateSelect) topTemplateSelect.innerHTML = '';
    if (templateSelect) templateSelect.innerHTML = '';
    
    const topOptionsContainer = document.getElementById('top-template-options');
    const templateOptionsContainer = document.getElementById('template-options');
    if (topOptionsContainer) topOptionsContainer.innerHTML = '';
    if (templateOptionsContainer) templateOptionsContainer.innerHTML = '';
    
    templates.forEach(t => {
      if (topTemplateSelect) {
        const opt1 = document.createElement('option');
        opt1.value = t.id;
        opt1.textContent = t.name;
        if (t.id === activeId) opt1.selected = true;
        topTemplateSelect.appendChild(opt1);
        
        if (topOptionsContainer) {
          const customOpt1 = document.createElement('div');
          customOpt1.className = 'custom-option' + (t.id === activeId ? ' selected' : '');
          customOpt1.textContent = t.name;
          customOpt1.dataset.value = t.id;
          customOpt1.addEventListener('click', () => {
            topTemplateSelect.value = t.id;
            topTemplateSelect.dispatchEvent(new Event('change'));
            document.getElementById('top-template-display').textContent = t.name;
            topOptionsContainer.classList.remove('open');
            document.getElementById('top-template-display').classList.remove('open');
            updateCustomOptionsSelection(topOptionsContainer, t.id);
          });
          topOptionsContainer.appendChild(customOpt1);
          if (t.id === activeId) {
            document.getElementById('top-template-display').textContent = t.name;
          }
        }
      }
      
      if (templateSelect) {
        const opt2 = document.createElement('option');
        opt2.value = t.id;
        opt2.textContent = t.name;
        if (t.id === activeId) opt2.selected = true;
        templateSelect.appendChild(opt2);
        
        if (templateOptionsContainer) {
          const customOpt2 = document.createElement('div');
          customOpt2.className = 'custom-option' + (t.id === activeId ? ' selected' : '');
          customOpt2.textContent = t.name;
          customOpt2.dataset.value = t.id;
          customOpt2.addEventListener('click', () => {
            templateSelect.value = t.id;
            templateSelect.dispatchEvent(new Event('change'));
            document.getElementById('template-display').textContent = t.name;
            templateOptionsContainer.classList.remove('open');
            document.getElementById('template-display').classList.remove('open');
            updateCustomOptionsSelection(templateOptionsContainer, t.id);
          });
          templateOptionsContainer.appendChild(customOpt2);
          if (t.id === activeId) {
            document.getElementById('template-display').textContent = t.name;
          }
        }
      }
    });
    
    const activeTpl = templates.find(t => t.id === activeId) || templates[0];
    if (templateContent) templateContent.value = activeTpl.content;
    if (newTemplateName) newTemplateName.value = activeTpl.name;
  });
}

function updateCustomOptionsSelection(container, value) {
  if (!container) return;
  const options = container.querySelectorAll('.custom-option');
  options.forEach(opt => {
    if (opt.dataset.value === value) {
      opt.classList.add('selected');
    } else {
      opt.classList.remove('selected');
    }
  });
}

function setupCustomDropdowns() {
  const topDisplay = document.getElementById('top-template-display');
  const topOptions = document.getElementById('top-template-options');
  if (topDisplay && topOptions) {
    topDisplay.addEventListener('click', (e) => {
      e.stopPropagation();
      topOptions.classList.toggle('open');
      topDisplay.classList.toggle('open');
    });
  }
  
  const templateDisplay = document.getElementById('template-display');
  const templateOptions = document.getElementById('template-options');
  if (templateDisplay && templateOptions) {
    templateDisplay.addEventListener('click', (e) => {
      e.stopPropagation();
      templateOptions.classList.toggle('open');
      templateDisplay.classList.toggle('open');
    });
  }
  
  document.addEventListener('click', () => {
    if (topOptions) topOptions.classList.remove('open');
    if (topDisplay) topDisplay.classList.remove('open');
    if (templateOptions) templateOptions.classList.remove('open');
    if (templateDisplay) templateDisplay.classList.remove('open');
  });
  
  const expandBtn = document.getElementById('expand-template-btn');
  const templateContent = document.getElementById('template-content');
  if (expandBtn && templateContent) {
    expandBtn.addEventListener('click', () => {
      if (templateContent.rows === 6) {
        templateContent.rows = 15;
      } else {
        templateContent.rows = 6;
      }
    });
  }
}
setupCustomDropdowns();

function switchTemplate(selectedId) {
  chrome.storage.local.set({ activeTemplateId: selectedId });
  chrome.storage.local.get(['promptTemplates'], (res) => {
    const templates = res.promptTemplates || defaultTemplates;
    const tpl = templates.find(t => t.id === selectedId);
    if (tpl) {
      if (templateContent) templateContent.value = tpl.content;
      if (newTemplateName) newTemplateName.value = tpl.name;
      if (topTemplateSelect) topTemplateSelect.value = selectedId;
      if (templateSelect) templateSelect.value = selectedId;
    }
  });
}

if (topTemplateSelect) topTemplateSelect.addEventListener('change', (e) => switchTemplate(e.target.value));
if (templateSelect) templateSelect.addEventListener('change', (e) => switchTemplate(e.target.value));

if (saveTemplateBtn) {
  saveTemplateBtn.addEventListener('click', () => {
    const name = newTemplateName.value.trim();
    const content = templateContent.value.trim();
    if (!name || !content) return alert('名称和内容不能为空');
    
    chrome.storage.local.get(['promptTemplates', 'activeTemplateId'], (res) => {
      let templates = res.promptTemplates || defaultTemplates;
      let activeId = templateSelect.value;
      
      const existingIndex = templates.findIndex(t => t.id === activeId);
      if (existingIndex >= 0 && templates[existingIndex].name === name) {
        templates[existingIndex].content = content;
      } else {
        const newId = 'tpl_' + Date.now();
        templates.push({ id: newId, name, content });
        activeId = newId;
      }
      
      chrome.storage.local.set({ promptTemplates: templates, activeTemplateId: activeId }, () => {
        loadTemplates();
        const status = document.getElementById('save-status');
        if (status) {
          status.textContent = '模版已保存！';
          status.style.display = 'block';
          setTimeout(() => status.style.display = 'none', 2000);
        }
      });
    });
  });
}

if (deleteTemplateBtn) {
  deleteTemplateBtn.addEventListener('click', () => {
    const selectedId = templateSelect.value;
    if (selectedId === 'default') return alert('预设模版不可删除');
    
    chrome.storage.local.get(['promptTemplates'], (res) => {
      let templates = res.promptTemplates || defaultTemplates;
      templates = templates.filter(t => t.id !== selectedId);
      chrome.storage.local.set({ promptTemplates: templates, activeTemplateId: 'default' }, () => {
        loadTemplates();
        const status = document.getElementById('save-status');
        if (status) {
          status.textContent = '模版已删除！';
          status.style.display = 'block';
          setTimeout(() => status.style.display = 'none', 2000);
        }
      });
    });
  });
}

loadTemplates();

// Copy Helper
function copyText(text, btn) {
  navigator.clipboard.writeText(text);
  const oldHtml = btn.innerHTML;
  btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';
  setTimeout(() => btn.innerHTML = oldHtml, 2000);
}

// Library Logic
function renderLibrary(searchQuery = '') {
  const gridContainer = document.getElementById('library-grid-container');
  if (!gridContainer) return;
  chrome.storage.local.get(['promptHistory'], (res) => {
    const history = res.promptHistory || [];
    
    let filteredHistory = history;
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filteredHistory = history.filter(item => {
        const d = item.data.zh || item.data;
        let keywords = '';
        if (typeof d === 'string') {
          keywords = d;
        } else if (typeof d === 'object' && d !== null) {
          keywords = Object.values(d).join(' ');
        }
        return keywords.toLowerCase().includes(lowerQuery);
      });
    }

    if (filteredHistory.length === 0) {
      gridContainer.innerHTML = '<div style="text-align:center; color:var(--text-muted); margin-top: 40px; font-size: 14px;">暂无匹配的提示词</div>';
      return;
    }
    gridContainer.innerHTML = '<div id="library-grid"></div>';
    const grid = gridContainer.querySelector('#library-grid');
    filteredHistory.forEach(item => {
      const card = document.createElement('div');
      card.className = 'card glass';
      const d = item.data.zh || item.data;
      let keywords = '';
      if (typeof d === 'string') {
        keywords = d;
      } else if (typeof d === 'object' && d !== null) {
        keywords = Object.values(d).join('\\n');
      }
      
      card.innerHTML = \`<img src="\${item.url}">
                        <div style="display: flex; flex-direction: column; flex: 1; min-width: 0; justify-content: space-between;">
                          <div class="card-text" title="点击填入输入框">\${keywords}</div>
                          <div class="card-actions">
                            <button class="btn btn-secondary copy-btn" style="flex:1; padding: 8px 0; font-size: 13px; display: flex; justify-content: center; align-items: center; gap: 4px;" title="复制提示词">
                              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
                              复制
                            </button>
                            <button class="btn btn-secondary rewrite-btn" style="flex:1; padding: 8px 0; font-size: 13px; display: flex; justify-content: center; align-items: center; gap: 4px;" title="一键换装：自动清除提示词中的服装描述，并添加“穿着图中的服饰”">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>
                              换装
                            </button>
                            <button class="btn btn-secondary delete-btn" style="flex:0 0 32px; padding: 8px 0; color: #ef4444; background: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.2); display: flex; justify-content: center; align-items: center;" title="删除">
                              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                            </button>
                          </div>
                        </div>\`;
      
      card.querySelector('.delete-btn').onclick = (e) => {
        e.stopPropagation();
        chrome.storage.local.get(['promptHistory'], (res) => {
          const history = res.promptHistory || [];
          const newHistory = history.filter(h => h.id !== item.id);
          chrome.storage.local.set({ promptHistory: newHistory }, () => {
            renderLibrary(document.getElementById('library-search').value);
          });
        });
      };
      
      card.querySelector('.card-text').onclick = () => { 
        promptInput.value = keywords; 
        promptInput.dispatchEvent(new Event('input'));
      };
      
      card.querySelector('.copy-btn').onclick = (e) => {
        copyText(keywords, e.currentTarget);
      };
      
      card.querySelector('.rewrite-btn').onclick = (e) => {
        const btn = e.currentTarget;
        const oldHtml = btn.innerHTML;
        btn.innerHTML = '<span style="font-size:12px;">处理中...</span>';
        chrome.runtime.sendMessage({ action: 'rewritePrompt', prompt: keywords }, (response) => {
          if (response && response.data) {
            const newBtn = document.createElement('button');
            newBtn.className = 'btn btn-primary';
            newBtn.style.flex = '1';
            newBtn.title = '复制服装提示词';
            newBtn.style.padding = '8px 0';
            newBtn.style.fontSize = '13px';
            newBtn.style.display = 'flex';
            newBtn.style.justifyContent = 'center';
            newBtn.style.alignItems = 'center';
            newBtn.style.gap = '4px';
            newBtn.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg> 服装';
            newBtn.onclick = (ev) => {
              ev.stopPropagation();
              copyText(response.data, newBtn);
            };
            btn.parentNode.replaceChild(newBtn, btn);
          } else {
            alert('修改失败: ' + (response?.error || '未知错误'));
            btn.innerHTML = oldHtml;
          }
        });
      };
      
      grid.appendChild(card);
    });
  });
}

// Modal Logic
const modalOverlay = document.getElementById('modal-overlay');
const modalBody = document.getElementById('modal-body');
const closeModalBtn = document.getElementById('close-modal-btn');
const modalContent = document.getElementById('modal-content');

function openModal(viewId, isLarge = false) {
  const view = document.getElementById(viewId);
  if (view) {
    modalBody.innerHTML = '';
    view.style.display = viewId === 'library-view' ? 'flex' : 'block';
    modalBody.appendChild(view);
    
    if (isLarge) {
      modalContent.style.maxWidth = '800px';
      modalContent.style.height = '90vh';
    } else {
      modalContent.style.maxWidth = '400px';
      modalContent.style.height = 'auto';
    }
    
    modalOverlay.style.display = 'flex';
  }
}

function closeModal() {
  modalOverlay.style.display = 'none';
  const content = document.getElementById('content');
  const view = modalBody.firstElementChild;
  if (view) {
    view.style.display = 'none';
    content.appendChild(view);
  }
}

closeModalBtn.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

document.getElementById('open-settings-btn').addEventListener('click', () => openModal('settings-view', false));
document.getElementById('open-library-btn').addEventListener('click', () => {
  openModal('library-view', true);
  renderLibrary();
});

// Chat History Logic
const historyToggleBtn = document.getElementById('history-toggle-btn');
const historyDropdown = document.getElementById('history-dropdown');
const historyList = document.getElementById('history-list');
const newChatBtn = document.getElementById('new-chat-btn');

let currentChatId = null;

historyToggleBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  historyDropdown.style.display = historyDropdown.style.display === 'none' ? 'block' : 'none';
});

document.addEventListener('click', (e) => {
  if (!historyDropdown.contains(e.target) && e.target !== historyToggleBtn) {
    historyDropdown.style.display = 'none';
  }
});

function loadChatHistory() {
  chrome.storage.local.get(['chatSessions', 'activeChatId'], (res) => {
    const sessions = res.chatSessions || [{ id: 'default', name: '新对话', messages: [] }];
    currentChatId = res.activeChatId || sessions[0].id;
    
    if (!sessions.find(s => s.id === currentChatId)) {
      currentChatId = sessions[0].id;
    }
    
    historyList.innerHTML = '';
    sessions.forEach(s => {
      const item = document.createElement('div');
      item.style.padding = '10px 12px';
      item.style.borderRadius = '8px';
      item.style.cursor = 'pointer';
      item.style.marginBottom = '4px';
      item.style.display = 'flex';
      item.style.justifyContent = 'space-between';
      item.style.alignItems = 'center';
      item.style.fontSize = '13px';
      
      if (s.id === currentChatId) {
        item.style.background = 'rgba(0,0,0,0.05)';
        item.style.fontWeight = '500';
      }
      
      item.addEventListener('mouseover', () => {
        if (s.id !== currentChatId) item.style.background = 'rgba(0,0,0,0.02)';
      });
      item.addEventListener('mouseout', () => {
        if (s.id !== currentChatId) item.style.background = 'transparent';
      });
      
      const nameSpan = document.createElement('span');
      nameSpan.textContent = s.name;
      nameSpan.style.flex = '1';
      nameSpan.style.whiteSpace = 'nowrap';
      nameSpan.style.overflow = 'hidden';
      nameSpan.style.textOverflow = 'ellipsis';
      item.appendChild(nameSpan);
      
      item.addEventListener('click', () => {
        currentChatId = s.id;
        chrome.storage.local.set({ activeChatId: currentChatId });
        loadChatHistory();
        renderChatMessages();
        historyDropdown.style.display = 'none';
      });
      
      const delBtn = document.createElement('button');
      delBtn.innerHTML = '<svg viewBox="0 0 24 24" style="width: 14px; height: 14px;"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>';
      delBtn.style.background = 'transparent';
      delBtn.style.border = 'none';
      delBtn.style.color = '#9ca3af';
      delBtn.style.cursor = 'pointer';
      delBtn.style.padding = '4px';
      delBtn.style.display = 'flex';
      delBtn.style.alignItems = 'center';
      delBtn.style.justifyContent = 'center';
      delBtn.style.borderRadius = '4px';
      
      delBtn.addEventListener('mouseover', () => { delBtn.style.color = '#ef4444'; delBtn.style.background = 'rgba(239, 68, 68, 0.1)'; });
      delBtn.addEventListener('mouseout', () => { delBtn.style.color = '#9ca3af'; delBtn.style.background = 'transparent'; });
      
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteChat(s.id);
      });
      item.appendChild(delBtn);
      
      historyList.appendChild(item);
    });
    
    renderChatMessages();
  });
}

function saveCurrentChat(messages) {
  chrome.storage.local.get(['chatSessions'], (res) => {
    let sessions = res.chatSessions || [{ id: 'default', name: '新对话', messages: [] }];
    const sessionIndex = sessions.findIndex(s => s.id === currentChatId);
    
    if (sessionIndex >= 0) {
      sessions[sessionIndex].messages = messages;
      if (sessions[sessionIndex].name.startsWith('新对话') && messages.length > 0) {
        const firstUserMsg = messages.find(m => m.isUser);
        if (firstUserMsg && firstUserMsg.text) {
          sessions[sessionIndex].name = firstUserMsg.text.substring(0, 15) + (firstUserMsg.text.length > 15 ? '...' : '');
        }
      }
    }
    
    chrome.storage.local.set({ chatSessions: sessions }, () => {
      // Only update UI if we renamed it
      if (sessionIndex >= 0 && !sessions[sessionIndex].name.startsWith('新对话')) {
        loadChatHistory();
      }
    });
  });
}

newChatBtn.addEventListener('click', () => {
  chrome.storage.local.get(['chatSessions'], (res) => {
    const sessions = res.chatSessions || [];
    const currentSession = sessions.find(s => s.id === currentChatId);
    if (currentSession && currentSession.messages.length === 0) {
      return; // Do not create if current is empty
    }
    
    document.getElementById('prompt-input').value = '';
    document.getElementById('image-preview-container').style.display = 'none';
    document.getElementById('image-preview').src = '';
    currentImageBase64 = null;
    
    const newId = 'chat_' + Date.now();
    const timeStr = new Date().toLocaleTimeString('zh-CN', { hour12: false });
    sessions.unshift({ id: newId, name: '新对话 ' + timeStr, messages: [] });
    currentChatId = newId;
    chrome.storage.local.set({ chatSessions: sessions, activeChatId: newId }, () => {
      loadChatHistory();
      renderChatMessages();
      historyDropdown.style.display = 'none';
    });
  });
});

function deleteChat(id) {
  chrome.storage.local.get(['chatSessions'], (res) => {
    let sessions = res.chatSessions || [];
    if (sessions.length <= 1) {
      sessions[0].messages = [];
      sessions[0].name = '新对话';
    } else {
      sessions = sessions.filter(s => s.id !== id);
      if (currentChatId === id) {
        currentChatId = sessions[0].id;
      }
    }
    chrome.storage.local.set({ chatSessions: sessions, activeChatId: currentChatId }, () => {
      loadChatHistory();
    });
  });
}

function renderChatMessages() {
  chrome.storage.local.get(['chatSessions'], (res) => {
    const sessions = res.chatSessions || [];
    const session = sessions.find(s => s.id === currentChatId);
    
    chrome.runtime.sendMessage({ action: 'getTasks' }, (taskRes) => {
      chatMessages.innerHTML = '';
      
      const tasks = (taskRes && taskRes.tasks) ? taskRes.tasks.filter(t => (t.chatId || 'default') === currentChatId) : [];
      const messages = session && session.messages ? session.messages : [];
      
      const allItems = [];
      messages.forEach((m, idx) => {
        allItems.push({ type: 'message', data: m, time: m.timestamp || idx }); 
      });
      tasks.forEach(t => {
        allItems.push({ type: 'task', data: t, time: t.id });
      });
      
      allItems.sort((a, b) => a.time - b.time);
      
      allItems.forEach(item => {
        if (item.type === 'message') {
          const m = item.data;
          const msgDiv = document.createElement('div');
          msgDiv.className = 'msg ' + (m.isUser ? 'user' : 'ai');
          
          if (m.imgBase64) {
            const img = document.createElement('img');
            img.src = m.imgBase64;
            img.className = 'msg-img';
            msgDiv.appendChild(img);
          }
          
          if (m.text) {
            const textDiv = document.createElement('div');
            textDiv.className = 'msg-content';
            textDiv.textContent = m.text;
            msgDiv.appendChild(textDiv);
            
            const actions = document.createElement('div');
            actions.className = 'msg-actions';
            
            const quoteBtn = document.createElement('button');
            quoteBtn.className = 'msg-action-btn';
            quoteBtn.title = '引用';
            quoteBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/></svg>';
            quoteBtn.onclick = () => {
              setQuote(m.text);
            };
            actions.appendChild(quoteBtn);

            if (!m.isUser) {
              const copyBtn = document.createElement('button');
              copyBtn.className = 'msg-action-btn';
              copyBtn.title = '复制';
              copyBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>';
              copyBtn.onclick = () => {
                copyText(m.text, copyBtn);
              };
              actions.appendChild(copyBtn);
            }
            
            msgDiv.appendChild(actions);
          }
          
          chatMessages.appendChild(msgDiv);
        } else {
          const task = item.data;
          let taskEl = document.createElement('div');
          taskEl.id = 'task-' + task.id;
          taskEl.className = 'msg ai';
          taskEl.style.width = '100%';
          taskEl.style.maxWidth = '100%';
          chatMessages.appendChild(taskEl);
        }
      });
      
      chatMessages.scrollTop = chatMessages.scrollHeight;
      
      if (tasks.length > 0) {
        renderTasks(tasks);
      }
    });
  });
}

// Chat Logic
const chatMessages = document.getElementById('chat-messages');
let currentImageBase64 = null;

function addMessage(text, isUser, imageBase64 = null) {
  const msg = document.createElement('div');
  msg.className = \`msg \${isUser ? 'user' : 'ai'}\`;
  
  if (imageBase64) {
    const img = document.createElement('img');
    img.src = imageBase64;
    img.className = 'msg-img';
    msg.appendChild(img);
  }
  
  const content = document.createElement('div');
  content.className = 'msg-content';
  content.textContent = text;
  msg.appendChild(content);
  
  if (text) {
    const actions = document.createElement('div');
    actions.className = 'msg-actions';
    
    const quoteBtn = document.createElement('button');
    quoteBtn.className = 'msg-action-btn';
    quoteBtn.title = '引用';
    quoteBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/></svg>';
    quoteBtn.onclick = () => {
      setQuote(text);
    };
    actions.appendChild(quoteBtn);

    if (!isUser) {
      const copyBtn = document.createElement('button');
      copyBtn.className = 'msg-action-btn';
      copyBtn.title = '复制';
      copyBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>';
      copyBtn.onclick = () => {
        copyText(text, copyBtn);
      };
      actions.appendChild(copyBtn);
    }
    
    msg.appendChild(actions);
  }
  
  chatMessages.appendChild(msg);
  
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  chrome.storage.local.get(['chatSessions'], (res) => {
    const sessions = res.chatSessions || [{ id: 'default', name: '新对话', messages: [] }];
    const session = sessions.find(s => s.id === currentChatId);
    if (session) {
      session.messages.push({ text, isUser, imgBase64: imageBase64, timestamp: Date.now() });
      saveCurrentChat(session.messages);
    }
  });
}

loadChatHistory();

// Listen for background analysis completion and tasks
chrome.runtime.onMessage.addListener((req) => {
  if (req.action === 'analysisComplete') {
    renderLibrary();
  }
  if (req.action === 'tasksUpdated') {
    renderTasks(req.tasks);
  }
});

// Keep service worker alive while side panel is open
setInterval(() => {
  chrome.runtime.sendMessage({ action: 'ping' }).catch(() => {});
}, 10000);

function renderTasks(tasks) {
  // Remove tasks that don't belong to currentChatId
  Array.from(chatMessages.children).forEach(child => {
    if (child.id && child.id.startsWith('task-')) {
      const taskId = parseInt(child.id.replace('task-', ''));
      const task = tasks.find(t => t.id === taskId);
      const taskChatId = task ? (task.chatId || 'default') : null;
      if (!task || taskChatId !== currentChatId) {
        child.remove();
      }
    }
  });

  tasks.filter(t => (t.chatId || 'default') === currentChatId).forEach(task => {
    let taskEl = document.getElementById('task-' + task.id);
    if (!taskEl) {
      taskEl = document.createElement('div');
      taskEl.id = 'task-' + task.id;
      taskEl.className = 'msg ai';
      taskEl.style.width = '100%';
      taskEl.style.maxWidth = '100%';
      chatMessages.appendChild(taskEl);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    let statusIndicator = '';
    let contentHtml = '';
    let cancelBtnHtml = '';

    if (task.status === 'pending') {
      statusIndicator = '<span style="color:#fbbf24;">⏳ 排队中...</span>';
      cancelBtnHtml = \`<button class="btn btn-secondary cancel-task-btn" data-task-id="\${task.id}" style="font-size: 12px; padding: 4px 8px; color: #ef4444; border-color: #fca5a5; background: transparent;">⏹️ 终止</button>\`;
    } else if (task.status === 'processing') {
      statusIndicator = '<span style="color:#6366f1;">🔄 正在分析图片...</span>';
      cancelBtnHtml = \`<button class="btn btn-secondary cancel-task-btn" data-task-id="\${task.id}" style="font-size: 12px; padding: 4px 8px; color: #ef4444; border-color: #fca5a5; background: transparent;">⏹️ 终止</button>\`;
    } else if (task.status === 'error') {
      statusIndicator = '<span style="color:#ef4444;">❌ 分析失败</span>';
      contentHtml = \`<div style="font-size: 12px; color: #ef4444; background: #fef2f2; padding: 8px; border-radius: 6px; margin-top: 4px;">\${task.error}</div>\`;
    } else if (task.status === 'cancelled') {
      statusIndicator = '<span style="color:#6b7280;">⏹️ 已终止</span>';
    } else if (task.status === 'completed') {
      statusIndicator = '<span style="color:#10b981;">✅ 分析完成！</span>';
      const d = task.resultData.zh || task.resultData;
      let keywords = '';
      if (typeof d === 'string') {
        keywords = d;
      } else if (typeof d === 'object' && d !== null) {
        keywords = Object.values(d).join('\\n');
      }
      
      contentHtml = \`
        <div style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">提取的提示词：</div>
        <div style="margin-top: 4px; padding: 8px; background: rgba(255,255,255,0.5); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border-radius: 6px; color: var(--text-main); max-height: 100px; overflow-y: auto; white-space: pre-wrap; font-size: 12px; border: 1px solid var(--border-color); transition: var(--transition-liquid);">\${keywords}</div>
        <div style="display: flex; gap: 8px; margin-top: 8px;">
          <button class="btn btn-secondary copy-task-btn" data-text="\${encodeURIComponent(keywords)}" style="font-size: 12px; padding: 6px 12px; flex: 1;">📋 复制</button>
          <button class="btn btn-secondary rewrite-task-btn" data-text="\${encodeURIComponent(keywords)}" style="font-size: 12px; padding: 6px 12px; flex: 1;" title="一键换装：自动清除提示词中的服装描述，并添加“穿着图中的服饰”">👗 换装</button>
        </div>
      \`;
    }
    
    taskEl.innerHTML = \`
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div style="display: flex; gap: 12px; align-items: center;">
          <img src="\${task.dataUrl}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 6px; border: 1px solid var(--border-color);">
          <div style="flex: 1; min-width: 0;">
            <div style="font-weight: 600; margin-bottom: 2px; font-size: 13px;">图片分析任务 #\${task.id}</div>
            <div style="font-size: 12px; line-height: 1.5;">\${statusIndicator}</div>
          </div>
          \${cancelBtnHtml}
        </div>
        \${contentHtml ? \`<div style="display: flex; flex-direction: column;">\${contentHtml}</div>\` : ''}
      </div>
    \`;
  });
}

chatMessages.addEventListener('click', (e) => {
  if (e.target.closest('.cancel-task-btn')) {
    const taskId = parseInt(e.target.closest('.cancel-task-btn').dataset.taskId);
    chrome.runtime.sendMessage({ action: 'cancelTask', taskId });
  }
  if (e.target.closest('.copy-task-btn')) {
    const btn = e.target.closest('.copy-task-btn');
    const text = decodeURIComponent(btn.dataset.text);
    copyText(text, btn);
  }
  if (e.target.closest('.rewrite-task-btn')) {
    const btn = e.target.closest('.rewrite-task-btn');
    const text = decodeURIComponent(btn.dataset.text);
    const oldHtml = btn.innerHTML;
    btn.innerHTML = '处理中...';
    chrome.runtime.sendMessage({ action: 'rewritePrompt', prompt: text }, (response) => {
      if (response && response.data) {
        const newBtn = document.createElement('button');
        newBtn.className = 'btn btn-primary copy-task-btn';
        newBtn.dataset.text = encodeURIComponent(response.data);
        newBtn.style.fontSize = '12px';
        newBtn.style.padding = '6px 12px';
        newBtn.style.flex = '1';
        newBtn.innerHTML = '📋 服装提示词';
        btn.parentNode.replaceChild(newBtn, btn);
      } else {
        alert('修改失败: ' + (response?.error || '未知错误'));
        btn.innerHTML = oldHtml;
      }
    });
  }
});

// Request initial tasks
chrome.runtime.sendMessage({ action: 'getTasks' }, (res) => {
  if (res && res.tasks) renderTasks(res.tasks);
});

function sendChat() {
  const msg = promptInput.value.trim();
  if (!msg && !currentImageBase64 && !currentQuoteText) return;
  
  let displayMsg = msg;
  let fullMsg = msg;
  if (currentQuoteText) {
    fullMsg = \`> \${currentQuoteText}\\n\\n\${msg}\`;
  }
  
  addMessage(fullMsg, true, currentImageBase64);
  
  const payloadImage = currentImageBase64;
  
  promptInput.value = '';
  promptInput.style.height = 'auto';
  removeImage();
  removeQuote();
  
  const loadingId = 'loading-' + Date.now();
  const loadingMsg = document.createElement('div');
  loadingMsg.className = 'msg ai';
  loadingMsg.id = loadingId;
  loadingMsg.textContent = '思考中...';
  
  const firstTask = Array.from(chatMessages.children).find(c => c.id && c.id.startsWith('task-'));
  if (firstTask) {
    chatMessages.insertBefore(loadingMsg, firstTask);
  } else {
    chatMessages.appendChild(loadingMsg);
  }
  
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // Build context from current chat tasks
  chrome.runtime.sendMessage({ action: 'getTasks' }, (res) => {
    const tasks = res.tasks || [];
    const currentChatTasks = tasks.filter(t => t.chatId === currentChatId && t.status === 'completed');
    const recent = currentChatTasks.slice(-2).map(t => {
      const d = t.resultData.zh || t.resultData;
      if (typeof d === 'string') return d;
      if (typeof d === 'object' && d !== null) return Object.values(d).join('\\n');
      return '';
    }).join('\\n---\\n');
    
    const contextMsg = recent ? \`参考最近提取的提示词上下文：\\n\${recent}\\n\\n用户问题：\${fullMsg}\` : fullMsg;

    chrome.runtime.sendMessage({ action: 'chat', message: contextMsg, image: payloadImage ? payloadImage.split(',')[1] : null }, (response) => {
      const loadingEl = document.getElementById(loadingId);
      if (loadingEl) loadingEl.remove();
      
      if (response && response.data) {
        addMessage(response.data, false);
      } else if (response && response.error) {
        addMessage('错误: ' + response.error, false);
      }
    });
  });
}

promptInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendChat();
  }
});

document.getElementById('send-btn').addEventListener('click', sendChat);

document.getElementById('optimize-btn').addEventListener('click', () => {
  const original = promptInput.value;
  if (!original) return;
  
  promptInput.value = '正在智能优化...';
  chrome.runtime.sendMessage({ action: 'smartOptimize', prompt: original }, (response) => {
    if (response && response.data) {
      promptInput.value = response.data;
      promptInput.dispatchEvent(new Event('input'));
    } else {
      promptInput.value = original;
      alert(response?.error || '优化失败');
    }
  });
});

// Image Upload Logic
const fileUpload = document.getElementById('file-upload');
const uploadBtn = document.getElementById('upload-btn');
const imagePreviewContainer = document.getElementById('image-preview-container');
const imagePreview = document.getElementById('image-preview');
const removeImageBtn = document.getElementById('remove-image');

uploadBtn.addEventListener('click', () => {
  fileUpload.click();
});

fileUpload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      currentImageBase64 = event.target.result;
      imagePreview.src = currentImageBase64;
      imagePreviewContainer.style.display = 'block';
    };
    reader.readAsDataURL(file);
  }
});

function removeImage() {
  currentImageBase64 = null;
  imagePreview.src = '';
  imagePreviewContainer.style.display = 'none';
  fileUpload.value = '';
}

removeImageBtn.addEventListener('click', removeImage);

const searchInput = document.getElementById('library-search');
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    renderLibrary(e.target.value.trim());
  });
}

const exportCsvBtn = document.getElementById('export-csv-btn');
if (exportCsvBtn) {
  exportCsvBtn.addEventListener('click', () => {
    chrome.storage.local.get(['promptHistory'], (res) => {
      const history = res.promptHistory || [];
      if (history.length === 0) return alert('没有可导出的数据');
      
      let csvContent = "data:text/csv;charset=utf-8,\\uFEFF图片URL,提示词\\n";
      
      history.forEach(item => {
        const d = item.data.zh || item.data;
        let keywords = '';
        if (typeof d === 'string') {
          keywords = d;
        } else if (typeof d === 'object' && d !== null) {
          keywords = Object.values(d).join(' ');
        }
        
        // Escape quotes and wrap in quotes to handle commas and newlines
        const escapedKeywords = '"' + keywords.replace(/"/g, '""') + '"';
        const escapedUrl = '"' + item.url.replace(/"/g, '""') + '"';
        
        csvContent += \`\${escapedUrl},\${escapedKeywords}\\n\`;
      });
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "ai_prompts.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  });
}

renderLibrary();
`;