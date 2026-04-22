const fs = require('fs');
const file = 'src/lib/extension/sidepanel.ts';
let code = fs.readFileSync(file, 'utf8');

const badErrorBlock = \`    } else if (task.status === 'error') {
      statusIndicator = '<span style="color:#ef4444; display:flex; align-items:center; gap:4px;"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> 分析失败</span>';
      contentHtml = \\\`<div style="font-size: 12px; color: #ef4444; background: #fef2f2; padding: 8px; border-radius: 6px; margin-top: 4px;">\\\${task.error}</div>\\\`;
      cancelBtnHtml = \`<button class="btn btn-secondary delete-task-btn" data-task-id="\${task.id}" style="font-size: 12px; padding: 4px 8px; color: #9ca3af; border: none; background: transparent; display:flex; align-items:center; gap:4px; transition: color 0.2s;" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#9ca3af'" title="删除记录"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/></svg></button>\`;\`;

const goodErrorBlock = \`    } else if (task.status === 'error') {
      statusIndicator = '<span style="color:#ef4444; display:flex; align-items:center; gap:4px;"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> 分析失败</span>';
      contentHtml = \\\`<div style="font-size: 12px; color: #ef4444; background: #fef2f2; padding: 8px; border-radius: 6px; margin-top: 4px;">\\\${task.error}</div>\\\`;
      cancelBtnHtml = \\\`<button class="btn btn-secondary delete-task-btn" data-task-id="\\\${task.id}" style="font-size: 12px; padding: 4px 8px; color: #9ca3af; border: none; background: transparent; display:flex; align-items:center; gap:4px; transition: color 0.2s;" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#9ca3af'" title="删除记录"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/></svg></button>\\\`;\`;

const badCancelBlock = \`    } else if (task.status === 'cancelled') {
      statusIndicator = '<span style="color:#6b7280; display:flex; align-items:center; gap:4px;"><svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2" ry="2"/></svg> 已终止</span>';
      cancelBtnHtml = \`<button class="btn btn-secondary delete-task-btn" data-task-id="\${task.id}" style="font-size: 12px; padding: 4px 8px; color: #9ca3af; border: none; background: transparent; display:flex; align-items:center; gap:4px; transition: color 0.2s;" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#9ca3af'" title="删除记录"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/></svg></button>\`;\`;

const goodCancelBlock = \`    } else if (task.status === 'cancelled') {
      statusIndicator = '<span style="color:#6b7280; display:flex; align-items:center; gap:4px;"><svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2" ry="2"/></svg> 已终止</span>';
      cancelBtnHtml = \\\`<button class="btn btn-secondary delete-task-btn" data-task-id="\\\${task.id}" style="font-size: 12px; padding: 4px 8px; color: #9ca3af; border: none; background: transparent; display:flex; align-items:center; gap:4px; transition: color 0.2s;" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#9ca3af'" title="删除记录"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/></svg></button>\\\`;\`;

code = code.replace(badErrorBlock, goodErrorBlock);
code = code.replace(badCancelBlock, goodCancelBlock);

fs.writeFileSync(file, code);
console.log('Fixed syntax');
