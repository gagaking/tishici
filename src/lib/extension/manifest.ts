export const manifestJson = `{
  "manifest_version": 3,
  "name": "AI视觉反推",
  "version": "2.0.0",
  "description": "融合网页图片内容嗅探、批量下载与多架构 AI 视觉反推能力的侧边栏副驾驶助手。",
  "permissions": [
    "storage",
    "unlimitedStorage",
    "contextMenus",
    "activeTab",
    "scripting",
    "sidePanel",
    "downloads"
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

