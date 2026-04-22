export const popupHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Gemini 配置</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; width: 320px; padding: 0; margin: 0; background: #09090b; color: #e4e4e7; overflow: hidden; }
    .container { padding: 24px; background: linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%); }
    .header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
    .header span { font-size: 24px; filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.3)); }
    h2 { margin: 0; font-size: 18px; color: #fff; font-weight: 800; tracking: -0.02em; }
    p { font-size: 13px; color: #a1a1aa; margin: 0 0 20px 0; line-height: 1.6; }
    .input-group { margin-bottom: 20px; }
    label { display: block; font-size: 12px; font-weight: 700; color: #71717a; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em; }
    input { width: 100%; padding: 12px 14px; box-sizing: border-box; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 13px; outline: none; transition: all 0.2s; background: rgba(255,255,255,0.03); color: #fff; }
    input:focus { border-color: #fbbf24; background: rgba(255,255,255,0.06); box-shadow: 0 0 0 4px rgba(251, 191, 36, 0.1); }
    button { width: 100%; padding: 12px; background: #fff; color: #000; border: none; border-radius: 12px; cursor: pointer; font-weight: 700; font-size: 14px; transition: all 0.2s; }
    button:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2); }
    .secondary-btn { background: rgba(255,255,255,0.05); color: #e4e4e7; margin-top: 12px; border: 1px solid rgba(255,255,255,0.1); }
    .secondary-btn:hover { background: rgba(255,255,255,0.1); box-shadow: none; }
    #status { margin-top: 16px; font-size: 13px; color: #34d399; display: none; text-align: center; font-weight: 600; background: rgba(52, 211, 153, 0.1); padding: 10px; border-radius: 10px; border: 1px solid rgba(52, 211, 153, 0.1); }
    .links { margin-top: 24px; display: flex; justify-content: center; gap: 16px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 20px; }
    .links a { color: #71717a; text-decoration: none; font-size: 12px; font-weight: 600; transition: color 0.2s; }
    .links a:hover { color: #fff; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span>🦆</span>
      <h2>Gemini 在线版配置</h2>
    </div>
    <p>请输入您的 Gemini API Key 以启用在线图片分析功能。</p>
    <div class="input-group">
      <label for="apiKey">Gemini API Key</label>
      <input type="password" id="apiKey" placeholder="输入您的 API Key...">
    </div>
    <button id="saveBtn">保存配置</button>
    <button id="historyBtn" class="secondary-btn">查看提示词收藏夹</button>
    <div id="status">配置已安全保存</div>
    <div class="links">
      <a href="https://aistudio.google.com/app/apikey" target="_blank">获取 API Key</a>
      <a href="https://github.com" target="_blank">使用帮助</a>
    </div>
  </div>
  <script src="popup.js"></script>
</body>
</html>
`;

export const popupJs = `
document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('apiKey');
  const saveBtn = document.getElementById('saveBtn');
  const status = document.getElementById('status');

  // Load existing key
  chrome.storage.local.get(['geminiApiKey'], (result) => {
    if (result.geminiApiKey) {
      apiKeyInput.value = result.geminiApiKey;
    }
  });

  // Save key
  saveBtn.addEventListener('click', () => {
    const key = apiKeyInput.value.trim();
    chrome.storage.local.set({ geminiApiKey: key }, () => {
      status.style.display = 'block';
      setTimeout(() => {
        status.style.display = 'none';
      }, 2000);
    });
  });

  // Open History
  document.getElementById('historyBtn').addEventListener('click', () => {
    chrome.tabs.create({ url: 'collection.html' });
  });
});
`;

