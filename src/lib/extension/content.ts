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

  hoverBtn.addEventListener('click', async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (currentImg) {
      try {
        const fetchRes = await fetch(currentImg.src, { mode: 'cors' });
        const blob = await fetchRes.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          enqueueScreenshot(reader.result);
        };
        reader.onerror = () => enqueueScreenshot(currentImg.src);
        reader.readAsDataURL(blob);
      } catch (e) {
        // Fallback to canvas
        try {
          const canvas = document.createElement('canvas');
          canvas.width = currentImg.naturalWidth || currentImg.width;
          canvas.height = currentImg.naturalHeight || currentImg.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(currentImg, 0, 0);
          enqueueScreenshot(canvas.toDataURL('image/jpeg', 0.8));
        } catch (err) {
          enqueueScreenshot(currentImg.src);
        }
      }
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

