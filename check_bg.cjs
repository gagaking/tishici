import { backgroundJs } from './src/lib/extension/background.ts';
try {
  // Try parsing the string as JS to find syntax errors
  new Function(backgroundJs);
  console.log("No syntax errors found in backgroundJs string.");
} catch (e) {
  console.error("Syntax Error in backgroundJs:", e.message);
  // Optional: write wrapped code to a temp file to get exact line number
  const fs = require('fs');
  fs.writeFileSync('temp_bg.js', backgroundJs);
  console.log("Run 'node temp_bg.js' to see exact error line.");
}
