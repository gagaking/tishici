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
        const keywords = Object.entries(d).filter(([k,v]) => k.length > 0 && typeof v === 'string').map(([k,v]) => k + ': ' + v).join().toLowerCase();
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
          const keywords = Object.entries(d).filter(([k,v]) => k.length > 0 && typeof v === 'string').map(([k,v]) => k + ': ' + v).join();
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
            const text = Object.entries(d).filter(([k,v]) => k.length > 0 && typeof v === 'string').map(([k,v]) => k + ': ' + v).join();
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
            const originalPrompt = Object.entries(d).filter(([k,v]) => k.length > 0 && typeof v === 'string').map(([k,v]) => k + ': ' + v).join();
            
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

