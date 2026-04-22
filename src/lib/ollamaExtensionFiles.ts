export const manifestJson = `{
  "manifest_version": 3,
  "name": "AI 提示词提取器 (Ollama 离线版)",
  "version": "1.2",
  "description": "使用本地 Ollama 模型智能分析网页图片，一键反推高质量 AI 绘画提示词。无需联网，隐私安全。",
  "permissions": [
    "storage",
    "unlimitedStorage",
    "contextMenus",
    "activeTab",
    "scripting"
  ],
  "host_permissions": [
    "*://*/*",
    "http://localhost:11434/*",
    "http://127.0.0.1:11434/*"
  ],
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
    "ollama-trigger-screenshot": {
      "suggested_key": {
        "default": "Alt+W"
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
    "default_popup": "popup.html",
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
    0 0 20px rgba(34, 197, 94, 0.4);
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
    0 0 30px rgba(34, 197, 94, 0.6);
}

.ai-prompt-btn span {
  font-size: 16px;
  filter: drop-shadow(0 0 4px rgba(34, 197, 94, 0.3));
}

@keyframes ai-fade-in {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
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
  border: 2px solid #22c55e;
  background: rgba(34, 197, 94, 0.1);
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
  border: 1px solid rgba(34, 197, 94, 0.3);
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
    0 0 80px rgba(34, 197, 94, 0.15);
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
  background: radial-gradient(circle at 50% 0%, rgba(34, 197, 94, 0.15), transparent 50%),
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
  border-top-color: #22c55e;
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
let statusPanel = null;

function getStatusPanel() {
  if (statusPanel) return statusPanel;
  statusPanel = document.createElement('div');
  statusPanel.className = 'ai-status-panel hidden';
  
  statusPanel.addEventListener('click', (e) => {
    const cancelBtn = e.target.closest('.ai-cancel-task');
    if (cancelBtn) {
      const taskId = parseInt(cancelBtn.dataset.id);
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        const wasProcessing = task.status === 'processing';
        task.status = 'cancelled';
        if (wasProcessing) {
          chrome.runtime.sendMessage({ action: 'ollama-cancelAnalysis' });
          isProcessing = false;
          processQueue();
        }
        updateQueuePanel();
      }
    }
    const copyBtn = e.target.closest('.ai-copy-task');
    if (copyBtn) {
      const taskId = parseInt(copyBtn.dataset.id);
      const task = tasks.find(t => t.id === taskId);
      if (task && task.resultData) {
        const textToCopy = Object.keys(task.resultData)
          .filter(k => k.startsWith('part'))
          .map(k => task.resultData[k])
          .join(', ');
        navigator.clipboard.writeText(textToCopy).then(() => {
          showNotification('已复制提示词');
        });
      }
    }
  });

  document.body.appendChild(statusPanel);
  return statusPanel;
}

function getHoverBtn() {
  if (hoverBtn) return hoverBtn;
  hoverBtn = document.createElement('button');
  hoverBtn.className = 'ai-prompt-btn';
  hoverBtn.innerHTML = \`Ollama 提取\`;
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
    btn.style.left = (window.scrollX + rect.left + 12) + 'px'; // Top-left
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

let tasks = [];
let taskIdCounter = 0;
let isProcessing = false;

function enqueueScreenshot(croppedDataUrl) {
  const taskId = ++taskIdCounter;
  tasks.push({ id: taskId, dataUrl: croppedDataUrl, status: 'pending' });
  updateQueuePanel();
  processQueue();
}

function updateQueuePanel() {
  const panel = getStatusPanel();
  
  const allDone = tasks.length > 0 && tasks.every(t => ['completed', 'error', 'cancelled'].includes(t.status));
  
  let html = '<div style="display: flex; flex-direction: column; gap: 12px; width: 100%; min-width: 280px;">';
  html += '<div style="font-weight: bold; font-size: 13px; color: #a1a1aa; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px; display: flex; justify-content: space-between;"><span>分析任务列表</span></div>';
  
  tasks.forEach(t => {
    let statusIcon = '⏳';
    let statusText = '排队中';
    let color = '#a1a1aa';
    let actionHtml = '';
    
    if (t.status === 'pending' || t.status === 'processing') {
      actionHtml = \`<button class="ai-cancel-task" data-id="\${t.id}" style="background:rgba(239,68,68,0.2);border:1px solid rgba(239,68,68,0.3);color:#ef4444;cursor:pointer;padding:2px 8px;border-radius:4px;font-size:12px;margin-left:auto;transition:all 0.2s;">终止</button>\`;
    } else if (t.status === 'completed') {
      actionHtml = \`<button class="ai-copy-task" data-id="\${t.id}" style="background:rgba(52,211,153,0.2);border:1px solid rgba(52,211,153,0.3);color:#34d399;cursor:pointer;padding:2px 8px;border-radius:4px;font-size:12px;margin-left:auto;transition:all 0.2s;">复制</button>\`;
    }
    
    if (t.status === 'processing') {
      statusIcon = '<div class="ai-status-spinner" style="width: 14px; height: 14px; border-width: 2px;"></div>';
      statusText = '正在分析...';
      color = '#fbbf24';
    } else if (t.status === 'completed') {
      statusIcon = '✅';
      statusText = '已完成';
      color = '#34d399';
    } else if (t.status === 'error') {
      statusIcon = '❌';
      statusText = '失败';
      color = '#ef4444';
    } else if (t.status === 'cancelled') {
      statusIcon = '⏹️';
      statusText = '已终止';
      color = '#6b7280';
    }
    
    html += \`
      <div style="display: flex; align-items: center; gap: 12px; font-size: 13px; color: \${color};">
        <img src="\${t.dataUrl}" style="width: 32px; height: 32px; object-fit: cover; border-radius: 6px; border: 1px solid rgba(255,255,255,0.2);" />
        <span style="display: flex; align-items: center; justify-content: center; width: 16px;">\${statusIcon}</span>
        <span style="flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">任务 #\${t.id} - \${statusText}</span>
        \${actionHtml}
      </div>
    \`;
  });
  html += '</div>';
  
  panel.innerHTML = html;
  panel.classList.remove('hidden');
  
  if (allDone) {
    setTimeout(() => {
      if (tasks.every(t => ['completed', 'error', 'cancelled'].includes(t.status))) {
        panel.classList.add('hidden');
        setTimeout(() => { tasks = []; }, 300);
      }
    }, 5000);
  }
}

function processQueue() {
  if (isProcessing) return;
  const nextTask = tasks.find(t => t.status === 'pending');
  if (!nextTask) return;
  
  isProcessing = true;
  nextTask.status = 'processing';
  updateQueuePanel();
  
  chrome.runtime.sendMessage({ action: 'ollama-analyzeImage', src: nextTask.dataUrl, isSilent: true }, (response) => {
    if (nextTask.status === 'cancelled') return;
    
    if (response && response.error) {
      nextTask.status = 'error';
      nextTask.error = response.error;
    } else {
      nextTask.status = 'completed';
      nextTask.resultData = response.data;
    }
    isProcessing = false;
    updateQueuePanel();
    processQueue();
  });
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
        action: 'ollama-captureScreenshot'
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
  if (request.action === 'ollama-startScreenshot') {
    startScreenshot();
  }
});


`;

export const backgroundJs = `
let currentAbortController = null;

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'ollama-screenshot-extract',
    title: 'Ollama 截图提取提示词',
    contexts: ['all']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'ollama-screenshot-extract') {
    chrome.tabs.sendMessage(tab.id, { action: 'ollama-startScreenshot' });
  }
});

chrome.commands.onCommand.addListener((command) => {
  if (command === 'ollama-trigger-screenshot') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'ollama-startScreenshot' });
      }
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'ollama-captureScreenshot') {
    chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
      sendResponse({ dataUrl: dataUrl });
    });
    return true;
  }

  if (request.action === 'ollama-cancelAnalysis') {
    if (currentAbortController) {
      currentAbortController.abort();
      currentAbortController = null;
    }
    sendResponse({ status: 'cancelled' });
    return true;
  }

  if (request.action === 'ollama-analyzeImage') {
    if (!request.isSilent && currentAbortController) {
      currentAbortController.abort();
    }
    const controller = new AbortController();
    if (!request.isSilent) {
      currentAbortController = controller;
    }
    const signal = controller.signal;

    chrome.storage.local.get(['ollamaUrl', 'ollamaModel'], async (result) => {
      const ollamaUrl = result.ollamaUrl || 'http://localhost:11434';
      const ollamaModel = result.ollamaModel || 'qwen3.5:9b';

      try {
        let base64Image;
        
        if (request.src.startsWith('data:')) {
          base64Image = request.src.split(',')[1];
        } else {
          // Fetch the image to get base64
          const imgResponse = await fetch(request.src);
          const blob = await imgResponse.blob();
          
          const buffer = await blob.arrayBuffer();
          const bytes = new Uint8Array(buffer);
          let binary = '';
          for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          base64Image = btoa(binary);
        }

        // Resize image to prevent Ollama from getting stuck
        try {
          const res = await fetch('data:image/jpeg;base64,' + base64Image);
          const blob = await res.blob();
          const bitmap = await createImageBitmap(blob);
          let width = bitmap.width;
          let height = bitmap.height;
          const maxSize = 800; // max size 800px
          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = Math.round((height * maxSize) / width);
              width = maxSize;
            } else {
              width = Math.round((width * maxSize) / height);
              height = maxSize;
            }
            const canvas = new OffscreenCanvas(width, height);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(bitmap, 0, 0, width, height);
            const resizedBlob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.8 });
            const buffer = await resizedBlob.arrayBuffer();
            const bytes = new Uint8Array(buffer);
            let binary = '';
            for (let i = 0; i < bytes.byteLength; i++) {
              binary += String.fromCharCode(bytes[i]);
            }
            base64Image = btoa(binary);
          }
        } catch(e) {
          console.error('Image resize failed', e);
        }

        const prompt = \`
请深入分析这张图片，并根据以下 9 部分架构反推 AI 绘画提示词。
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
返回一个 JSON 对象，必须包含以下 9 个键（part1 到 part9），对应上述 9 个部分的内容：
{
  "part1": "风格与效果的详细描述...",
  "part2": "光影与机位的详细描述...",
  "part3": "主体与姿态的详细描述...",
  "part4": "主色与氛围的详细描述...",
  "part5": "背景与空间的详细描述...",
  "part6": "道具与互动的详细描述...",
  "part7": "动作与细节的详细描述...",
  "part8": "穿搭与风格的详细描述...",
  "part9": "特殊效果的详细描述..."
}

请确保内容丰富、具体，不要使用笼统的词汇。
\`;

        const apiResponse = await fetch(\`\${ollamaUrl}/api/generate\`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          signal: signal,
          body: JSON.stringify({
            model: ollamaModel,
            prompt: prompt,
            images: [base64Image],
            stream: false,
            keep_alive: '5m',
            options: {
              num_gpu: 99,
              num_ctx: 4096,
              num_predict: 2048
            }
          })
        });

        const data = await apiResponse.json();
        let rawText = data.response.trim();
        if (rawText.startsWith('\`\`\`json')) {
          rawText = rawText.replace(/\`\`\`json/gi, '').replace(/\`\`\`/g, '').trim();
        } else if (rawText.startsWith('\`\`\`')) {
          rawText = rawText.replace(/\`\`\`/g, '').trim();
        }
        const startIdx = rawText.indexOf('{');
        const endIdx = rawText.lastIndexOf('}');
        if (startIdx !== -1 && endIdx !== -1) {
          rawText = rawText.substring(startIdx, endIdx + 1);
        }
        
        let parsedData;
        try {
          parsedData = JSON.parse(rawText);
          if (parsedData && typeof parsedData === 'object' && Object.keys(parsedData).length === 0) {
            parsedData = rawText;
          }
        } catch (e) {
          parsedData = rawText;
        }

        // Validate it's not totally empty if object
        if (!parsedData || (typeof parsedData === 'object' && Object.keys(parsedData).length === 0)) {
           throw new Error('模型返回了空数据');
        }

        // Save to history
        chrome.storage.local.get(['promptHistory'], (res) => {
          const history = res.promptHistory || [];
          history.unshift({
            id: Date.now(),
            url: request.src,
            data: { zh: parsedData }, // Wrap in zh for compatibility with collection page
            timestamp: new Date().getTime()
          });
          // Keep last 100 items
          if (history.length > 100) history.pop();
          chrome.storage.local.set({ promptHistory: history });
        });

        if (request.isSilent) {
          sendResponse({ success: true });
        } else {
          sendResponse({ data: parsedData });
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          sendResponse({ error: '分析已终止' });
        } else {
          sendResponse({ error: '无法连接到 Ollama 服务，请确保服务已启动并设置了 OLLAMA_ORIGINS="*"' });
        }
      }
    });

    return true; // Keep message channel open
  }

  if (request.action === 'rewritePrompt') {
    chrome.storage.local.get(['ollamaUrl', 'ollamaModel'], async (result) => {
      const ollamaUrl = result.ollamaUrl || 'http://localhost:11434';
      const ollamaModel = result.ollamaModel || 'qwen3.5:9b';
      
      try {
        const response = await fetch(\`\${ollamaUrl}/api/generate\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: ollamaModel,
            prompt: \`请一键清除以下提示词中所有关于服装的描述（款式、颜色、形态等），并在提示词最前面增加“图中的模特穿着图中的服饰”。直接输出修改后的完整提示词，不要包含任何其他解释或多余的话。\\n\\n原始提示词：\\n\${request.prompt}\`,
            stream: false,
            keep_alive: '5m',
            options: { num_gpu: 99, num_predict: 1024 }
          })
        });
        
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        
        sendResponse({ data: data.response.trim() });
      } catch (error) {
        sendResponse({ error: error.message });
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
  <title>Ollama 离线版配置</title>
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
    .note { margin-top: 20px; font-size: 12px; color: #fbbf24; background: rgba(251, 191, 36, 0.05); padding: 14px; border-radius: 12px; border: 1px solid rgba(251, 191, 36, 0.1); line-height: 1.6; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span>🦆</span>
      <h2>Ollama 离线版配置</h2>
    </div>
    <p>请配置您的本地 Ollama 服务地址和多模态模型名称（如 qwen3.5:9b）。</p>
    <div class="input-group">
      <label for="ollamaUrl">Ollama 服务地址</label>
      <input type="text" id="ollamaUrl" placeholder="http://localhost:11434" value="http://localhost:11434">
    </div>
    <div class="input-group">
      <label for="ollamaModel">模型名称</label>
      <input type="text" id="ollamaModel" placeholder="qwen3.5:9b" value="qwen3.5:9b">
    </div>
    <button id="saveBtn">保存配置</button>
    <button id="historyBtn" class="secondary-btn">查看提示词收藏夹</button>
    <div id="status">配置已安全保存</div>
    <div class="note">
      <strong>注意：</strong><br>
      请确保启动 Ollama 时设置了环境变量 <code>OLLAMA_ORIGINS="*"</code>，否则插件将无法跨域访问本地服务。
    </div>
  </div>
  <script src="popup.js"></script>
</body>
</html>
`;

export const popupJs = `
document.addEventListener('DOMContentLoaded', () => {
  const ollamaUrlInput = document.getElementById('ollamaUrl');
  const ollamaModelInput = document.getElementById('ollamaModel');
  const saveBtn = document.getElementById('saveBtn');
  const status = document.getElementById('status');

  // Load existing config
  chrome.storage.local.get(['ollamaUrl', 'ollamaModel'], (result) => {
    if (result.ollamaUrl) ollamaUrlInput.value = result.ollamaUrl;
    if (result.ollamaModel) ollamaModelInput.value = result.ollamaModel;
  });

  // Save config
  saveBtn.addEventListener('click', () => {
    const url = ollamaUrlInput.value.trim();
    const model = ollamaModelInput.value.trim();
    chrome.storage.local.set({ ollamaUrl: url, ollamaModel: model }, () => {
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
