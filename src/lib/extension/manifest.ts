export const manifestJson = `{
  "manifest_version": 3,
  "name": "AI 提示词提取器",
  "version": "1.5",
  "description": "使用 Gemini 或 Ollama 智能分析网页图片，一键反推高质量 AI 绘画提示词。",
  "permissions": [
    "storage",
    "unlimitedStorage",
    "contextMenus",
    "activeTab",
    "scripting",
    "sidePanel"
  ],
  "host_permissions": [
    "*://*/*"
  ],
  "side_panel": {
    "default_path": "sidepanel.html"
  },
  "content_scripts": [
    {
      "matches": ["*://*/*"],
      "css": ["content.css"],
      "js": ["content.js"]
    }
  ],
  "background": {
    "service_worker": "background.js"
  },
  "commands": {
    "trigger-screenshot": {
      "suggested_key": {
        "default": "Alt+Q"
      },
      "description": "截图提取提示词"
    }
  },
  "icons": {
    "16": "icon16.png",
    "48": "icon48.png",
    "128": "icon128.png"
  },
  "action": {
    "default_icon": {
      "16": "icon16.png",
      "48": "icon48.png",
      "128": "icon128.png"
    }
  }
}`;
