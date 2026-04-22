const fs = require('fs');
const file = 'src/lib/extension/sidepanel.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  `} else if (task.status === 'cancelled') {`,
  `  cancelBtnHtml = \`<button class="btn btn-secondary delete-task-btn" data-task-id="\${task.id}" style="font-size: 12px; padding: 4px 8px; color: #9ca3af; border: none; background: transparent; display:flex; align-items:center; gap:4px; transition: color 0.2s;" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#9ca3af'" title="删除记录"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/></svg></button>\`;\n    } else if (task.status === 'cancelled') {`
);

code = code.replace(
  `} else if (task.status === 'completed') {`,
  `  cancelBtnHtml = \`<button class="btn btn-secondary delete-task-btn" data-task-id="\${task.id}" style="font-size: 12px; padding: 4px 8px; color: #9ca3af; border: none; background: transparent; display:flex; align-items:center; gap:4px; transition: color 0.2s;" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#9ca3af'" title="删除记录"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/></svg></button>\`;\n    } else if (task.status === 'completed') {`
);

fs.writeFileSync(file, code);
console.log('Fixed sidepanel');
