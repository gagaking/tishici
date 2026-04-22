
let currentCard = null;
let hoverBtn = null;
let currentImg = null;

function getHoverBtn() {
  if (hoverBtn) return hoverBtn;
  hoverBtn = document.createElement('button');
  hoverBtn.className = 'ai-prompt-btn';
  hoverBtn.innerHTML = `AI 反推`;
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
  notification.innerHTML = `<span>✅</span> ${text}`;
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


