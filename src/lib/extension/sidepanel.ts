export const sidepanelHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>AI 副驾驶</title>
  <style>
    :root {
      --glass-bg: rgba(255,255,255,0.55);
      --glass-border: rgba(255,255,255,0.6);
      --glass-highlight: rgba(255,255,255,0.7);
      --glass-shadow: rgba(0,0,0,0.1);
      --accent-start: #7aa2ff;
      --accent-end: #9b7bff;
      
      --bg-base: #f5f7fb;
      --bg-surface: var(--glass-bg);
      --border-color: var(--glass-border);
      --border-light: var(--glass-highlight);
      --text-main: #111827;
      --text-muted: #6b7280;
      --accent-blue: var(--accent-start);
      --accent-purple: var(--accent-end);
      --accent-gradient: linear-gradient(135deg, var(--accent-start), var(--accent-end));
      --accent-glow: 0 4px 20px rgba(120,140,255,0.4);
      --accent-glow-strong: 0 8px 30px rgba(120,140,255,0.6);
      --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.04);
      --shadow-md: 0 10px 40px var(--glass-shadow), 0 0 30px rgba(120,140,255,0.25);
      --liquid-blur: blur(30px) saturate(140%);
      --transition-liquid: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
      --icon-color: #7A7A7A;
    }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
      height: 100vh; 
      display: flex; 
      flex-direction: column; 
      margin: 0; 
      background: radial-gradient(circle at 20% 20%, rgba(120,140,255,0.08), transparent 40%), #f5f7fb;
      background-attachment: fixed;
      color: var(--text-main); 
    }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(120,140,255,0.4); border-radius: 10px; transition: var(--transition-liquid); }
    ::-webkit-scrollbar-thumb:hover { background: rgba(120,140,255,0.6); box-shadow: var(--accent-glow); }
    
    .glass { 
      background: var(--bg-surface); 
      border: 1px solid var(--border-color); 
      backdrop-filter: var(--liquid-blur);
      -webkit-backdrop-filter: var(--liquid-blur);
    }
    #nav { 
      display: flex; 
      padding: 0 16px;
      border-bottom: 1px solid var(--border-color);
      background: var(--bg-surface);
      backdrop-filter: var(--liquid-blur);
      -webkit-backdrop-filter: var(--liquid-blur);
      z-index: 10;
    }
    .tab { 
      padding: 6px; 
      cursor: pointer; 
      color: var(--text-muted);
      border-radius: 6px;
      transition: var(--transition-liquid);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .tab:hover { background: rgba(255,255,255,0.8); color: var(--accent-blue); box-shadow: var(--accent-glow); }
    .tab.active { 
      color: var(--accent-blue); 
      background: rgba(106, 168, 255, 0.05);
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.8);
    }
    #content { 
      flex: 1; 
      overflow-y: auto; 
      padding: 24px; 
      padding-bottom: 180px;
    }
    .view { display: none; min-height: 100%; flex-direction: column; }
    .view.active { display: flex; animation: fadeIn 0.3s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulse-text { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
    @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    
    /* Settings View */
    .settings-group { margin-bottom: 20px; padding: 16px; border-radius: 12px; box-shadow: var(--shadow-sm); background: var(--bg-surface); backdrop-filter: var(--liquid-blur); -webkit-backdrop-filter: var(--liquid-blur); border: 1px solid var(--border-color); }
    .settings-group label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px; color: var(--text-main); }
    .settings-group input { width: 100%; padding: 14px; border: 1px solid rgba(255,255,255,0.5); border-radius: 16px; box-sizing: border-box; font-size: 14px; outline: none; transition: var(--transition-liquid); background: rgba(255,255,255,0.4); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); color: var(--text-main); }
    .settings-group input:focus { box-shadow: 0 0 20px rgba(120,140,255,0.4); }
    
    /* Library View */
    .library-header { display: flex; gap: 8px; margin-bottom: 16px; }
    #library-search { flex: 1; padding: 14px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.5); font-size: 13px; outline: none; background: rgba(255,255,255,0.4); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); transition: var(--transition-liquid); }
    #library-search:focus { box-shadow: 0 0 20px rgba(120,140,255,0.4); }
    #export-csv-btn { padding: 8px 12px; border-radius: 8px; background: var(--bg-surface); backdrop-filter: var(--liquid-blur); -webkit-backdrop-filter: var(--liquid-blur); border: 1px solid var(--border-color); cursor: pointer; color: var(--text-main); font-size: 13px; display: flex; align-items: center; gap: 6px; transition: var(--transition-liquid); }
    #export-csv-btn:hover { background: rgba(255,255,255,0.9); transform: scale(1.02); box-shadow: var(--accent-glow); border-color: rgba(106, 168, 255, 0.2); }
    
    #library-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
    .card { display: flex; flex-direction: column; gap: 8px; align-items: stretch; border-radius: 16px; padding: 8px; transition: var(--transition-liquid); position: relative; overflow: hidden; box-shadow: 0 10px 40px var(--glass-shadow), 0 0 30px rgba(120,140,255,0.25); background: var(--bg-surface); backdrop-filter: var(--liquid-blur); -webkit-backdrop-filter: var(--liquid-blur); border: 1px solid var(--border-color); }
    .card::before { content: ""; position: absolute; inset: 0; background: linear-gradient(120deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.25) 40%, rgba(255,255,255,0.05) 100%); pointer-events: none; border-radius: inherit; }
    .card:hover { transform: translateY(-2px) scale(1.01); box-shadow: 0 10px 40px var(--glass-shadow), 0 0 30px rgba(120,140,255,0.4); border-color: rgba(106, 168, 255, 0.2); }
    .card img { width: 100%; aspect-ratio: 3/4; object-fit: cover; border-radius: 10px; margin-bottom: 0; flex-shrink: 0; transition: var(--transition-liquid); }
    .card img:hover { transform: scale(1.05); box-shadow: 0 0 15px rgba(106, 168, 255, 0.4); }
    .card-text { font-size: 12px; color: var(--text-main); display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.4; cursor: pointer; margin-bottom: 8px; }
    .card-actions { display: flex; gap: 6px; margin-top: auto; align-items: center; }
    .card-actions .icon-btn { flex: 1; background: rgba(255,255,255,0.4); border-radius: 6px; padding: 4px; display: flex; align-items: center; justify-content: center; box-shadow: inset 0 1px 0 rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.02); transition: var(--transition-liquid); }
    .card-actions .icon-btn:hover { background: rgba(255,255,255,0.9); color: var(--accent-blue); transform: scale(1.02); box-shadow: var(--accent-glow), inset 0 1px 0 rgba(255,255,255,1); border-color: rgba(106, 168, 255, 0.2); }
    
    /* Chat View */
    #chat-messages { display: flex; flex-direction: column; gap: 16px; padding-bottom: 20px; }
    .msg { padding: 12px 16px; border-radius: 18px; font-size: 14px; line-height: 1.6; position: relative; max-width: 85%; word-break: break-word; box-sizing: border-box; transition: var(--transition-liquid); backdrop-filter: var(--liquid-blur); -webkit-backdrop-filter: var(--liquid-blur); }
    .msg::before { content: ""; position: absolute; inset: 0; background: linear-gradient(120deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.25) 40%, rgba(255,255,255,0.05) 100%); pointer-events: none; border-radius: inherit; }
    .msg:hover { box-shadow: 0 10px 40px var(--glass-shadow), 0 0 30px rgba(120,140,255,0.25); border-color: rgba(106, 168, 255, 0.15); }
    .msg.user { align-self: flex-end; background: rgba(106, 168, 255, 0.1); color: var(--text-main); border: 1px solid rgba(106, 168, 255, 0.2); }
    .msg.ai { align-self: flex-start; background: var(--bg-surface); border: 1px solid var(--border-color); }
    .msg-content {
      max-height: calc(1.6em * 5);
      overflow-y: auto;
      padding-right: 4px;
    }
    .msg-actions { position: absolute; top: 8px; right: 8px; display: flex; gap: 4px; opacity: 0; transition: var(--transition-liquid); z-index: 2; }
    .msg:hover .msg-actions { opacity: 1; }
    .msg-action-btn { cursor: pointer; color: var(--icon-color); background: rgba(255, 255, 255, 0.6); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border: 1px solid var(--border-color); border-radius: 6px; padding: 4px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.05); transition: var(--transition-liquid); }
    .msg-action-btn:hover { color: var(--accent-blue); background: rgba(255, 255, 255, 0.95); box-shadow: var(--accent-glow); border-color: rgba(106, 168, 255, 0.2); transform: scale(1.05); }
    .msg-img { max-width: 100%; border-radius: 8px; margin-bottom: 8px; transition: var(--transition-liquid); cursor: pointer; }
    .msg-img:hover { transform: scale(1.02); box-shadow: 0 5px 15px rgba(106, 168, 255, 0.3); }
    .task-img-hover { transition: var(--transition-liquid); cursor: pointer; }
    .task-img-hover:hover { transform: scale(1.1); box-shadow: 0 0 15px rgba(106, 168, 255, 0.5); border-color: rgba(106, 168, 255, 0.5) !important; }
    
    /* Floating Action Bar */
    #action-bar-container {
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100%;
      padding: 16px;
      box-sizing: border-box;
      background: linear-gradient(to top, var(--bg-base) 80%, transparent);
      z-index: 20;
    }
    #action-bar { 
      background: var(--bg-surface);
      backdrop-filter: var(--liquid-blur);
      -webkit-backdrop-filter: var(--liquid-blur);
      border: 1px solid var(--border-color); 
      border-radius: 20px;
      box-shadow: 0 10px 40px var(--glass-shadow), 0 0 30px rgba(120,140,255,0.25), inset 0 1px 0 rgba(255,255,255,0.8);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: var(--transition-liquid);
      position: relative;
    }
    #action-bar::before {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(120deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.25) 40%, rgba(255,255,255,0.05) 100%);
      pointer-events: none;
    }
    #action-bar:focus-within {
      border-color: rgba(106, 168, 255, 0.3);
      box-shadow: var(--shadow-md), var(--accent-glow), inset 0 1px 0 rgba(255,255,255,0.8);
    }
    #image-preview-container {
      display: none;
      padding: 8px 12px 0;
      position: relative;
    }
    #image-preview {
      height: 60px;
      border-radius: 8px;
      object-fit: cover;
      border: 1px solid var(--border-color);
    }
    #remove-image {
      position: absolute;
      top: 4px;
      left: 60px;
      background: rgba(0,0,0,0.5);
      color: white;
      border: none;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
    }
    #prompt-input { 
      width: 100%; 
      padding: 14px; 
      border: 1px solid rgba(255,255,255,0.5); 
      border-radius: 16px;
      background: rgba(255,255,255,0.4); 
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      color: var(--text-main); 
      box-sizing: border-box; 
      font-family: inherit;
      resize: none;
      outline: none;
      line-height: 1.5;
      max-height: 120px;
      transition: var(--transition-liquid);
    }
    #prompt-input:focus {
      box-shadow: 0 0 20px rgba(120,140,255,0.4);
    }
    .action-bar-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      border-top: 1px solid var(--border-color);
    }
    .action-tools {
      display: flex;
      gap: 8px;
    }
    .icon-btn {
      background: rgba(255, 255, 255, 0.4);
      border: 1px solid var(--border-color);
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.02);
      color: var(--icon-color);
      transition: var(--transition-liquid);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      cursor: pointer;
      padding: 6px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .icon-btn svg { width: 16px; height: 16px; fill: currentColor; transition: var(--transition-liquid); }
    .icon-btn:hover {
      background: rgba(255, 255, 255, 0.9);
      color: var(--accent-blue);
      transform: scale(1.02);
      box-shadow: var(--accent-glow), inset 0 1px 0 rgba(255,255,255,1);
      border-color: rgba(106, 168, 255, 0.2);
    }
    .icon-btn:active {
      transform: scale(0.97);
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
    }
    .btn { 
      padding: 10px 16px; 
      border-radius: 12px; 
      font-weight: 500; 
      font-size: 13px; 
      cursor: pointer; 
      transition: var(--transition-liquid); 
      border: 1px solid rgba(255, 255, 255, 0.3); 
      background: linear-gradient(145deg, rgba(255,255,255,0.7), rgba(255,255,255,0.3)); 
      backdrop-filter: var(--liquid-blur); 
      -webkit-backdrop-filter: var(--liquid-blur); 
      color: var(--text-main); 
      box-shadow: 0 4px 15px rgba(0,0,0,0.03), inset 0 1px 1px rgba(255,255,255,0.8); 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      gap: 6px; 
    }
    .btn:hover { 
      background: linear-gradient(145deg, rgba(240, 230, 255, 0.8), rgba(255, 255, 255, 0.4)); 
      transform: translateY(-1px) scale(1.02); 
      box-shadow: 0 6px 20px rgba(155, 123, 255, 0.2), inset 0 1px 1px rgba(255,255,255,1); 
      border-color: rgba(155, 123, 255, 0.4); 
      color: var(--accent-purple);
    }
    .btn:active { 
      transform: scale(0.97); 
      box-shadow: inset 0 2px 6px rgba(0,0,0,0.1); 
    }
    .btn-primary { 
      background: linear-gradient(135deg, var(--accent-start), var(--accent-end)); 
      color: white; 
      border: 1px solid rgba(255,255,255,0.2); 
      box-shadow: 0 4px 15px rgba(120,140,255,0.3), inset 0 1px 1px rgba(255,255,255,0.3); 
    }
    .btn-primary:hover { 
      background: linear-gradient(135deg, #8ba8ff, #a98bff); 
      box-shadow: 0 8px 25px rgba(120,140,255,0.5), inset 0 1px 1px rgba(255,255,255,0.4); 
      color: white; 
      border-color: rgba(255,255,255,0.4); 
    }
    .btn-glass-purple {
      background: linear-gradient(145deg, rgba(240, 230, 255, 0.65), rgba(155, 123, 255, 0.15));
      border: 1px solid rgba(155, 123, 255, 0.3);
      color: var(--accent-purple);
      box-shadow: 0 4px 15px rgba(155, 123, 255, 0.1), inset 0 1px 1px rgba(255,255,255,1);
    }
    .btn-glass-purple:hover {
      background: linear-gradient(145deg, rgba(230, 215, 255, 0.8), rgba(155, 123, 255, 0.25));
      box-shadow: 0 6px 20px rgba(155, 123, 255, 0.25), inset 0 1px 1px rgba(255, 255, 255, 1);
      border-color: rgba(155, 123, 255, 0.5);
      color: #7b52f2;
    }
    
    /* SVG Icons */
    svg { width: 16px; height: 16px; transition: var(--transition-liquid); }
    svg[stroke="currentColor"] { fill: none; }
    svg:not([fill="none"]):not([stroke]) { fill: currentColor; }
    
    /* Modal */
    #modal-overlay {
      display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
      background: rgba(0,0,0,0.2); z-index: 1000; align-items: center; justify-content: center;
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
    }
    #modal-content {
      background: var(--bg-surface); width: calc(100% - 32px); max-height: calc(100% - 32px); 
      border-radius: 20px; padding: 0; box-shadow: 0 10px 40px var(--glass-shadow), 0 0 30px rgba(120,140,255,0.25), 0 0 0 1px rgba(255,255,255,0.5) inset; position: relative;
      display: flex; flex-direction: column;
      backdrop-filter: var(--liquid-blur);
      -webkit-backdrop-filter: var(--liquid-blur);
      border: 1px solid var(--border-color);
      overflow: hidden;
    }
    #modal-body {
      overflow-y: auto;
      overflow-x: hidden;
      flex: 1;
      padding: 16px;
      /* Ensure sticky headers within modal work correctly relative to this scroll container */
      position: relative;
      display: flex;
      flex-direction: column;
    }
    #modal-content::before {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(120deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.25) 40%, rgba(255,255,255,0.05) 100%);
      pointer-events: none;
    }
    #close-modal-btn {
      position: absolute; top: 12px; right: 12px; background: rgba(0,0,0,0.05); border: none; 
      cursor: pointer; font-size: 20px; color: var(--text-muted); width: 28px; height: 28px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      transition: var(--transition-liquid); z-index: 400;
    }
    #close-modal-btn:hover { background: rgba(239, 68, 68, 0.8); color: #ffffff; transform: scale(1.05); }

    
    #history-dropdown {
      background: #ffffff;
      border: 1px solid var(--border-color);
      border-radius: 20px;
      box-shadow: 0 10px 40px var(--glass-shadow), 0 0 30px rgba(120,140,255,0.25), 0 0 0 1px rgba(255,255,255,0.5) inset;
      overflow: hidden;
      position: relative;
    }
    #history-dropdown::before {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(120deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.25) 40%, rgba(255,255,255,0.05) 100%);
      pointer-events: none;
    }
    .history-item { padding: 10px 12px; border-bottom: 1px solid var(--border-color); cursor: pointer; transition: var(--transition-liquid); font-size: 13px; }
    .history-item:hover { background: rgba(106, 168, 255, 0.05); box-shadow: inset 2px 0 0 var(--accent-blue); }
    
    /* Custom Dropdown */
    .custom-select-wrapper {
      position: relative;
      display: inline-block;
    }
    .custom-select {
      padding: 8px 12px;
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.5);
      font-size: 13px;
      font-weight: 500;
      background: rgba(255,255,255,0.4);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      color: var(--text-main);
      cursor: pointer;
      transition: var(--transition-liquid);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      user-select: none;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .custom-select:hover {
      background: rgba(255,255,255,0.6);
      box-shadow: 0 4px 12px rgba(120,140,255,0.15);
    }
    .custom-select::after {
      content: "";
      display: inline-block;
      width: 0;
      height: 0;
      border-left: 4px solid transparent;
      border-right: 4px solid transparent;
      border-top: 5px solid var(--text-muted);
      transition: transform 0.2s;
      flex-shrink: 0;
    }
    .custom-select.open::after {
      transform: rotate(180deg);
    }
    .custom-options {
      position: absolute;
      top: 100%;
      left: 0;
      min-width: 100%;
      margin-top: 6px;
      background: var(--bg-surface);
      backdrop-filter: var(--liquid-blur);
      -webkit-backdrop-filter: var(--liquid-blur);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      box-shadow: 0 10px 40px var(--glass-shadow), 0 0 30px rgba(120,140,255,0.25), 0 0 0 1px rgba(255,255,255,0.5) inset;
      overflow: hidden;
      z-index: 9999;
      display: none;
      flex-direction: column;
      max-height: 200px;
      overflow-y: auto;
    }
    .custom-options::before {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(120deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.25) 40%, rgba(255,255,255,0.05) 100%);
      pointer-events: none;
      z-index: -1;
    }
    .custom-options.open {
      display: flex;
    }
    .custom-option {
      padding: 10px 12px;
      font-size: 13px;
      color: var(--text-main);
      cursor: pointer;
      transition: var(--transition-liquid);
      border-bottom: 1px solid rgba(255,255,255,0.1);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .custom-option:last-child {
      border-bottom: none;
    }
    .custom-option:hover, .custom-option.selected {
      background: rgba(120,140,255,0.15);
      color: var(--accent-blue);
    }
  </style>
</head>
<body>
  <div id="nav" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 16px; border-bottom: 1px solid var(--border-color); background: var(--bg-surface); z-index: 10;">
    <div style="display: flex; gap: 8px; align-items: center; flex: 1;">
      <div class="custom-select-wrapper" id="top-template-wrapper" style="max-width: 140px;">
        <div class="custom-select" id="top-template-display" title="选择反推架构">默认结构</div>
        <div class="custom-options" id="top-template-options"></div>
        <select id="top-template-select" style="display: none;"></select>
      </div>
      
      <div style="position: relative;">
        <button class="icon-btn" id="history-toggle-btn" title="历史对话" style="padding: 6px;"><svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg></button>
        <div id="history-dropdown" style="display: none; position: absolute; top: 100%; left: -50px; margin-top: 8px; width: 240px; max-height: 300px; overflow-y: auto; z-index: 50; border-radius: 12px; background: #ffffff;">
          <div style="padding: 12px; border-bottom: 1px solid var(--border-color); font-weight: 600; font-size: 14px; position: sticky; top: 0; background: #ffffff; z-index: 2;">历史对话</div>
          <div id="history-list" style="padding: 8px;"></div>
        </div>
      </div>
      
      <button class="icon-btn" id="new-chat-btn" title="新建对话" style="padding: 6px;"><svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg></button>
    </div>
    <div style="display: flex; gap: 4px; align-items: center;">
      <div class="icon-btn" id="open-library-btn" title="灵感库"><svg viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg></div>
      <div class="icon-btn" id="open-downloader-btn" title="网页图片下载"><svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg></div>
      <div class="icon-btn" id="open-settings-btn" title="设置"><svg viewBox="0 0 24 24"><path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.06-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.73,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.06,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.49-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/></svg></div>
    </div>
  </div>
  
  <div id="content">
    <div id="chat-view" class="view active">
      <div id="chat-messages"></div>
    </div>

    <div id="library-view" style="display: none; flex-direction: column;">
      <div style="position: sticky; top: -16px; z-index: 300; margin: -16px -16px 12px -16px; padding: 16px 40px 12px 16px; background: rgba(245, 247, 251, 0.9); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255,255,255,0.6); box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
        <div style="display: flex; background: rgba(255,255,255,0.6); border-radius: 12px; padding: 4px; box-shadow: inset 0 1px 3px rgba(0,0,0,0.05); margin-bottom: 12px; flex-shrink: 0;">
          <button id="lib-tab-local" class="btn" style="flex: 1; padding: 6px 0; font-size: 13px; border-radius: 8px; background: var(--accent-blue); color: white; box-shadow: 0 2px 8px rgba(106,168,255,0.3); transition: var(--transition-liquid);">历史图库</button>
          <button id="lib-tab-online" class="btn" style="flex: 1; padding: 6px 0; font-size: 13px; border-radius: 8px; background: transparent; color: var(--text-muted); box-shadow: none; transition: var(--transition-liquid);">在线预设</button>
        </div>
        <div class="library-header" style="margin-bottom: 0; display: flex; align-items: center; gap: 8px;">
          <input type="text" id="library-search" placeholder="搜索提示词..." style="flex: 1;">
          <button id="export-csv-btn" title="导出CSV" style="background: white; border: 1px solid var(--border-color); cursor: pointer; color: var(--text-main); width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
            <svg viewBox="0 0 24 24" width="18" height="18"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
          </button>
        </div>
      </div>
      <div id="library-grid-container" style="padding: 0 6px 20px 6px; margin: 0 -10px;"></div>
    </div>
    
    <div id="downloader-view" style="display: none; flex-direction: column; position: relative; height: 100%; flex: 1;">
      <div style="position: sticky; top: -16px; z-index: 300; margin: -16px -16px 12px -16px; padding: 16px 40px 12px 16px; background: rgba(245, 247, 251, 0.9); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255,255,255,0.6); box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
        <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 12px; line-height: 1.4; word-break: break-all;">注：嗅探深层图片或视频需刷新目标网页，并重新打开本界面。</div>
        <div class="library-header" style="align-items: center; justify-content: flex-start; padding: 0; margin-left: 0; gap: 6px; flex-wrap: nowrap;">
          <button class="btn btn-secondary" id="dl-select-all" style="padding: 6px 8px; font-size:12px; height: 32px; display: flex; align-items: center; justify-content: center; box-sizing: border-box; flex-shrink: 0;">全选</button>
          <button class="btn btn-secondary" id="dl-invert-select" style="padding: 6px 8px; font-size:12px; height: 32px; display: flex; align-items: center; justify-content: center; box-sizing: border-box; flex-shrink: 0;">反选</button>
          
          <div class="custom-select-wrapper" id="dl-format-wrapper" style="width: 72px; height: 32px; position: relative; z-index: 200; flex-shrink: 0;">
            <div class="custom-select" id="dl-format-display" style="padding: 0 10px; height: 100%; display: flex; align-items: center; box-sizing: border-box;">全部</div>
            <div class="custom-options" id="dl-format-options">
               <div class="custom-option selected" data-value="all">全部</div>
               <div class="custom-option" data-value="jpg">JPG</div>
               <div class="custom-option" data-value="png">PNG</div>
               <div class="custom-option" data-value="mp4">视频</div>
               <div class="custom-option" data-value="other">其它</div>
            </div>
            <select id="dl-format-filter" style="display: none;">
              <option value="all">全部</option>
              <option value="jpg">JPG</option>
              <option value="png">PNG</option>
              <option value="mp4">视频</option>
              <option value="other">其它</option>
            </select>
          </div>

          <div class="custom-select-wrapper" id="dl-size-wrapper" style="width: 90px; height: 32px; position: relative; z-index: 190; flex-shrink: 0;">
            <div class="custom-select" id="dl-size-display" style="padding: 0 10px; height: 100%; display: flex; align-items: center; box-sizing: border-box;">任意尺寸</div>
            <div class="custom-options" id="dl-size-options">
               <div class="custom-option selected" data-value="0">任意尺寸</div>
               <div class="custom-option" data-value="200">≥ 200px</div>
               <div class="custom-option" data-value="500">≥ 500px</div>
               <div class="custom-option" data-value="1000">≥ 1000px</div>
            </div>
            <select id="dl-size-filter" style="display: none;">
              <option value="0">任意尺寸</option>
              <option value="200">≥ 200px</option>
              <option value="500">≥ 500px</option>
              <option value="1000">≥ 1000px</option>
            </select>
          </div>
        </div>
      </div>
      <div style="flex:1; overflow-y:visible; padding-bottom: 24px;">
         <div id="downloader-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 10px; padding: 0 6px; margin: 0 -10px;"></div>
      </div>
      <div style="position: sticky; bottom: -16px; left: 0; right: 0; background: rgba(245, 247, 251, 0.95); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-top: 1px solid rgba(255,255,255,0.8); padding: 16px 20px; z-index: 400; display:flex; justify-content: space-between; align-items:center; box-shadow: 0 -10px 20px rgba(245,247,251,0.8), 0 -4px 16px rgba(0,0,0,0.05); border-bottom-left-radius: 18px; border-bottom-right-radius: 18px; margin: auto -16px -16px -16px;">
        <div style="font-size:14px; font-weight: 500; color: var(--text-main);">已选: <span id="dl-selected-count">0</span> 项</div>
        <button class="btn btn-primary" id="dl-batch-btn" style="padding: 8px 32px; font-size:14px; box-shadow: 0 4px 12px rgba(106,168,255,0.4);">批量下载</button>
      </div>
    </div>
    
    <div id="settings-view" style="display: none;">
      <div class="settings-group">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <label style="margin: 0;">编辑预设模版</label>
          <div class="custom-select-wrapper" id="template-wrapper" style="width: 160px;">
            <div class="custom-select" id="template-display">默认结构</div>
            <div class="custom-options" id="template-options"></div>
            <select id="template-select" style="display: none;"></select>
          </div>
        </div>
        <div style="position: relative; margin-bottom: 8px;">
          <textarea id="template-content" rows="6" style="width: 100%; padding: 14px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.5); resize: none; font-family: inherit; font-size: 13px; background: rgba(255,255,255,0.4); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); outline: none; transition: var(--transition-liquid); color: var(--text-main); box-sizing: border-box;" placeholder="输入模版内容..."></textarea>
          <button id="expand-template-btn" class="icon-btn" style="position: absolute; bottom: 8px; right: 8px; padding: 4px; background: rgba(255,255,255,0.6);" title="展开/收起">
            <svg viewBox="0 0 24 24"><path d="M7 14l5 5 5-5zM7 10l5-5 5 5z"/></svg>
          </button>
        </div>
        <div style="display: flex; gap: 8px;">
          <input type="text" id="new-template-name" placeholder="模版名称" style="flex: 1; padding: 14px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.5); font-size: 13px; background: rgba(255,255,255,0.4); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); outline: none; transition: var(--transition-liquid); color: var(--text-main);">
          <button class="btn btn-primary" id="save-template-btn" style="padding: 8px 16px;">保存</button>
          <button class="btn btn-secondary" id="delete-template-btn" style="padding: 8px 16px; color: #ef4444;">删除</button>
        </div>
      </div>
      
      <div class="settings-group">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <label style="margin: 0;">Gemini API Key (云端)</label>
          <a href="https://aistudio.google.com/api-keys" target="_blank" style="font-size: 12px; color: #6AA8FF; text-decoration: none; display: flex; align-items: center; gap: 4px; transition: opacity 0.2s;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">
            获取 Key
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          </a>
        </div>
        <input type="password" id="gemini-key" placeholder="AIzaSy...">
      </div>
      <div class="settings-group">
        <label>Gemini 模型 (云端推理)</label>
        <div style="position: relative; display: flex; gap: 8px;">
          <input type="text" id="gemini-model" placeholder="gemini-3.1-flash-lite-preview" style="flex: 1;" autocomplete="off">
          <button id="toggle-gemini-models" class="btn btn-secondary" style="padding: 0 10px; font-size: 13px; white-space: nowrap;" title="选择模型">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg> 
          </button>
          <div id="gemini-models-list" style="display: none; position: absolute; bottom: 100%; left: 0; right: 0; background: rgba(255, 255, 255, 0.95); border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; z-index: 10; margin-bottom: 4px; box-shadow: 0 -4px 15px rgba(0,0,0,0.1); backdrop-filter: blur(10px);">
             <div class="gemini-model-option" style="padding: 8px 12px; font-size: 13px; cursor: pointer; border-bottom: 1px solid var(--border-color); color: var(--text-main);" data-value="gemini-3.1-flash-lite-preview">gemini-3.1-flash-lite-preview (推荐)</div>
             <div class="gemini-model-option" style="padding: 8px 12px; font-size: 13px; cursor: pointer; border-bottom: none; color: var(--text-main);" data-value="gemini-2.5-flash-lite">gemini-2.5-flash-lite</div>
          </div>
        </div>
        <div style="font-size: 11px; color: #888; margin-top: 4px;">可展开列表选择，或手动填入模型代号</div>
      </div>
      <div class="settings-group" id="ollama-url-container" style="display: none;">
        <label>Ollama URL (本地)</label>
        <input type="text" id="ollama-url" placeholder="http://127.0.0.1:11434">
      </div>
      <div class="settings-group">
        <label style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
          <span>Ollama 模型</span>
          <a href="#" id="toggle-ollama-url" style="font-size: 12px; color: #6AA8FF; text-decoration: none; font-weight: normal;">修改地址</a>
        </label>
        <div style="position: relative; display: flex; gap: 8px;">
          <input type="text" id="ollama-model" placeholder="qwen3.5:9b" style="flex: 1;">
          <button id="fetch-ollama-models" class="btn btn-secondary" style="padding: 0 12px; font-size: 13px; white-space: nowrap;">获取</button>
          <div id="ollama-models-list" style="display: none; position: absolute; bottom: 100%; left: 0; right: 0; background: rgba(255, 255, 255, 0.95); border: 1px solid var(--border-color); border-radius: 8px; max-height: 150px; overflow-y: auto; z-index: 10; margin-bottom: 4px; box-shadow: 0 -4px 15px rgba(0,0,0,0.1); backdrop-filter: blur(10px);"></div>
        </div>
      </div>
      <button class="btn btn-primary" id="save-settings-btn" style="width: 100%; padding: 10px;">保存配置</button>
      <div id="save-status" style="margin-top: 12px; font-size: 13px; color: #10b981; text-align: center; display: none;">保存成功！</div>
    </div>
  </div>

  <div id="modal-overlay">
    <div id="modal-content">
      <button id="close-modal-btn">&times;</button>
      <div id="modal-body"></div>
    </div>
  </div>

  <div id="action-bar-container">
    <div id="action-bar">
      <div id="image-preview-container">
        <img id="image-preview" src="" alt="Preview">
        <button id="remove-image">×</button>
      </div>
      <div id="quote-preview-container" style="display: none; padding: 8px 12px 0; position: relative;">
        <div id="quote-preview-text" style="background: rgba(106, 168, 255, 0.1); padding: 8px 12px; border-radius: 8px; font-size: 12px; color: var(--text-muted); border-left: 3px solid var(--accent-blue); max-height: 60px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; box-shadow: inset 0 1px 0 rgba(255,255,255,0.5);"></div>
        <button id="remove-quote" style="position: absolute; top: 4px; right: 8px; background: rgba(0,0,0,0.3); color: white; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 12px; backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); transition: var(--transition-liquid);">×</button>
      </div>
      <textarea id="prompt-input" rows="1" placeholder="发送消息..."></textarea>
      <div class="action-bar-bottom">
        <div class="action-tools">
          <input type="file" id="file-upload" accept="image/*" style="display: none;">
          <button class="icon-btn" id="upload-btn" title="上传图片">
            <svg viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
          </button>
          <button class="icon-btn" id="optimize-btn" title="智能优化">
            <svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 9h-2V7h-2v5H6v2h2v5h2v-5h2v-2z"/></svg>
          </button>
        </div>
        <button class="icon-btn" id="send-btn" style="color: var(--accent-blue);" title="发送">
          <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>
    </div>
  </div>
  <div id="image-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:9999; flex-direction:column; align-items:center; justify-content:center;">
    <div id="image-modal-prev" style="position:absolute; left:0; top:45%; transform:translateY(-50%); color:#fff; cursor:pointer; padding:20px; font-size: 32px; z-index: 10; transition: 0.2s;">&#10094;</div>
    <div id="image-modal-next" style="position:absolute; right:0; top:45%; transform:translateY(-50%); color:#fff; cursor:pointer; padding:20px; font-size: 32px; z-index: 10; transition: 0.2s;">&#10095;</div>
    
    <div style="position: relative; width: 100%; height: calc(100% - 160px); display: flex; align-items:center; justify-content:center; padding: 20px; box-sizing: border-box;">
      <img id="image-modal-img" style="max-width:100%; max-height:100%; object-fit:contain; border-radius:12px; box-shadow: 0 10px 40px rgba(0,0,0,0.5);" />
      <video id="image-modal-video" style="max-width:100%; max-height:100%; object-fit:contain; border-radius:12px; box-shadow: 0 10px 40px rgba(0,0,0,0.5); display:none;" controls autoplay loop playsinline></video>
    </div>

    <!-- Actions area at the bottom -->
    <div style="height: auto; width: 100%; display: flex; align-items: center; justify-content: center; gap: 20px; padding-bottom: 80px; margin-top: 20px; box-sizing: border-box;">
        <button id="image-modal-copy" class="btn btn-primary" style="padding: 12px 32px; border-radius: 9999px; font-size: 15px; display: flex; gap: 8px; align-items: center; background: #8b5cf6; box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4); border: none; color: white;">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> <span id="image-modal-copy-text">复制图片</span>
        </button>
        <button id="image-modal-close" class="btn btn-secondary" style="padding: 12px 32px; border-radius: 9999px; font-size: 15px; background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3); display: flex; gap: 8px; align-items: center; backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg> 关闭
        </button>
    </div>
  </div>
  <div id="toast-container" style="position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 10000; display: flex; flex-direction: column; gap: 10px; pointer-events: none;"></div>
  <script src="sidepanel.js"></script>
</body>
</html>
`;

export const sidepanelJs = `
function showToast(message, type = 'error') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  const bgColor = type === 'error' ? 'rgba(239, 68, 68, 0.95)' : 'rgba(16, 185, 129, 0.95)';
  toast.style.cssText = \`background: \${bgColor}; color: white; padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 500; box-shadow: 0 4px 12px rgba(0,0,0,0.15); backdrop-filter: blur(8px); opacity: 0; transform: translateY(-10px); transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);\`;
  toast.textContent = message;
  container.appendChild(toast);
  
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 3000);
}

const promptInput = document.getElementById('prompt-input');
let currentQuoteText = null;

const quotePreviewContainer = document.getElementById('quote-preview-container');
const quotePreviewText = document.getElementById('quote-preview-text');
const removeQuoteBtn = document.getElementById('remove-quote');

function setQuote(text) {
  currentQuoteText = text;
  quotePreviewText.textContent = text;
  quotePreviewContainer.style.display = 'block';
  promptInput.focus();
}

function removeQuote() {
  currentQuoteText = null;
  quotePreviewText.textContent = '';
  quotePreviewContainer.style.display = 'none';
}

removeQuoteBtn.addEventListener('click', removeQuote);

// Auto-resize textarea
promptInput.addEventListener('input', function() {
  this.style.height = 'auto';
  this.style.height = (this.scrollHeight) + 'px';
  if (this.value === '') {
    this.style.height = 'auto';
  }
});

// Settings Logic
const geminiKeyInput = document.getElementById('gemini-key');
const geminiModelInput = document.getElementById('gemini-model');
const ollamaUrlInput = document.getElementById('ollama-url');
const ollamaModelInput = document.getElementById('ollama-model');

chrome.storage.local.get(['geminiApiKey', 'geminiModel', 'ollamaUrl', 'ollamaModel'], (res) => {
  if (res.geminiApiKey) geminiKeyInput.value = res.geminiApiKey;
  if (res.geminiModel !== undefined) geminiModelInput.value = res.geminiModel;
  else geminiModelInput.value = 'gemini-3.1-flash-lite-preview';
  if (res.ollamaUrl) ollamaUrlInput.value = res.ollamaUrl;
  if (res.ollamaModel) ollamaModelInput.value = res.ollamaModel;
});

document.getElementById('toggle-ollama-url').addEventListener('click', (e) => {
  e.preventDefault();
  const container = document.getElementById('ollama-url-container');
  if (container.style.display === 'none') {
    container.style.display = 'block';
  } else {
    container.style.display = 'none';
  }
});

document.getElementById('fetch-ollama-models').addEventListener('click', async () => {
    const urlInput = ollamaUrlInput.value.trim() || 'http://127.0.0.1:11434';
    let formattedUrl = urlInput;
    if (!formattedUrl.startsWith('http')) formattedUrl = 'http://' + formattedUrl;
    
    const btn = document.getElementById('fetch-ollama-models');
    btn.textContent = '...';
    try {
        const res = await fetch(\`\${formattedUrl}/api/tags\`);
        const data = await res.json();
        const models = data.models || [];
        
        const listEl = document.getElementById('ollama-models-list');
        listEl.innerHTML = '';
        if (models.length === 0) {
            listEl.innerHTML = '<div style="padding: 8px; color: #666; font-size: 13px;">无可用模型</div>';
        } else {
            models.forEach(m => {
                const item = document.createElement('div');
                item.textContent = m.name;
                item.style.padding = '8px 12px';
                item.style.fontSize = '13px';
                item.style.cursor = 'pointer';
                item.style.borderBottom = '1px solid var(--border-color)';
                item.style.color = 'var(--text-main)';
                item.addEventListener('mouseenter', () => item.style.backgroundColor = 'rgba(0,0,0,0.05)');
                item.addEventListener('mouseleave', () => item.style.backgroundColor = 'transparent');
                item.addEventListener('click', () => {
                    ollamaModelInput.value = m.name;
                    listEl.style.display = 'none';
                });
                listEl.appendChild(item);
            });
        }
        listEl.style.display = 'block';
    } catch (err) {
        console.error(err);
        showToast('无法获取 Ollama 模型，请确保 Ollama 后台已启动并在配置中容许扩展跨域请求或检查 URL。', 'error');
    }
    btn.textContent = '获取';
});

document.getElementById('toggle-gemini-models').addEventListener('click', (e) => {
    e.preventDefault();
    const list = document.getElementById('gemini-models-list');
    list.style.display = list.style.display === 'none' ? 'block' : 'none';
});

document.querySelectorAll('.gemini-model-option').forEach(option => {
    option.addEventListener('mouseenter', () => option.style.backgroundColor = 'rgba(0,0,0,0.05)');
    option.addEventListener('mouseleave', () => option.style.backgroundColor = 'transparent');
    option.addEventListener('click', () => {
        document.getElementById('gemini-model').value = option.dataset.value;
        document.getElementById('gemini-models-list').style.display = 'none';
    });
});

document.addEventListener('click', (e) => {
    const ollamaList = document.getElementById('ollama-models-list');
    if (ollamaList && ollamaList.style.display === 'block') {
        if (!e.target.closest('#fetch-ollama-models') && !e.target.closest('#ollama-models-list')) {
            ollamaList.style.display = 'none';
        }
    }
    
    const geminiList = document.getElementById('gemini-models-list');
    if (geminiList && geminiList.style.display === 'block') {
        if (!e.target.closest('#toggle-gemini-models') && !e.target.closest('#gemini-models-list')) {
            geminiList.style.display = 'none';
        }
    }
});

document.getElementById('save-settings-btn').addEventListener('click', () => {
  chrome.storage.local.set({
    geminiApiKey: geminiKeyInput.value.trim(),
    geminiModel: geminiModelInput.value.trim() || 'gemini-3.1-flash-lite-preview',
    ollamaUrl: ollamaUrlInput.value.trim(),
    ollamaModel: ollamaModelInput.value.trim()
  }, () => {
    const status = document.getElementById('save-status');
    status.style.display = 'block';
    setTimeout(() => status.style.display = 'none', 2000);
  });
});

// Template Logic
const defaultTemplates = [
  { id: 'default-txt', name: '复杂/默认结构', content: \`作为一名专业的图像分析师，你的任务是客观、精确、极其详细地分析所提供的图像。你必须严格描述画面中实际存在的内容，禁止推断、想象或添加任何画面以外的元素。
核心原则:
绝对客观: 只描述你所看到的。
主体优先: 首先识别图像的核心主体。
精确量化: 对数量、位置、角度要尽可能精确。
反向解析为一段包含9大模块的 JSON 格式数据输出。

⚠️ 严格规则（必须遵守）：
你必须且只能返回一段合法的 JSON (json) 数据。不要输出多余的解释。
如果图片中不存在该信息则填空字符串 ""：
{
  "风格与效果": "风格、光影类型、整体视觉风格、后期色彩倾向",
  "光影与机位": "主光类型、光比、阴影特征、景别、机位角度、焦段、环境光反射、局部光效、主体与背景关系",
  "主体与姿态": "人物属性、表情、眼神、微动作、主体位置、头部、躯干、四肢姿态、脚部细节",
  "主色与氛围": "主色、副色、点缀色、整体氛围、渐变、环境反射",
  "背景与空间": "几何结构、比例、材质、光影互动、空间层次",
  "道具与互动": "道具类型、互动方式、手部细节、织物状态、占比关系",
  "动作与细节": "主体动作、手部状态、配饰、细微动态",
  "穿搭与风格": "上装、下装、鞋子、材质反光与褶皱、配色关系、整体统一性",
  "特殊效果": "特效类型、后期处理、材质表现精度"
}

开始解析图片并输出：\` },
  { id: 'simple-txt', name: '简单', content: \`你是一位顶级AI绘画提示词工程师（Midjourney / Stable Diffusion）。

任务：将我提供的图片，反向解析为“可直接用于生图的一行中文Prompt”。

⚠ 严格规则（必须遵守）：
- 只输出【最终Prompt】，不做任何解释
- 输出为【单行中文】，用逗号分隔关键词
- 不要分段
- 不要标题
- 不要解释性语言（如：this image shows / a photo of）
- 不要结构标签（如 Subject / Style 等）
- 保持专业、精简、可直接复制使用

⚙ Prompt内容必须包含：
[主体与动作],
[构图与机位],
[风格],
[光影],
[色彩],
[材质与细节],
[空间与背景],
[质量与渲染]

现在开始解析图片并输出：\` }
];

const topTemplateSelect = document.getElementById('top-template-select');
const templateSelect = document.getElementById('template-select');
const templateContent = document.getElementById('template-content');
const newTemplateName = document.getElementById('new-template-name');
const saveTemplateBtn = document.getElementById('save-template-btn');
const deleteTemplateBtn = document.getElementById('delete-template-btn');

function loadTemplates() {
  chrome.storage.local.get(['promptTemplates', 'activeTemplateId'], (res) => {
    let templates = res.promptTemplates || defaultTemplates;
    
    // Force update old templates
    if (templates.length === 1 && templates[0].id === 'default-txt' && templates[0].name === '默认结构') {
      templates = defaultTemplates;
      chrome.storage.local.set({ promptTemplates: templates });
    }
    
    const defaultIndex = templates.findIndex(t => t.id === 'default-txt');
    if (defaultIndex >= 0) {
       templates[defaultIndex] = defaultTemplates[0]; // refresh complex
       
       const simpleIndex = templates.findIndex(t => t.id === 'simple-txt');
       if (simpleIndex === -1) {
         templates.push(defaultTemplates[1]);
       } else {
         templates[simpleIndex] = defaultTemplates[1];
       }
       chrome.storage.local.set({ promptTemplates: templates });
    }

    const activeId = (res.activeTemplateId === 'default' ? 'default-txt' : res.activeTemplateId) || 'default-txt';
    
    if (topTemplateSelect) topTemplateSelect.innerHTML = '';
    if (templateSelect) templateSelect.innerHTML = '';
    
    const topOptionsContainer = document.getElementById('top-template-options');
    const templateOptionsContainer = document.getElementById('template-options');
    if (topOptionsContainer) topOptionsContainer.innerHTML = '';
    if (templateOptionsContainer) templateOptionsContainer.innerHTML = '';
    
    templates.forEach(t => {
      if (topTemplateSelect) {
        const opt1 = document.createElement('option');
        opt1.value = t.id;
        opt1.textContent = t.name;
        if (t.id === activeId) opt1.selected = true;
        topTemplateSelect.appendChild(opt1);
        
        if (topOptionsContainer) {
          const customOpt1 = document.createElement('div');
          customOpt1.className = 'custom-option' + (t.id === activeId ? ' selected' : '');
          customOpt1.textContent = t.name;
          customOpt1.dataset.value = t.id;
          customOpt1.addEventListener('click', () => {
            topTemplateSelect.value = t.id;
            topTemplateSelect.dispatchEvent(new Event('change'));
            document.getElementById('top-template-display').textContent = t.name;
            topOptionsContainer.classList.remove('open');
            document.getElementById('top-template-display').classList.remove('open');
            updateCustomOptionsSelection(topOptionsContainer, t.id);
          });
          topOptionsContainer.appendChild(customOpt1);
          if (t.id === activeId) {
            document.getElementById('top-template-display').textContent = t.name;
          }
        }
      }
      
      if (templateSelect) {
        const opt2 = document.createElement('option');
        opt2.value = t.id;
        opt2.textContent = t.name;
        if (t.id === activeId) opt2.selected = true;
        templateSelect.appendChild(opt2);
        
        if (templateOptionsContainer) {
          const customOpt2 = document.createElement('div');
          customOpt2.className = 'custom-option' + (t.id === activeId ? ' selected' : '');
          customOpt2.textContent = t.name;
          customOpt2.dataset.value = t.id;
          customOpt2.addEventListener('click', () => {
            templateSelect.value = t.id;
            templateSelect.dispatchEvent(new Event('change'));
            document.getElementById('template-display').textContent = t.name;
            templateOptionsContainer.classList.remove('open');
            document.getElementById('template-display').classList.remove('open');
            updateCustomOptionsSelection(templateOptionsContainer, t.id);
          });
          templateOptionsContainer.appendChild(customOpt2);
          if (t.id === activeId) {
            document.getElementById('template-display').textContent = t.name;
          }
        }
      }
    });
    
    const activeTpl = templates.find(t => t.id === activeId) || templates[0];
    if (templateContent) templateContent.value = activeTpl.content;
    if (newTemplateName) newTemplateName.value = activeTpl.name;
  });
}

function updateCustomOptionsSelection(container, value) {
  if (!container) return;
  const options = container.querySelectorAll('.custom-option');
  options.forEach(opt => {
    if (opt.dataset.value === value) {
      opt.classList.add('selected');
    } else {
      opt.classList.remove('selected');
    }
  });
}

function setupCustomDropdowns() {
  const topDisplay = document.getElementById('top-template-display');
  const topOptions = document.getElementById('top-template-options');
  if (topDisplay && topOptions) {
    topDisplay.addEventListener('click', (e) => {
      e.stopPropagation();
      topOptions.classList.toggle('open');
      topDisplay.classList.toggle('open');
    });
  }
  
  const templateDisplay = document.getElementById('template-display');
  const templateOptions = document.getElementById('template-options');
  if (templateDisplay && templateOptions) {
    templateDisplay.addEventListener('click', (e) => {
      e.stopPropagation();
      templateOptions.classList.toggle('open');
      templateDisplay.classList.toggle('open');
    });
  }
  
  document.addEventListener('click', () => {
    if (topOptions) topOptions.classList.remove('open');
    if (topDisplay) topDisplay.classList.remove('open');
    if (templateOptions) templateOptions.classList.remove('open');
    if (templateDisplay) templateDisplay.classList.remove('open');
  });
  
  const expandBtn = document.getElementById('expand-template-btn');
  const templateContent = document.getElementById('template-content');
  if (expandBtn && templateContent) {
    expandBtn.addEventListener('click', () => {
      if (templateContent.rows === 6) {
        templateContent.rows = 15;
      } else {
        templateContent.rows = 6;
      }
    });
  }
}
setupCustomDropdowns();

function switchTemplate(selectedId) {
  chrome.storage.local.set({ activeTemplateId: selectedId });
  chrome.storage.local.get(['promptTemplates'], (res) => {
    const templates = res.promptTemplates || defaultTemplates;
    const tpl = templates.find(t => t.id === selectedId);
    if (tpl) {
      if (templateContent) templateContent.value = tpl.content;
      if (newTemplateName) newTemplateName.value = tpl.name;
      if (topTemplateSelect) topTemplateSelect.value = selectedId;
      if (templateSelect) templateSelect.value = selectedId;
    }
  });
}

if (topTemplateSelect) topTemplateSelect.addEventListener('change', (e) => switchTemplate(e.target.value));
if (templateSelect) templateSelect.addEventListener('change', (e) => switchTemplate(e.target.value));

if (saveTemplateBtn) {
  saveTemplateBtn.addEventListener('click', () => {
    const name = newTemplateName.value.trim();
    const content = templateContent.value.trim();
    if (!name || !content) return showToast('名称和内容不能为空', 'error');
    
    chrome.storage.local.get(['promptTemplates', 'activeTemplateId'], (res) => {
      let templates = res.promptTemplates || defaultTemplates;
      let activeId = templateSelect.value;
      
      const existingIndex = templates.findIndex(t => t.id === activeId);
      if (existingIndex >= 0 && templates[existingIndex].name === name) {
        templates[existingIndex].content = content;
      } else {
        const newId = 'tpl_' + Date.now();
        templates.push({ id: newId, name, content });
        activeId = newId;
      }
      
      chrome.storage.local.set({ promptTemplates: templates, activeTemplateId: activeId }, () => {
        loadTemplates();
        const status = document.getElementById('save-status');
        if (status) {
          status.textContent = '模版已保存！';
          status.style.display = 'block';
          setTimeout(() => status.style.display = 'none', 2000);
        }
      });
    });
  });
}

if (deleteTemplateBtn) {
  deleteTemplateBtn.addEventListener('click', () => {
    const selectedId = templateSelect.value;
    if (selectedId === 'default-txt' || selectedId === 'default') return showToast('预设模版不可删除', 'error');
    
    chrome.storage.local.get(['promptTemplates'], (res) => {
      let templates = res.promptTemplates || defaultTemplates;
      templates = templates.filter(t => t.id !== selectedId);
      chrome.storage.local.set({ promptTemplates: templates, activeTemplateId: 'default-txt' }, () => {
        loadTemplates();
        const status = document.getElementById('save-status');
        if (status) {
          status.textContent = '模版已删除！';
          status.style.display = 'block';
          setTimeout(() => status.style.display = 'none', 2000);
        }
      });
    });
  });
}

loadTemplates();

// Copy Helper
function copyText(text, btn) {
  navigator.clipboard.writeText(text);
  const oldHtml = btn.innerHTML;
  btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';
  setTimeout(() => btn.innerHTML = oldHtml, 2000);
}

// Library Logic
let currentLibraryTab = 'local';
let onlinePresetsCache = null;

async function fetchOnlinePresets() {
  if (onlinePresetsCache) return onlinePresetsCache;
  try {
    const res = await fetch('https://docs.google.com/spreadsheets/d/1D8JmHT_ijrTqUY1uIV5WZdfpqfouQ68TlMHiAvusyyo/export?format=csv');
    const text = await res.text();
    // Basic CSV parsing
    const rows = text.split('\\n').map(row => {
      let isInsideQuotes = false;
      let cols = [];
      let currentString = "";
      for (let i = 0; i < row.length; i++) {
        if (row[i] === '"') {
          isInsideQuotes = !isInsideQuotes;
        } else if (row[i] === ',' && !isInsideQuotes) {
          cols.push(currentString);
          currentString = "";
        } else {
          currentString += row[i];
        }
      }
      cols.push(currentString);
      return cols.map(c => c.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
    });
    
    // Headers are in first row. Need columns: 标题描述, 图片预览, 完整提示词
    const headers = rows[0] || [];
    const titleIdx = headers.findIndex(h => h.includes('标题描述'));
    const imgIdx = headers.findIndex(h => h.includes('图片预览'));
    const promptIdx = headers.findIndex(h => h.includes('完整提示词'));
    
    if (titleIdx === -1 || imgIdx === -1 || promptIdx === -1) {
      console.warn("Could not find required columns in CSV");
      return [];
    }
    
    const presets = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length <= Math.max(titleIdx, imgIdx, promptIdx)) continue;
      if (!row[promptIdx]) continue; // skip empty prompts
      
      let imgUrl = row[imgIdx] || '';
      // Convert google drive link to thumbnail
      if (imgUrl.includes('drive.google.com/file/d/')) {
        const match = imgUrl.match(/\\/d\\/([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
          imgUrl = \`https://drive.google.com/thumbnail?id=\${match[1]}&sz=w300\`;
        }
      } else if (imgUrl.includes('id=')) {
        const match = imgUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
          imgUrl = \`https://drive.google.com/thumbnail?id=\${match[1]}&sz=w300\`;
        }
      }
      
      presets.push({
        id: 'online_' + i,
        title: row[titleIdx] || '',
        url: imgUrl,
        prompt: row[promptIdx]
      });
    }
    onlinePresetsCache = presets;
    return presets;
  } catch(e) {
    console.error("Failed to fetch online presets:", e);
    return [];
  }
}

async function renderLibrary(searchQuery = '') {
  const gridContainer = document.getElementById('library-grid-container');
  if (!gridContainer) return;
  
  let itemsToRender = [];
  
  if (currentLibraryTab === 'online') {
    gridContainer.innerHTML = '<div style="text-align:center; color:var(--text-muted); margin-top: 40px; font-size: 14px;"><div class="ai-status-spinner" style="display:inline-block; margin-right:8px; border-width: 2px;"></div>加载在线预设...</div>';
    const presets = await fetchOnlinePresets();
    
    itemsToRender = presets.map(p => ({
      id: p.id,
      url: p.url,
      displayTitle: p.title + "\\n" + p.prompt,
      promptText: p.prompt,
      isOnline: true
    }));
  } else {
    const res = await new Promise(r => chrome.storage.local.get(['promptHistory'], r));
    const history = res.promptHistory || [];
    itemsToRender = history.map(item => {
      const d = item.data?.zh || item.data;
      let keywords = '';
      if (typeof d === 'string') {
        keywords = d;
      } else if (typeof d === 'object' && d !== null) {
        keywords = Object.entries(d).filter(([k,v]) => k.length > 0 && typeof v === 'string').map(([k,v]) => k + ': ' + v).join();
      }
      return {
        id: item.id,
        url: item.url,
        displayTitle: keywords,
        promptText: keywords,
        isOnline: false
      };
    });
  }
  
  let filteredItems = itemsToRender;
  if (searchQuery) {
    const lowerQuery = searchQuery.toLowerCase();
    filteredItems = itemsToRender.filter(item => 
      item.displayTitle.toLowerCase().includes(lowerQuery)
    );
  }

  if (filteredItems.length === 0) {
    gridContainer.innerHTML = '<div style="text-align:center; color:var(--text-muted); margin-top: 40px; font-size: 14px;">暂无匹配的提示词</div>';
    return;
  }
  
  gridContainer.innerHTML = '<div id="library-grid"></div>';
  const grid = gridContainer.querySelector('#library-grid');
  
  filteredItems.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card glass';
    
    // Add missing img protocol if necessary
    let imgHtml = item.url ? \`<img src="\${item.url}" class="card-img" style="cursor: pointer;" title="填入提示词">\` : \`<div class="card-img" style="width: 100%; aspect-ratio: 3/4; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.05); color:var(--text-muted); cursor: pointer;" title="填入提示词">暂无图片</div>\`;
    
    let deleteBtnHtml = item.isOnline ? '' : \`<button class="btn delete-btn" style="flex:0 0 28px; padding: 0; display:flex; align-items:center; justify-content:center; color: #ef4444; background: rgba(239, 68, 68, 0.08); border-color: rgba(239, 68, 68, 0.2);" title="删除">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/></svg>
    </button>\`;
    
    card.innerHTML = \`\${imgHtml}
                      <div class="card-actions" style="margin-top: auto;">
                        <button class="btn btn-glass-purple copy-btn" style="flex:1; padding: 6px; font-size: 12px; white-space: nowrap;" title="复制提示词">复制</button>
                        <button class="btn btn-glass-purple rewrite-btn" style="flex:1; padding: 6px; font-size: 12px; white-space: nowrap;" title="换装：自动清除服装描述并添加穿着图中的服饰">换装</button>
                        \${deleteBtnHtml}
                      </div>\`;
    
    if (!item.isOnline) {
      card.querySelector('.delete-btn').onclick = (e) => {
        e.stopPropagation();
        chrome.storage.local.get(['promptHistory'], (res) => {
          const history = res.promptHistory || [];
          const newHistory = history.filter(h => h.id !== item.id);
          chrome.storage.local.set({ promptHistory: newHistory }, () => {
            renderLibrary(document.getElementById('library-search').value);
          });
        });
      };
    }
    
    card.querySelector('.card-img').onclick = () => { 
      promptInput.value = item.promptText; 
      promptInput.dispatchEvent(new Event('input'));
      closeModal();
    };
    
    card.querySelector('.copy-btn').onclick = (e) => {
      copyText(item.promptText, e.currentTarget);
    };
    
    card.querySelector('.rewrite-btn').onclick = (e) => {
      executeRewrite(item.promptText);
    };
    
    grid.appendChild(card);
  });
}

// Modal Logic
const modalOverlay = document.getElementById('modal-overlay');
const modalBody = document.getElementById('modal-body');
const closeModalBtn = document.getElementById('close-modal-btn');
const modalContent = document.getElementById('modal-content');

function openModal(viewId, isLarge = false) {
  const view = document.getElementById(viewId);
  if (view) {
    modalBody.innerHTML = '';
    view.style.display = (viewId === 'library-view' || viewId === 'downloader-view') ? 'flex' : 'block';
    modalBody.appendChild(view);
    
    if (isLarge) {
      modalContent.style.maxWidth = '800px';
      modalContent.style.height = '90vh';
    } else {
      modalContent.style.maxWidth = '400px';
      modalContent.style.height = 'auto';
    }
    
    modalOverlay.style.display = 'flex';
  }
}

function closeModal() {
  modalOverlay.style.display = 'none';
  const content = document.getElementById('content');
  const view = modalBody.firstElementChild;
  if (view) {
    view.style.display = 'none';
    content.appendChild(view);
  }
}

closeModalBtn.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

document.getElementById('open-settings-btn').addEventListener('click', () => openModal('settings-view', false));
document.getElementById('open-library-btn').addEventListener('click', () => {
  openModal('library-view', true);
  renderLibrary();
});

// Chat History Logic
const historyToggleBtn = document.getElementById('history-toggle-btn');
const historyDropdown = document.getElementById('history-dropdown');
const historyList = document.getElementById('history-list');
const newChatBtn = document.getElementById('new-chat-btn');

let currentChatId = null;

historyToggleBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  historyDropdown.style.display = historyDropdown.style.display === 'none' ? 'block' : 'none';
});

document.addEventListener('click', (e) => {
  if (!historyDropdown.contains(e.target) && e.target !== historyToggleBtn) {
    historyDropdown.style.display = 'none';
  }
});

function loadChatHistory() {
  chrome.storage.local.get(['chatSessions', 'activeChatId'], (res) => {
    const sessions = res.chatSessions || [{ id: 'default', name: '新对话', messages: [] }];
    currentChatId = res.activeChatId || sessions[0].id;
    
    if (!sessions.find(s => s.id === currentChatId)) {
      currentChatId = sessions[0].id;
    }
    
    historyList.innerHTML = '';
    sessions.forEach(s => {
      const item = document.createElement('div');
      item.style.padding = '10px 12px';
      item.style.borderRadius = '8px';
      item.style.cursor = 'pointer';
      item.style.marginBottom = '4px';
      item.style.display = 'flex';
      item.style.justifyContent = 'space-between';
      item.style.alignItems = 'center';
      item.style.fontSize = '13px';
      
      if (s.id === currentChatId) {
        item.style.background = 'rgba(0,0,0,0.05)';
        item.style.fontWeight = '500';
      }
      
      item.addEventListener('mouseover', () => {
        if (s.id !== currentChatId) item.style.background = 'rgba(0,0,0,0.02)';
      });
      item.addEventListener('mouseout', () => {
        if (s.id !== currentChatId) item.style.background = 'transparent';
      });
      
      const nameSpan = document.createElement('span');
      nameSpan.textContent = s.name;
      nameSpan.style.flex = '1';
      nameSpan.style.whiteSpace = 'nowrap';
      nameSpan.style.overflow = 'hidden';
      nameSpan.style.textOverflow = 'ellipsis';
      item.appendChild(nameSpan);
      
      item.addEventListener('click', () => {
        currentChatId = s.id;
        chrome.storage.local.set({ activeChatId: currentChatId });
        loadChatHistory();
        historyDropdown.style.display = 'none';
      });
      
      const delBtn = document.createElement('button');
      delBtn.innerHTML = '<svg viewBox="0 0 24 24" style="width: 14px; height: 14px;"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>';
      delBtn.style.background = 'transparent';
      delBtn.style.border = 'none';
      delBtn.style.color = '#9ca3af';
      delBtn.style.cursor = 'pointer';
      delBtn.style.padding = '4px';
      delBtn.style.display = 'flex';
      delBtn.style.alignItems = 'center';
      delBtn.style.justifyContent = 'center';
      delBtn.style.borderRadius = '4px';
      
      delBtn.addEventListener('mouseover', () => { delBtn.style.color = '#ef4444'; delBtn.style.background = 'rgba(239, 68, 68, 0.1)'; });
      delBtn.addEventListener('mouseout', () => { delBtn.style.color = '#9ca3af'; delBtn.style.background = 'transparent'; });
      
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteChat(s.id);
      });
      item.appendChild(delBtn);
      
      historyList.appendChild(item);
    });
    
    renderChatMessages();
  });
}

function saveCurrentChat(messages) {
  chrome.storage.local.get(['chatSessions'], (res) => {
    let sessions = res.chatSessions || [{ id: 'default', name: '新对话', messages: [] }];
    const sessionIndex = sessions.findIndex(s => s.id === currentChatId);
    
    if (sessionIndex >= 0) {
      sessions[sessionIndex].messages = messages;
      if (sessions[sessionIndex].name.startsWith('新对话') && messages.length > 0) {
        const firstUserMsg = messages.find(m => m.isUser);
        if (firstUserMsg && firstUserMsg.text) {
          sessions[sessionIndex].name = firstUserMsg.text.substring(0, 15) + (firstUserMsg.text.length > 15 ? '...' : '');
        }
      }
    }
    
    chrome.storage.local.set({ chatSessions: sessions }, () => {
      // Only update UI if we renamed it
      if (sessionIndex >= 0 && !sessions[sessionIndex].name.startsWith('新对话')) {
        loadChatHistory();
      }
    });
  });
}

newChatBtn.addEventListener('click', () => {
  chrome.storage.local.get(['chatSessions'], (res) => {
    const sessions = res.chatSessions || [];
    const currentSession = sessions.find(s => s.id === currentChatId);
    if (currentSession && currentSession.messages.length === 0) {
      return; // Do not create if current is empty
    }
    
    document.getElementById('prompt-input').value = '';
    document.getElementById('image-preview-container').style.display = 'none';
    document.getElementById('image-preview').src = '';
    currentImageBase64 = null;
    
    const newId = 'chat_' + Date.now();
    const timeStr = new Date().toLocaleTimeString('zh-CN', { hour12: false });
    sessions.unshift({ id: newId, name: '新对话 ' + timeStr, messages: [] });
    currentChatId = newId;
    chrome.storage.local.set({ chatSessions: sessions, activeChatId: newId }, () => {
      loadChatHistory();
      renderChatMessages();
      historyDropdown.style.display = 'none';
    });
  });
});

function deleteChat(id) {
  chrome.storage.local.get(['chatSessions'], (res) => {
    let sessions = res.chatSessions || [];
    if (sessions.length <= 1) {
      sessions[0].messages = [];
      sessions[0].name = '新对话';
    } else {
      sessions = sessions.filter(s => s.id !== id);
      if (currentChatId === id) {
        currentChatId = sessions[0].id;
      }
    }
    
    // Purge tasks belonging to the deleted chat
    chrome.runtime.sendMessage({ action: 'getTasks' }, (taskRes) => {
      if (taskRes && taskRes.tasks) {
        const remainingTasks = taskRes.tasks.filter(t => t.chatId !== id);
        chrome.storage.local.set({ tasks: remainingTasks });
      }
    });

    chrome.storage.local.set({ chatSessions: sessions, activeChatId: currentChatId }, () => {
      loadChatHistory();
    });
  });
}

function renderChatMessages() {
  chrome.storage.local.get(['chatSessions'], (res) => {
    const sessions = res.chatSessions || [];
    const session = sessions.find(s => s.id === currentChatId);
    
    chrome.runtime.sendMessage({ action: 'getTasks' }, (taskRes) => {
      chatMessages.innerHTML = '';
      
      const tasks = (taskRes && taskRes.tasks) ? taskRes.tasks.filter(t => (t.chatId || 'default') === currentChatId) : [];
      const messages = session && session.messages ? session.messages : [];
      
      const allItems = [];
      messages.forEach((m, idx) => {
        allItems.push({ type: 'message', data: m, time: m.timestamp || idx }); 
      });
      tasks.forEach(t => {
        allItems.push({ type: 'task', data: t, time: t.id });
      });
      
      allItems.sort((a, b) => a.time - b.time);
      
      allItems.forEach(item => {
        if (item.type === 'message') {
          const m = item.data;
          const msgDiv = document.createElement('div');
          msgDiv.className = 'msg ' + (m.isUser ? 'user' : 'ai');
          
          if (m.imgBase64) {
            const img = document.createElement('img');
            img.src = m.imgBase64;
            img.className = 'msg-img';
            msgDiv.appendChild(img);
          }
          
          if (m.text) {
            const textDiv = document.createElement('div');
            textDiv.className = 'msg-content';
            textDiv.textContent = m.text;
            msgDiv.appendChild(textDiv);
            
            const actions = document.createElement('div');
            actions.className = 'msg-actions';
            
            const quoteBtn = document.createElement('button');
            quoteBtn.className = 'msg-action-btn';
            quoteBtn.title = '引用';
            quoteBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/></svg>';
            quoteBtn.onclick = () => {
              setQuote(m.text);
            };
            actions.appendChild(quoteBtn);

            if (!m.isUser) {
              const copyBtn = document.createElement('button');
              copyBtn.className = 'msg-action-btn';
              copyBtn.title = '复制';
              copyBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>';
              copyBtn.onclick = () => {
                copyText(m.text, copyBtn);
              };
              actions.appendChild(copyBtn);
            }
            
            const delBtn = document.createElement('button');
            delBtn.className = 'msg-action-btn';
            delBtn.title = '删除记录';
            delBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>';
            delBtn.onclick = () => {
              chrome.storage.local.get(['chatSessions'], (res) => {
                const sessions = res.chatSessions || [];
                const session = sessions.find(s => s.id === currentChatId);
                if (session) {
                  const idx = session.messages.findIndex(msg => 
                    (m.timestamp && msg.timestamp === m.timestamp && msg.text === m.text) || 
                    (!m.timestamp && msg.text === m.text && msg.isUser === m.isUser)
                  );
                  if (idx > -1) {
                    session.messages.splice(idx, 1);
                    saveCurrentChat(session.messages);
                    msgDiv.remove();
                  }
                }
              });
            };
            actions.appendChild(delBtn);

            msgDiv.appendChild(actions);
          }
          
          chatMessages.appendChild(msgDiv);
        } else {
          const task = item.data;
          let taskEl = document.createElement('div');
          taskEl.id = 'task-' + task.id;
          taskEl.className = 'msg ai';
          taskEl.style.width = '100%';
          taskEl.style.maxWidth = '100%';
          chatMessages.appendChild(taskEl);
        }
      });
      
      document.getElementById('content').scrollTop = document.getElementById('content').scrollHeight;
      
      if (tasks.length > 0) {
        renderTasks(tasks);
      }
    });
  });
}

// Chat Logic
const chatMessages = document.getElementById('chat-messages');
let currentImageBase64 = null;

function addMessage(text, isUser, imageBase64 = null) {
  const timestamp = Date.now();
  const msg = document.createElement('div');
  msg.className = \`msg \${isUser ? 'user' : 'ai'}\`;
  
  if (imageBase64) {
    const img = document.createElement('img');
    img.src = imageBase64;
    img.className = 'msg-img';
    msg.appendChild(img);
  }
  
  const content = document.createElement('div');
  content.className = 'msg-content';
  content.textContent = text;
  msg.appendChild(content);
  
  if (text) {
    const actions = document.createElement('div');
    actions.className = 'msg-actions';
    
    const quoteBtn = document.createElement('button');
    quoteBtn.className = 'msg-action-btn';
    quoteBtn.title = '引用';
    quoteBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/></svg>';
    quoteBtn.onclick = () => {
      setQuote(text);
    };
    actions.appendChild(quoteBtn);

    if (!isUser) {
      const copyBtn = document.createElement('button');
      copyBtn.className = 'msg-action-btn';
      copyBtn.title = '复制';
      copyBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>';
      copyBtn.onclick = () => {
        copyText(text, copyBtn);
      };
      actions.appendChild(copyBtn);
    }
    
    const delBtn = document.createElement('button');
    delBtn.className = 'msg-action-btn';
    delBtn.title = '删除记录';
    delBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>';
    delBtn.onclick = () => {
      chrome.storage.local.get(['chatSessions'], (res) => {
        const sessions = res.chatSessions || [];
        const session = sessions.find(s => s.id === currentChatId);
        if (session) {
          let idx = session.messages.findIndex(m => m.timestamp === timestamp && m.text === text && m.isUser === isUser);
          if (idx === -1) {
            idx = session.messages.findLastIndex(m => m.text === text && m.isUser === isUser);
          }
          if (idx > -1) {
            session.messages.splice(idx, 1);
            saveCurrentChat(session.messages);
            msg.remove();
          }
        }
      });
    };
    actions.appendChild(delBtn);

    msg.appendChild(actions);
  }
  
  chatMessages.appendChild(msg);
  
  const scrollContent = document.getElementById('content');
  if (scrollContent) scrollContent.scrollTop = scrollContent.scrollHeight;
  
  chrome.storage.local.get(['chatSessions'], (res) => {
    const sessions = res.chatSessions || [{ id: 'default', name: '新对话', messages: [] }];
    const session = sessions.find(s => s.id === currentChatId);
    if (session) {
      session.messages.push({ text, isUser, imgBase64: imageBase64, timestamp });
      saveCurrentChat(session.messages);
    }
  });
}

loadChatHistory();

// Listen for background analysis completion and tasks
chrome.runtime.onMessage.addListener((req) => {
  if (req.action === 'analysisComplete') {
    renderLibrary();
  }
  if (req.action === 'tasksUpdated') {
    renderTasks(req.tasks);
  }
});

// Keep service worker alive while side panel is open
setInterval(() => {
  chrome.runtime.sendMessage({ action: 'ping' }).catch(() => {});
}, 10000);

function renderTasks(tasks) {
  // Remove tasks that don't belong to currentChatId
  Array.from(chatMessages.children).forEach(child => {
    if (child.id && child.id.startsWith('task-')) {
      const taskId = parseInt(child.id.replace('task-', ''));
      const task = tasks.find(t => t.id === taskId);
      const taskChatId = task ? (task.chatId || 'default') : null;
      if (!task || taskChatId !== currentChatId) {
        child.remove();
      }
    }
  });

  tasks.filter(t => (t.chatId || 'default') === currentChatId).forEach(task => {
    let taskEl = document.getElementById('task-' + task.id);
    if (!taskEl) {
      taskEl = document.createElement('div');
      taskEl.id = 'task-' + task.id;
      taskEl.className = 'msg ai';
      taskEl.style.width = '100%';
      taskEl.style.maxWidth = '100%';
      chatMessages.appendChild(taskEl);
      const c = document.getElementById('content');
      if (c) c.scrollTop = c.scrollHeight;
    }
    
    let statusIndicator = '';
    let contentHtml = '';
    let cancelBtnHtml = '';

    if (task.status === 'pending') {
      statusIndicator = '<span style="color:#fbbf24; display:flex; align-items:center; gap:4px; animation: pulse-text 2s infinite;"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> 排队中...</span>';
      cancelBtnHtml = \`<button class="btn btn-secondary cancel-task-btn" data-task-id="\${task.id}" style="font-size: 12px; padding: 4px 8px; color: #ef4444; border-color: #fca5a5; background: transparent; display:flex; align-items:center; gap:4px;"><svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2" ry="2"/></svg> 终止</button>\`;
    } else if (task.status === 'processing') {
      statusIndicator = '<span style="color:#6366f1; display:flex; align-items:center; gap:4px; animation: pulse-text 1.5s infinite;"><span style="display:flex; align-items:center; animation: spin-slow 2s linear infinite;"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></span> 正在分析图片...</span>';
      cancelBtnHtml = \`<button class="btn btn-secondary cancel-task-btn" data-task-id="\${task.id}" style="font-size: 12px; padding: 4px 8px; color: #ef4444; border-color: #fca5a5; background: transparent; display:flex; align-items:center; gap:4px;"><svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2" ry="2"/></svg> 终止</button>\`;
    } else if (task.status === 'error') {
      statusIndicator = '<span style="color:#ef4444; display:flex; align-items:center; gap:4px;"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> 分析失败</span>';
      contentHtml = \`<div style="font-size: 12px; color: #ef4444; background: #fef2f2; padding: 8px; border-radius: 6px; margin-top: 4px;">\${task.error}</div>\`;
      cancelBtnHtml = \`<button class="btn btn-secondary delete-task-btn" data-task-id="\${task.id}" style="font-size: 12px; padding: 4px 8px; color: #9ca3af; border: none; background: transparent; display:flex; align-items:center; gap:4px; transition: color 0.2s;" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#9ca3af'" title="删除记录"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/></svg></button>\`;
    } else if (task.status === 'cancelled') {
      statusIndicator = '<span style="color:#6b7280; display:flex; align-items:center; gap:4px;"><svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2" ry="2"/></svg> 已终止</span>';
      cancelBtnHtml = \`<button class="btn btn-secondary delete-task-btn" data-task-id="\${task.id}" style="font-size: 12px; padding: 4px 8px; color: #9ca3af; border: none; background: transparent; display:flex; align-items:center; gap:4px; transition: color 0.2s;" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#9ca3af'" title="删除记录"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/></svg></button>\`;
    } else if (task.status === 'completed') {
      let shortModel = task.model || '';
      if (shortModel.includes('Ollama (')) {
        shortModel = shortModel.replace('Ollama (', '').replace(')', '');
      } else if (shortModel.includes('Gemini')) {
        shortModel = 'Gemini';
      }
      if (shortModel.length > 12) {
        shortModel = shortModel.substring(0, 10) + '..';
      }
      const modelBadge = shortModel ? \`<span style="display:inline-flex; align-items:center; margin-left: 4px; font-size: 10px; background: rgba(16, 185, 129, 0.1); color: #10b981; padding: 1px 4px; border-radius: 4px; border: 1px solid rgba(16, 185, 129, 0.2); font-weight: normal; max-width: 80px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; height: 16px; line-height: 14px;" title="\${task.model}">\${shortModel}</span>\` : '';
      statusIndicator = \`<span style="color:#10b981; display:flex; align-items:center; gap:4px; flex-wrap: nowrap; overflow:hidden;"><svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style="flex-shrink:0;"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg> <span style="white-space:nowrap; flex-shrink:0;">分析完成！</span>\${modelBadge}</span>\`;
      cancelBtnHtml = \`<button class="btn btn-secondary delete-task-btn" data-task-id="\${task.id}" style="font-size: 12px; padding: 4px 8px; color: #9ca3af; border: none; background: transparent; display:flex; align-items:center; gap:4px; transition: color 0.2s;" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#9ca3af'" title="删除记录"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/></svg></button>\`;
      const d = task.resultData.zh || task.resultData;
      let keywords = '';
      if (typeof d === 'string') {
        keywords = d;
      } else if (typeof d === 'object' && d !== null) {
        keywords = Object.entries(d).filter(([k,v]) => k.length > 0 && typeof v === 'string').map(([k,v]) => k + ': ' + v).join();
      }
      
      if (!keywords || !keywords.trim()) {
        keywords = '模型未能提取有效信息。\\n\\n原因分析：该模型可能是纯文本大语言模型，缺乏「图像视觉(Vision)」测算能力。在复杂架构中"严格不臆造"的指令下，它选择了跳过所有内容。请尝试更换带有视觉能力的模型（如 qwen-vl, llava）！';
      }
      
      contentHtml = \`
        <div style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">提取的提示词：</div>
        <div style="margin-top: 4px; padding: 8px; background: rgba(255,255,255,0.5); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border-radius: 6px; color: var(--text-main); max-height: 100px; overflow-y: auto; white-space: pre-wrap; font-size: 12px; border: 1px solid var(--border-color); transition: var(--transition-liquid);">\${keywords}</div>
        <div style="display: flex; gap: 6px; margin-top: 8px;">
          <button class="btn btn-glass-purple copy-task-btn" data-text="\${encodeURIComponent(keywords)}" style="flex: 1; padding: 6px; font-size: 12px; white-space: nowrap;"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> 复制</button>
          <button class="btn btn-glass-purple quote-task-btn" data-text="\${encodeURIComponent(keywords)}" style="flex: 1; padding: 6px; font-size: 12px; white-space: nowrap;" title="引用到对话（用于联动）"><svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/></svg> 引用</button>
          <button class="btn btn-glass-purple rewrite-task-btn" data-text="\${encodeURIComponent(keywords)}" style="flex: 1; padding: 6px; font-size: 12px; white-space: nowrap;" title="一键换装：自动清除提示词中的服装描述，并添加“穿着图中的服饰”"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg> 换装</button>
        </div>
      \`;
    }
    
    taskEl.innerHTML = \`
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div style="display: flex; gap: 12px; align-items: center;">
          <img src="\${task.dataUrl}" class="task-img-hover" style="width: 40px; height: 40px; object-fit: cover; border-radius: 6px; border: 1px solid var(--border-color);">
          <div style="flex: 1; min-width: 0;">
            <div style="font-weight: 600; margin-bottom: 2px; font-size: 13px;">图片分析任务 #\${task.id}</div>
            <div style="font-size: 12px; line-height: 1.5;">\${statusIndicator}</div>
          </div>
          \${cancelBtnHtml}
        </div>
        \${contentHtml ? \`<div style="display: flex; flex-direction: column;">\${contentHtml}</div>\` : ''}
      </div>
    \`;
  });
}

function executeRewrite(text) {
  const instruction = \`请一键清除以下提示词中所有关于服装和鞋子的描述（款式、颜色、形态等），并在提示词最前面增加“图中的模特穿着图中的服饰和鞋子”。直接输出修改后的完整提示词，不要包含任何其他解释或多余的话。\\n\\n原始提示词：\\n\${text}\`;
  
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const chatTab = document.querySelector('.tab[data-target="chat-view"]');
  if (chatTab) chatTab.classList.add('active');
  const chatView = document.getElementById('chat-view');
  if (chatView) chatView.classList.add('active');
  
  const modalOverlay = document.getElementById('modal-overlay');
  if (modalOverlay) modalOverlay.style.display = 'none';

  addMessage(instruction, true);
  
  const loadingId = 'loading-' + Date.now();
  const loadingMsg = document.createElement('div');
  loadingMsg.className = 'msg ai';
  loadingMsg.id = loadingId;
  loadingMsg.innerHTML = '<div style="display:flex; align-items:center; gap:8px;"><span style="display:inline-block; animation:spin-slow 2s linear infinite;"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" opacity="0.3"/><path d="M12 2v3c3.86 0 7 3.14 7 7h3c0-5.52-4.48-10-10-10z"/></svg></span> 正在重写换装提示词...</div>';
  chatMessages.appendChild(loadingMsg);
  
  const content = document.getElementById('content');
  if (content) content.scrollTop = content.scrollHeight;

  chrome.runtime.sendMessage({ action: 'rewritePrompt', prompt: text }, (response) => {
    if (chrome.runtime.lastError) {
      const loadingEl = document.getElementById(loadingId);
      if (loadingEl) loadingEl.remove();
      addMessage('扩展后台服务已断开或超时，请重试', false);
      return;
    }
    const loadingEl = document.getElementById(loadingId);
    if (loadingEl) loadingEl.remove();
    
    if (response && response.data) {
      addMessage(response.data, false);
    } else if (response && response.error) {
      addMessage('错误: ' + response.error, false);
      showToast(response.error, 'error');
    }
  });
}

chatMessages.addEventListener('click', (e) => {
  if (e.target.closest('.cancel-task-btn')) {
    const taskId = parseInt(e.target.closest('.cancel-task-btn').dataset.taskId);
    chrome.runtime.sendMessage({ action: 'cancelTask', taskId });
  }
  if (e.target.closest('.delete-task-btn')) {
    const taskId = parseInt(e.target.closest('.delete-task-btn').dataset.taskId);
    chrome.runtime.sendMessage({ action: 'deleteTask', taskId });
  }
  if (e.target.closest('.copy-task-btn')) {
    const btn = e.target.closest('.copy-task-btn');
    const text = decodeURIComponent(btn.dataset.text);
    copyText(text, btn);
  }
  if (e.target.closest('.quote-task-btn')) {
    const btn = e.target.closest('.quote-task-btn');
    const text = decodeURIComponent(btn.dataset.text);
    setQuote(text);
  }
  if (e.target.closest('.rewrite-task-btn')) {
    const btn = e.target.closest('.rewrite-task-btn');
    const text = decodeURIComponent(btn.dataset.text);
    executeRewrite(text);
  }
});

// Setup drag and drop for chat view
const chatView = document.getElementById('chat-view');
chatView.addEventListener('dragover', (e) => {
    e.preventDefault();
    chatView.style.border = '2px dashed var(--brand-blue)';
    chatView.style.background = 'rgba(120, 140, 255, 0.1)';
});
chatView.addEventListener('dragleave', (e) => {
    e.preventDefault();
    chatView.style.border = 'none';
    chatView.style.background = 'transparent';
});
chatView.addEventListener('drop', (e) => {
    e.preventDefault();
    chatView.style.border = 'none';
    chatView.style.background = 'transparent';
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
            currentImageBase64 = event.target.result;
            imagePreview.src = currentImageBase64;
            imagePreviewContainer.style.display = 'block';
            promptInput.placeholder = '图片已加载，您可以直接发送分析任务';
            
            // Generate a formal enqueueTask rather than a loose Chat message
            chrome.runtime.sendMessage({ action: 'enqueueTask', dataUrl: currentImageBase64 }, (response) => {
                if (response && response.success) {
                    removeImage();
                    setTimeout(() => { 
                      const c = document.getElementById('content');
                      if (c) c.scrollTop = c.scrollHeight; 
                    }, 100);
                }
            });
        };
        reader.readAsDataURL(file);
    }
});

function sendChat() {
  const msg = promptInput.value.trim();
  if (!msg && !currentImageBase64 && !currentQuoteText) return;
  
  let displayMsg = msg || '提取图片中的提示词元素。';
  let fullMsg = msg || '分析图片';
  if (currentQuoteText) {
    fullMsg = \`> \${currentQuoteText}\\n\\n\${fullMsg}\`;
  }
  
  addMessage(displayMsg, true, currentImageBase64);
  
  const payloadImage = currentImageBase64;
  
  promptInput.value = '';
  promptInput.style.height = 'auto';
  removeImage();
  removeQuote();
  
  const loadingId = 'loading-' + Date.now();
  const loadingMsg = document.createElement('div');
  loadingMsg.className = 'msg ai';
  loadingMsg.id = loadingId;
  loadingMsg.textContent = '思考中...';
  
  const firstTask = Array.from(chatMessages.children).find(c => c.id && c.id.startsWith('task-'));
  if (firstTask) {
    chatMessages.insertBefore(loadingMsg, firstTask);
  } else {
    chatMessages.appendChild(loadingMsg);
  }
  
  const scrollContent = document.getElementById('content');
  if (scrollContent) scrollContent.scrollTop = scrollContent.scrollHeight;

  // Build context from current chat tasks
  chrome.runtime.sendMessage({ action: 'getTasks' }, (res) => {
    const tasks = res.tasks || [];
    const currentChatTasks = tasks.filter(t => t.chatId === currentChatId && t.status === 'completed');
    const recent = currentChatTasks.slice(-2).map(t => {
      const d = t.resultData.zh || t.resultData;
      if (typeof d === 'string') return d;
      if (typeof d === 'object' && d !== null) return Object.entries(d).filter(([k,v]) => k.length > 0 && typeof v === 'string').map(([k,v]) => k + ': ' + v).join();
      return '';
    }).join('\\n---\\n');
    
    const contextMsg = recent ? \`参考最近提取的提示词上下文：\\n\${recent}\\n\\n用户问题：\${fullMsg}\` : fullMsg;

    chrome.runtime.sendMessage({ action: 'chat', message: contextMsg, image: payloadImage ? payloadImage.split(',')[1] : null }, (response) => {
      const loadingEl = document.getElementById(loadingId);
      if (loadingEl) loadingEl.remove();
      
      if (response && response.data) {
        addMessage(response.data, false);
      } else if (response && response.error) {
        addMessage('错误: ' + response.error, false);
      }
    });
  });
}

promptInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendChat();
  }
});

document.getElementById('send-btn').addEventListener('click', sendChat);

document.getElementById('optimize-btn').addEventListener('click', () => {
  const original = promptInput.value;
  if (!original) return;
  
  promptInput.value = '正在智能优化...';
  chrome.runtime.sendMessage({ action: 'smartOptimize', prompt: original }, (response) => {
    if (response && response.data) {
      promptInput.value = response.data;
      promptInput.dispatchEvent(new Event('input'));
    } else {
      promptInput.value = original;
      showToast(response?.error || '优化失败', 'error');
    }
  });
});

// Image Upload Logic
const fileUpload = document.getElementById('file-upload');
const uploadBtn = document.getElementById('upload-btn');
const imagePreviewContainer = document.getElementById('image-preview-container');
const imagePreview = document.getElementById('image-preview');
const removeImageBtn = document.getElementById('remove-image');

uploadBtn.addEventListener('click', () => {
  fileUpload.click();
});

fileUpload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      currentImageBase64 = event.target.result;
      imagePreview.src = currentImageBase64;
      imagePreviewContainer.style.display = 'block';
    };
    reader.readAsDataURL(file);
  }
});

function removeImage() {
  currentImageBase64 = null;
  imagePreview.src = '';
  imagePreviewContainer.style.display = 'none';
  fileUpload.value = '';
}

removeImageBtn.addEventListener('click', removeImage);

const searchInput = document.getElementById('library-search');
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    renderLibrary(e.target.value.trim());
  });
}

const libTabLocal = document.getElementById('lib-tab-local');
const libTabOnline = document.getElementById('lib-tab-online');

if (libTabLocal && libTabOnline) {
  libTabLocal.addEventListener('click', () => {
    currentLibraryTab = 'local';
    libTabLocal.style.background = 'var(--accent-blue)';
    libTabLocal.style.color = 'white';
    libTabLocal.style.boxShadow = '0 2px 8px rgba(106,168,255,0.3)';
    libTabOnline.style.background = 'transparent';
    libTabOnline.style.color = 'var(--text-muted)';
    libTabOnline.style.boxShadow = 'none';
    renderLibrary(searchInput ? searchInput.value.trim() : '');
  });
  
  libTabOnline.addEventListener('click', () => {
    currentLibraryTab = 'online';
    libTabOnline.style.background = 'var(--accent-blue)';
    libTabOnline.style.color = 'white';
    libTabOnline.style.boxShadow = '0 2px 8px rgba(106,168,255,0.3)';
    libTabLocal.style.background = 'transparent';
    libTabLocal.style.color = 'var(--text-muted)';
    libTabLocal.style.boxShadow = 'none';
    renderLibrary(searchInput ? searchInput.value.trim() : '');
  });
}

const exportCsvBtn = document.getElementById('export-csv-btn');
if (exportCsvBtn) {
  exportCsvBtn.addEventListener('click', () => {
    chrome.storage.local.get(['promptHistory'], (res) => {
      const history = res.promptHistory || [];
      if (history.length === 0) return showToast('没有可导出的数据', 'error');
      
      let csvContent = "data:text/csv;charset=utf-8,\\uFEFF图片URL,提示词\\n";
      
      history.forEach(item => {
        const d = item.data.zh || item.data;
        let keywords = '';
        if (typeof d === 'string') {
          keywords = d;
        } else if (typeof d === 'object' && d !== null) {
          keywords = Object.entries(d).filter(([k,v]) => k.length > 0 && typeof v === 'string').map(([k,v]) => k + ': ' + v).join();
        }
        
        // Escape quotes and wrap in quotes to handle commas and newlines
        const escapedKeywords = '"' + keywords.replace(/"/g, '""') + '"';
        const escapedUrl = '"' + item.url.replace(/"/g, '""') + '"';
        
        csvContent += \`\${escapedUrl},\${escapedKeywords}\\n\`;
      });
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "ai_prompts.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  });
}

// Downloader Logic
const urlParams = new URLSearchParams(window.location.search);
const isNewTab = urlParams.get('view') === 'downloader';
let activeExtractTabId = null;

if (isNewTab) {
   document.getElementById('nav').style.display = 'none';
   document.getElementById('action-bar-container').style.display = 'none';
   document.getElementById('chat-view').style.display = 'none';
   
   const dlView = document.getElementById('downloader-view');
   dlView.style.display = 'flex';
   
   document.body.style.background = '#f5f7fb';
   
   // We passed the target tab Id
   const tz = urlParams.get('tabId');
   if (tz) activeExtractTabId = parseInt(tz, 10);
   fetchImagesFromActiveTab();
}

document.getElementById('open-downloader-btn').addEventListener('click', () => {
    openModal('downloader-view', true);
    fetchImagesFromActiveTab();
});

let dlImages = [];

function setupDlCustomSelects() {
  const formatDisplay = document.getElementById('dl-format-display');
  const formatOptions = document.getElementById('dl-format-options');
  const formatSelect = document.getElementById('dl-format-filter');
  
  if (formatDisplay && formatOptions) {
    formatDisplay.addEventListener('click', (e) => {
      e.stopPropagation();
      formatOptions.classList.toggle('open');
      formatDisplay.classList.toggle('open');
      const sizeOptions = document.getElementById('dl-size-options');
      if (sizeOptions) {
        sizeOptions.classList.remove('open');
        document.getElementById('dl-size-display').classList.remove('open');
      }
    });
    const opts = formatOptions.querySelectorAll('.custom-option');
    opts.forEach(opt => {
      opt.addEventListener('click', () => {
        formatSelect.value = opt.dataset.value;
        formatSelect.dispatchEvent(new Event('change'));
        formatDisplay.textContent = opt.textContent;
        formatOptions.classList.remove('open');
        formatDisplay.classList.remove('open');
        updateCustomOptionsSelection(formatOptions, opt.dataset.value);
      });
    });
  }

  const sizeDisplay = document.getElementById('dl-size-display');
  const sizeOptions = document.getElementById('dl-size-options');
  const sizeSelect = document.getElementById('dl-size-filter');
  
  if (sizeDisplay && sizeOptions) {
    sizeDisplay.addEventListener('click', (e) => {
      e.stopPropagation();
      sizeOptions.classList.toggle('open');
      sizeDisplay.classList.toggle('open');
      if (formatOptions) {
        formatOptions.classList.remove('open');
        formatDisplay.classList.remove('open');
      }
    });
    const opts = sizeOptions.querySelectorAll('.custom-option');
    opts.forEach(opt => {
      opt.addEventListener('click', () => {
        sizeSelect.value = opt.dataset.value;
        sizeSelect.dispatchEvent(new Event('change'));
        sizeDisplay.textContent = opt.textContent;
        sizeOptions.classList.remove('open');
        sizeDisplay.classList.remove('open');
        updateCustomOptionsSelection(sizeOptions, opt.dataset.value);
      });
    });
  }
}

setupDlCustomSelects();

function fetchImagesFromActiveTab() {
  if (activeExtractTabId) {
     executeExtract(activeExtractTabId);
  } else {
     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if(tabs[0]) executeExtract(tabs[0].id);
     });
  }
}

function executeExtract(tabId) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    func: () => {
      const media = new Map();
      const addedBases = new Set();
      const addMedia = (urlStr, width, height) => {
          if (!urlStr || typeof urlStr !== 'string') return;
          try {
             let rawUrl = urlStr;
             if (urlStr.startsWith('//')) {
                 rawUrl = window.location.protocol + urlStr;
             } else if (!urlStr.startsWith('http') && !urlStr.startsWith('data:image')) {
                 rawUrl = new URL(urlStr, window.location.href).href;
             }
             
             if (rawUrl.startsWith('http') || rawUrl.startsWith('data:image')) {
                 let base = rawUrl.split('?')[0];
                 
                 // If it's a Xiaohongshu CDN link, group by URL path to deduplicate across different CDN hosts
                 if (base.includes('.xhscdn.com/')) {
                     try {
                        const parsed = new URL(base);
                        base = 'xhscdn' + parsed.pathname;
                     } catch(e) {}
                 }

                 // Skip duplicate base URLs to avoid showing the same video/image with different auth tokens
                 // But bypass for data:image and local blobs just in case
                 if (!rawUrl.startsWith('data:') && addedBases.has(base)) return;
                 addedBases.add(base);

                 if (!media.has(rawUrl)) {
                     media.set(rawUrl, { url: rawUrl, width: width || 0, height: height || 0 });
                 } else {
                     if (width > media.get(rawUrl).width) {
                         media.set(rawUrl, { url: rawUrl, width, height });
                     }
                 }
             }
          } catch(e) {}
      };

      const getBestImageUrl = (img) => {
          let bestSrc = img.getAttribute('src') || img.src;
          let isHiRes = false;
          const srcset = img.getAttribute('srcset');
          if (srcset) {
              const parts = srcset.split(',').map(p => p.trim());
              if (parts.length > 0) {
                  const largest = parts.reduce((prev, curr) => {
                     const currSize = parseInt(curr.split(' ')[1] || '0', 10);
                     const prevSize = parseInt(prev.split(' ')[1] || '0', 10);
                     return currSize > prevSize ? curr : prev;
                  }, parts[0]);
                  bestSrc = largest.split(' ')[0];
                  isHiRes = true;
              }
          }
          const opts = ['data-src', 'data-original', 'data-large', 'data-zoom-src', 'data-highres', 'data-hires-src', 'data-objurl'];
          for (let attr of opts) {
              let val = img.getAttribute(attr);
              if (val && (val.includes('http') || val.includes('//'))) {
                  bestSrc = val; 
                  isHiRes = true;
                  break;
              }
          }
          if (bestSrc && bestSrc.startsWith('//')) bestSrc = window.location.protocol + bestSrc;
          if (bestSrc && bestSrc.includes('twimg.com')) {
              bestSrc = bestSrc.replace(/name=[a-z0-9_]+/, 'name=orig');
              isHiRes = true;
          }
          if (bestSrc && (bestSrc.includes('xiaohongshu.com') || bestSrc.includes('xhscdn.com'))) {
             bestSrc = bestSrc.split('?')[0].split('!')[0];
             isHiRes = true;
          }
          if (bestSrc) bestSrc = bestSrc.replace(/_\\d+x\\d+.*?\\.jpg$/, '.jpg').replace(/_\\d+x\\d+.*?\\.png$/, '.png');
          return { url: bestSrc, isHiRes };
      };

      document.querySelectorAll('img').forEach(img => {
          const res = getBestImageUrl(img);
          const rect = img.getBoundingClientRect();
          let w = img.naturalWidth || rect.width || img.width || 0;
          let h = img.naturalHeight || rect.height || img.height || 0;
          
          if (res.isHiRes && w < 800) {
              w = Math.max(w, 1000);
              h = Math.max(h, 1000);
          }
          addMedia(res.url, w, h);
      });
      document.querySelectorAll('video').forEach(vid => {
          let vsrc = vid.getAttribute('src') || vid.src;
          if (vsrc && !vsrc.startsWith('blob:')) addMedia(vsrc, vid.videoWidth || vid.width || 1080, vid.videoHeight || vid.height || 1920);
          vid.querySelectorAll('source').forEach(src => {
              let s = src.getAttribute('src') || src.src;
              if (s && !s.startsWith('blob:')) addMedia(s, vid.videoWidth || vid.width || 1080, vid.videoHeight || vid.height || 1920);
          });
      });
      
      // Universal meta video extraction
      document.querySelectorAll('meta[property="og:video"], meta[property="og:video:url"], meta[property="og:video:secure_url"], meta[name="twitter:player:stream"], meta[itemprop="contentUrl"]').forEach(meta => {
          let content = meta.getAttribute('content');
          if (content && !content.startsWith('blob:') && (content.startsWith('http') || content.startsWith('//'))) {
              let url = content.startsWith('//') ? window.location.protocol + content : content;
              addMedia(url, 1080, 1920);
          }
      });
      
      // Xiaohongshu specific extraction for mp4
      if (window.location.host.includes('xiaohongshu.com')) {
          document.querySelectorAll('script').forEach(script => {
              const text = script.innerHTML;
              if (text.includes('window.__INITIAL_STATE__')) {
                  try {
                      let stateStr = text.split('window.__INITIAL_STATE__=')[1];
                      if (stateStr) {
                         stateStr = stateStr.replace(/<\\/script>.*$/is, '').replace(/;$/, '').trim();
                         const state = JSON.parse(stateStr.replace(/undefined/g, 'null'));
                         const findVids = (obj) => {
                             if (!obj || typeof obj !== 'object') return;
                              if (typeof obj.masterUrl === 'string') addMedia(obj.masterUrl, obj.width || 1080, obj.height || 1920);
                              else if (typeof obj.videoUrl === 'string') addMedia(obj.videoUrl, obj.width || 1080, obj.height || 1920);
                              Object.values(obj).forEach(val => findVids(val));
                         };
                         findVids(state);
                      }
                  } catch(e) {}
              }
          });
      }

      document.querySelectorAll('*').forEach(el => {
          const bg = window.getComputedStyle(el).backgroundImage;
          if (bg && bg !== 'none' && bg.includes('url(')) {
              let url = bg.slice(bg.indexOf('url(') + 4, bg.indexOf(')')).replace(/["']/g, '');
              addMedia(url, el.clientWidth, el.clientHeight);
          }
      });
      return Array.from(media.values());
    }
  }, (results) => {
    if (results && results[0] && results[0].result) {
      dlImages = results[0].result.map(item => ({ url: item.url, width: item.width, height: item.height, selected: false }));
      renderDownloaderGrid();
    }
  });
}

function checkMatch(img) {
   const formatFilter = document.getElementById('dl-format-filter').value;
   const sizeFilter = parseInt(document.getElementById('dl-size-filter').value, 10);
   const lowerUrl = img.url.toLowerCase();
   
   let matchFormat = false;
   if (formatFilter === 'all') matchFormat = true;
   else if (formatFilter === 'jpg' && (lowerUrl.includes('.jpg') || lowerUrl.includes('.jpeg'))) matchFormat = true;
   else if (formatFilter === 'png' && lowerUrl.includes('.png')) matchFormat = true;
   else if (formatFilter === 'webp' && lowerUrl.includes('.webp')) matchFormat = true;
   else if (formatFilter === 'mp4' && (lowerUrl.includes('.mp4') || lowerUrl.includes('sns-video'))) matchFormat = true;
   else if (formatFilter === 'other') {
       const isJpg = lowerUrl.includes('.jpg') || lowerUrl.includes('.jpeg');
       const isPng = lowerUrl.includes('.png');
       const isMp4 = lowerUrl.includes('.mp4') || lowerUrl.includes('sns-video');
       if (!isJpg && !isPng && !isMp4) matchFormat = true;
   }
   
   if (!matchFormat) return false;
   
   if (sizeFilter === 0) return true;
   const maxDim = Math.max(img.width || 0, img.height || 0);
   return maxDim >= sizeFilter;
}

let currentEnlargeIndex = -1;
let visibleImages = [];

function renderDownloaderGrid() {
   const grid = document.getElementById('downloader-grid');
   grid.innerHTML = '';
   let count = 0;
   visibleImages = [];
   
   dlImages.forEach((img, idx) => {
      if (!checkMatch(img)) return;
      
      visibleImages.push(img);
      const vIdx = visibleImages.length - 1;
      
      const item = document.createElement('div');
      item.style.position = 'relative';
      item.style.paddingTop = '100%';
      item.style.borderRadius = '8px';
      item.style.overflow = 'hidden';
      item.style.cursor = 'pointer';
      item.style.boxSizing = 'border-box';
      item.style.border = img.selected ? '2px solid var(--accent-blue)' : '2px solid transparent';
      item.style.transition = 'var(--transition-liquid)';
      
      if (img.url.toLowerCase().includes('.mp4') || img.url.toLowerCase().includes('sns-video')) {
          const videoEl = document.createElement('video');
          videoEl.src = img.url;
          videoEl.style.position = 'absolute';
          videoEl.style.top = '0';
          videoEl.style.left = '0';
          videoEl.style.width = '100%';
          videoEl.style.height = '100%';
          videoEl.style.objectFit = 'cover';
          videoEl.muted = true;
          videoEl.playsInline = true;
          videoEl.setAttribute('playsinline', 'true');
          videoEl.autoplay = true;
          videoEl.loop = true;
          item.appendChild(videoEl);
      } else {
          const imgEl = document.createElement('img');
          imgEl.src = img.url;
          imgEl.style.position = 'absolute';
          imgEl.style.top = '0';
          imgEl.style.left = '0';
          imgEl.style.width = '100%';
          imgEl.style.height = '100%';
          imgEl.style.objectFit = 'cover';
          item.appendChild(imgEl);
      }
      
      const checkEl = document.createElement('div');
      checkEl.style.position = 'absolute';
      checkEl.style.top = '4px';
      checkEl.style.left = '4px';
      checkEl.style.width = '20px';
      checkEl.style.height = '20px';
      checkEl.style.borderRadius = '50%';
      checkEl.style.background = img.selected ? 'var(--accent-blue)' : 'rgba(0,0,0,0.5)';
      checkEl.style.border = '2px solid white';
      checkEl.style.display = 'flex';
      checkEl.style.alignItems = 'center';
      checkEl.style.justifyContent = 'center';
      checkEl.style.zIndex = '5';
      if (img.selected) {
         checkEl.innerHTML = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
      }
      
      checkEl.addEventListener('click', (e) => {
         e.stopPropagation();
         img.selected = !img.selected;
         renderDownloaderGrid();
      });
      
      item.appendChild(checkEl);
      
      item.addEventListener('click', () => {
         openEnlargeModal(vIdx);
      });
      
      grid.appendChild(item);
      if (img.selected) count++;
   });
   
   document.getElementById('dl-selected-count').textContent = count;
}

function openEnlargeModal(vIdx) {
  if (vIdx < 0 || vIdx >= visibleImages.length) return;
  currentEnlargeIndex = vIdx;
  const img = visibleImages[vIdx];
  const modal = document.getElementById('image-modal');
  const imgEl = document.getElementById('image-modal-img');
  const videoEl = document.getElementById('image-modal-video');
  const copyTextEl = document.getElementById('image-modal-copy-text');
  
  if (img.url.toLowerCase().includes('.mp4') || img.url.toLowerCase().includes('sns-video')) {
      imgEl.style.display = 'none';
      videoEl.style.display = 'block';
      videoEl.src = img.url;
      if (copyTextEl) copyTextEl.textContent = '下载视频';
  } else {
      videoEl.style.display = 'none';
      imgEl.style.display = 'block';
      imgEl.src = img.url;
      if (copyTextEl) copyTextEl.textContent = '复制图像';
  }
  
  modal.style.display = 'flex';
}

document.getElementById('image-modal-close').addEventListener('click', () => {
  document.getElementById('image-modal').style.display = 'none';
  document.getElementById('image-modal-video').pause();
});

document.getElementById('image-modal-prev').addEventListener('click', () => {
  openEnlargeModal(currentEnlargeIndex - 1);
});

document.getElementById('image-modal-next').addEventListener('click', () => {
  openEnlargeModal(currentEnlargeIndex + 1);
});

document.addEventListener('keydown', (e) => {
  if (document.getElementById('image-modal').style.display === 'flex') {
    if (e.key === 'ArrowLeft') {
       openEnlargeModal(currentEnlargeIndex - 1);
    } else if (e.key === 'ArrowRight') {
       openEnlargeModal(currentEnlargeIndex + 1);
    } else if (e.key === 'Escape') {
       document.getElementById('image-modal').style.display = 'none';
       document.getElementById('image-modal-video').pause();
    }
  }
});

document.getElementById('image-modal-copy').addEventListener('click', async () => {
  if (currentEnlargeIndex >= 0 && currentEnlargeIndex < visibleImages.length) {
    const imgData = visibleImages[currentEnlargeIndex];
    const url = imgData.url;
    const btn = document.getElementById('image-modal-copy');
    const oldHtml = btn.innerHTML;
    
    try {
        if (url.toLowerCase().includes('.mp4') || url.toLowerCase().includes('sns-video')) {
            await downloadImage(url);
            btn.innerHTML = '<span style="display:flex; align-items:center; gap:8px;">☑ 已开始下载</span>';
        } else {
            const img = new Image();
            img.crossOrigin = "anonymous";
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = () => {
                    fetch(url, { mode: 'cors' })
                        .then(res => res.blob())
                        .then(blob => {
                            const blobUrl = URL.createObjectURL(blob);
                            img.onload = resolve;
                            img.onerror = () => {
                                // Last fallback if blob URL fails
                                reject(new Error('Cross-Origin/Fetch failed'));
                            };
                            img.src = blobUrl;
                        }).catch(reject);
                };
                img.src = url;
            });
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth || img.width;
            canvas.height = img.naturalHeight || img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
            ]);
            btn.innerHTML = '<span style="display:flex; align-items:center; gap:8px;">☑ 已复制图片</span>';
        }
    } catch (err) {
        console.error('Copy failed:', err);
        // Fallback to text url copy if blob copy fails (e.g. security block or canvas taint)
        await navigator.clipboard.writeText(url).catch(()=>console.log('Final text copy fail'));
        btn.innerHTML = '<span style="display:flex; align-items:center; gap:8px;">☑ 已复制资源链接</span>';
    }
    
    btn.style.transform = 'scale(0.95)';
    setTimeout(() => {
        btn.style.transform = 'scale(1)';
    }, 150);
    
    setTimeout(() => btn.innerHTML = oldHtml, 2000);
  }
});

document.getElementById('dl-format-filter').addEventListener('change', renderDownloaderGrid);
document.getElementById('dl-size-filter').addEventListener('change', renderDownloaderGrid);

document.getElementById('dl-select-all').addEventListener('click', () => {
   dlImages.forEach(img => {
       if(checkMatch(img)) img.selected = true;
   });
   renderDownloaderGrid();
});

document.getElementById('dl-invert-select').addEventListener('click', () => {
   dlImages.forEach(img => {
       if(checkMatch(img)) img.selected = !img.selected;
   });
   renderDownloaderGrid();
});

document.getElementById('dl-batch-btn').addEventListener('click', async () => {
   const selected = dlImages.filter(img => img.selected);
   if (selected.length === 0) return showToast('请先选择文件', 'error');
   
   showToast(\`开始打包 \${selected.length} 个文件，请稍候...\`, 'info');
   document.getElementById('dl-batch-btn').disabled = true;
   document.getElementById('dl-batch-btn').innerHTML = '打包中... <div class="ai-status-spinner" style="display:inline-block; width:12px; height:12px; margin-left:8px; border-width: 2px;"></div>';

   try {
     const zip = new JSZip();
     let successCount = 0;
     
     for (let i = 0; i < selected.length; i++) {
        const img = selected[i];
        
        try {
           const res = await fetch(img.url, { cache: 'force-cache' });
           if (!res.ok) continue;
           
           const lowerUrl = img.url.toLowerCase();
           let ext = 'jpg';
           // URL baseline
           if (lowerUrl.includes('.png')) ext = 'png';
           if (lowerUrl.includes('.webp')) ext = 'webp';
           if (lowerUrl.includes('.gif')) ext = 'gif';
           if (lowerUrl.includes('.svg')) ext = 'svg';
           if (lowerUrl.includes('.mp4')) ext = 'mp4';
           
           // Header override (more accurate)
           const contentType = (res.headers.get('content-type') || '').toLowerCase();
           if (contentType.includes('image/gif')) ext = 'gif';
           else if (contentType.includes('image/png')) ext = 'png';
           else if (contentType.includes('image/webp')) ext = 'webp';
           else if (contentType.includes('video/mp4')) ext = 'mp4';
           else if (contentType.includes('image/svg')) ext = 'svg';
           else if (contentType.includes('image/jpeg') || contentType.includes('image/jpg')) ext = 'jpg';

           const blob = await res.blob();
           zip.file(\`image_downloader/\${Date.now()}_\${i}.\${ext}\`, blob);
           successCount++;
        } catch (e) {
           console.error("Failed to fetch media for zip", img.url, e);
        }
     }
     
     if (successCount === 0) {
       showToast('文件获取失败，可能存在跨域问题', 'error');
     } else {
       const content = await zip.generateAsync({ type: "blob" });
       saveAs(content, \`ai_images_\${Date.now()}.zip\`);
       showToast(\`成功打包下载 \${successCount} 个文件\`, 'success');
     }
   } catch (e) {
     showToast('打包过程出错', 'error');
     console.error(e);
   } finally {
     document.getElementById('dl-batch-btn').disabled = false;
     document.getElementById('dl-batch-btn').innerHTML = '批量下载';
   }
});

if (!isNewTab) {
  renderLibrary();
}
`;
