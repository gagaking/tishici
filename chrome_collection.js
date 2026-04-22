
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
          card.innerHTML = `
            <img src="${item.url}" class="card-img" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMxODE4MWIiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZmlsbD0iIzcxNzE3YSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPkltYWdlIFVuYXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg=='">
            <div class="card-content">
              <div class="time">${new Date(item.timestamp).toLocaleString()}</div>
              <div class="actions" style="display: flex; flex-wrap: wrap; gap: 8px;">
                ${hasModified ? `
                  <button class="btn btn-copy" data-id="${item.id}" style="flex: 1;">复制原提示词</button>
                  <button class="btn btn-copy-mod" data-id="${item.id}" style="flex: 1;">复制修改后</button>
                ` : `
                  <button class="btn btn-copy" data-id="${item.id}" style="flex: 1;">复制提示词</button>
                  <button class="btn btn-replace" data-id="${item.id}" style="flex: 1;">替换主体</button>
                `}
                <button class="btn btn-del" data-id="${item.id}" style="flex: 1 1 100%;">删除</button>
              </div>
            </div>
          `;
          grid.appendChild(card);
        });
      } else {
        grid.style.display = 'none';
        tableView.style.display = 'table';
        tableBody.innerHTML = '';
        historyData.forEach(item => {
          const d = item.data.zh || item.data;
          const keywords = Object.values(d).join(' ');
          const row = document.createElement('tr');
          row.innerHTML = `
            <td><img src="${item.url}" class="table-img"></td>
            <td>${keywords.substring(0, 100)}...</td>
          `;
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
            const text = Object.values(d).join(', ');
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
            const originalPrompt = Object.values(d).join(', ');
            
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
        const fullPrompt = [d.part1, d.part2, d.part3, d.part4, d.part5, d.part6, d.part7, d.part8, d.part9].filter(Boolean).join('\n');
        return [
          new Date(item.timestamp).toLocaleString(),
          item.url,
          `"${fullPrompt.replace(/"/g, '""')}"`
        ].join(',');
      });
      
      const csvContent = "\uFEFF" + [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `ai_prompts_export_${new Date().getTime()}.csv`);
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
