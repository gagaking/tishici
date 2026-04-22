const fs = require('fs');

const file = 'src/lib/extension/sidepanel.ts';
let text = fs.readFileSync(file, 'utf8');

text = text.replace(
    /cancelBtnHtml = `(.*?)`;/g,
    'cancelBtnHtml = \\`$1\\`;'
);
text = text.replace(
    /data-task-id="\$\{task\.id\}"/g,
    'data-task-id="\\${task.id}"'
);

fs.writeFileSync(file, text);
console.log('Fixed');
