const fs = require('fs');
const file = 'src/lib/extension/sidepanel.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /cancelBtnHtml = \`<button class="btn btn-secondary delete-task-btn" data-task-id="\${task\.id}" style=/g,
  \`cancelBtnHtml = \\\`<button class="btn btn-secondary delete-task-btn" data-task-id="\\\${task.id}" style=\`
);

code = code.replace(
  /<\/button>\`;/g,
  \`</button>\\\`;\`
);

fs.writeFileSync(file, code);
console.log('Fixed sidepanel backticks');
