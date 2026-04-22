const fs = require('fs');
let code = fs.readFileSync('src/lib/extension/sidepanel.ts', 'utf8');

let findStr = `      const modelBadge = task.model ? \`<span style="display:inline-block; margin-left: 6px; font-size: 10px; background: rgba(16, 185, 129, 0.1); color: #10b981; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(16, 185, 129, 0.2); font-weight: normal;">\${task.model}</span>\` : '';
      statusIndicator = \`<span style="color:#10b981; display:flex; align-items:center; gap:4px;"><svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg> 分析完成！\${modelBadge}</span>\`;
      cancelBtnHtml = \`<button class="btn btn-secondary delete-task-btn" data-task-id="\${task.id}" style="font-size: 12px; padding: 4px 8px; color: #9ca3af; border: none; background: transparent; display:flex; align-items:center; gap:4px; transition: color 0.2s;" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#9ca3af'" title="删除记录"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/></svg></button>\`;
      const d = task.resultData.zh || task.resultData;
      let keywords = '';
      if (typeof d === 'string') {
        keywords = d;
      } else if (typeof d === 'object' && d !== null) {
        keywords = Object.values(d).join('\\n');
      }
      
      contentHtml = \`
        <div style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">提取的提示词：</div>
        <div style="margin-top: 4px; padding: 8px; background: rgba(255,255,255,0.5); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border-radius: 6px; color: var(--text-main); max-height: 100px; overflow-y: auto; white-space: pre-wrap; font-size: 12px; border: 1px solid var(--border-color); transition: var(--transition-liquid);">\${keywords}</div>`;

let replaceStr = `      const modelBadge = task.model ? \`<span style="display:inline-block; margin-left: 6px; font-size: 10px; background: rgba(16, 185, 129, 0.1); color: #10b981; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(16, 185, 129, 0.2); font-weight: normal; max-width: 140px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;" title="\${task.model}">\${task.model}</span>\` : '';
      statusIndicator = \`<span style="color:#10b981; display:flex; align-items:center; gap:4px; flex-wrap: wrap;"><svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg> 分析完成！\${modelBadge}</span>\`;
      cancelBtnHtml = \`<button class="btn btn-secondary delete-task-btn" data-task-id="\${task.id}" style="font-size: 12px; padding: 4px 8px; color: #9ca3af; border: none; background: transparent; display:flex; align-items:center; gap:4px; transition: color 0.2s;" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#9ca3af'" title="删除记录"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/></svg></button>\`;
      const d = task.resultData.zh || task.resultData;
      let keywords = '';
      if (typeof d === 'string') {
        keywords = d;
      } else if (typeof d === 'object' && d !== null) {
        keywords = Object.values(d).join('\\n');
      }
      
      if (!keywords || !keywords.trim()) {
        keywords = '模型返回了空结果（可能是由于该模型不支持多模态视觉处理或发生内部错误，请在设置中切换模型并重试）';
      }
      
      contentHtml = \`
        <div style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">提取的提示词：</div>
        <div style="margin-top: 4px; padding: 8px; background: rgba(255,255,255,0.5); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border-radius: 6px; color: var(--text-main); max-height: 100px; overflow-y: auto; white-space: pre-wrap; font-size: 12px; border: 1px solid var(--border-color); transition: var(--transition-liquid);">\${keywords}</div>`;

if (!code.includes(findStr)) {
  console.log("NOT FOUND! DUMPING ACTUAL LINES AROUND 1584");
  console.log(code.substring(code.indexOf("task.status === 'completed'"), code.indexOf("task.status === 'completed'") + 2000));
} else {
  code = code.replace(findStr, replaceStr);
  fs.writeFileSync('src/lib/extension/sidepanel.ts', code);
  console.log("Replaced successfully for sidepanel");
}

let bgCode = fs.readFileSync('src/lib/extension/background.ts', 'utf8');

let findBgStr = `          } catch (err) {
            if (err.name === 'AbortError') { resolve({ error: '任务已取消' }); return; }
            if (!ollamaUrl) { resolve({ error: 'Gemini 请求失败: ' + err.message }); return; }
            console.error('Gemini vision failed, falling back to Ollama', err);
          }
        }

        if (!parsedData && ollamaUrl) {
          try {
            usedModel = 'Ollama (' + (ollamaModel || 'gemma4:e4b') + ')';`;

let repBgStr = `          } catch (err) {
            if (err.name === 'AbortError') { resolve({ error: '任务已取消' }); return; }
            if (!ollamaUrl) { resolve({ error: 'Gemini 请求失败: ' + err.message }); return; }
            console.error('Gemini vision failed, falling back to Ollama', err);
            usedModel = '⚠️Gemini失败，回退至: '; // mark error
          }
        }

        if (!parsedData && ollamaUrl) {
          try {
            let baseOllamaModel = 'Ollama (' + (ollamaModel || 'gemma4:e4b') + ')';
            usedModel = usedModel.includes('Gemini失败') ? usedModel + baseOllamaModel : baseOllamaModel;`;

if (!bgCode.includes(findBgStr)) {
  console.log("BG NOT FOUND!");
} else {
  bgCode = bgCode.replace(findBgStr, repBgStr);
  fs.writeFileSync('src/lib/extension/background.ts', bgCode);
  console.log("Replaced successfully for background");
}

let checkEmptyStr = `        if (parsedData === null || parsedData === undefined || (typeof parsedData === 'object' && Object.keys(parsedData).length === 0) || (typeof parsedData === 'object' && parsedData.zh && Object.keys(parsedData.zh).length === 0)) {
          resolve({ error: '模型返回了无效或空数据，请重试。' });
          return;
        }`;
// Empty strings are handled by UI now, so we actually can let it return empty string and UI shows the nice message.

