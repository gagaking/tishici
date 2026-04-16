import React, { useState } from 'react';
import { DemoImage } from './components/DemoImage';
import { Download, Sparkles, Image as ImageIcon, Chrome, CheckCircle2, Key, Puzzle, ShieldCheck, Zap, MousePointerClick, Database, LayoutGrid, ExternalLink, Layers, MessageSquare, Wand2 } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { motion } from 'motion/react';
import { manifestJson, contentCss, contentJs, backgroundJs, sidepanelHtml, sidepanelJs, collectionHtml, collectionJs } from './lib/extensionFiles';

export default function App() {
  const [promptText, setPromptText] = useState(
    <>
      <strong>主体描述:</strong> 一位年轻的亚洲女性模特，穿着一件红色的丝绸长裙，搭配黑色高跟鞋。<br/>
      <strong>环境背景:</strong> 现代极简风格的室内摄影棚，纯灰色背景。<br/>
      <strong>艺术风格:</strong> 时尚大片，商业摄影，高清晰度，色彩鲜艳。<br/>
      <strong>构图视角:</strong> 全身构图，平视角度，突出人物气质与服装质感。
    </>
  );

  const handleOutfitChange = () => {
    setPromptText(
      <>
        <strong>主体描述:</strong> 一位年轻的亚洲女性模特。<br/>
        <strong>环境背景:</strong> 现代极简风格的室内摄影棚，纯灰色背景。<br/>
        <strong>艺术风格:</strong> 时尚大片，商业摄影，高清晰度，色彩鲜艳。<br/>
        <strong>构图视角:</strong> 全身构图，平视角度，突出人物气质与服装质感。
      </>
    );
  };

  const generateDuckIcon = async (size: number, type: 'gemini' | 'ollama'): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, size, size);

        ctx.font = `${size * 0.8}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🦆', size / 2, size / 2 + size * 0.05);

        ctx.font = `${size * 0.35}px Arial`;
        if (type === 'gemini') {
          ctx.fillText('⚡️', size * 0.85, size * 0.25);
        } else {
          ctx.fillText('🛡️', size * 0.85, size * 0.25);
        }
      }
      canvas.toBlob((blob) => {
        resolve(blob!);
      }, 'image/png');
    });
  };

  const handleDownloadExtension = async (type: 'gemini' | 'ollama') => {
    const zip = new JSZip();
    
    const icon16 = await generateDuckIcon(16, type);
    const icon48 = await generateDuckIcon(48, type);
    const icon128 = await generateDuckIcon(128, type);
    
    zip.file("icons/icon16.png", icon16);
    zip.file("icons/icon48.png", icon48);
    zip.file("icons/icon128.png", icon128);

    const updatedManifest = JSON.parse(manifestJson);
    updatedManifest.icons = {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    };
    updatedManifest.action.default_icon = updatedManifest.icons;
    updatedManifest.side_panel.default_path = "html/sidepanel.html";
    updatedManifest.content_scripts[0].css = ["css/content.css"];
    updatedManifest.content_scripts[0].js = ["js/content.js"];
    updatedManifest.background.service_worker = "js/background.js";
    
    zip.file("manifest.json", JSON.stringify(updatedManifest, null, 2));
    zip.file("css/content.css", contentCss);
    zip.file("js/content.js", contentJs);
    zip.file("js/background.js", backgroundJs);
    
    const updatedSidepanelHtml = sidepanelHtml.replace('src="sidepanel.js"', 'src="../js/sidepanel.js"');
    const updatedCollectionHtml = collectionHtml.replace('src="collection.js"', 'src="../js/collection.js"');
    
    zip.file("html/sidepanel.html", updatedSidepanelHtml);
    zip.file("js/sidepanel.js", sidepanelJs);
    zip.file("html/collection.html", updatedCollectionHtml);
    zip.file("js/collection.js", collectionJs);
    
    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, "ai-prompt-analyzer.zip");
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#111827] font-sans selection:bg-[#6AA8FF]/30 overflow-x-hidden" style={{ backgroundImage: 'radial-gradient(circle at 0% 0%, rgba(106, 168, 255, 0.05) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(155, 123, 255, 0.05) 0%, transparent 50%)', backgroundAttachment: 'fixed' }}>
      {/* Header */}
      <header className="bg-white/65 backdrop-blur-2xl border-b border-white/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h1 className="font-bold text-xl tracking-tight text-[#111827] flex items-center gap-2">
              AI Prompt Analyzer
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => handleDownloadExtension('gemini')}
              className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-[#6AA8FF] to-[#9B7BFF] text-white hover:from-[#7BB2FF] hover:to-[#A88CFF] px-4 py-2 rounded-full font-bold transition-all text-sm active:scale-95 shadow-[0_4px_12px_rgba(106,168,255,0.3),inset_0_1px_0_rgba(255,255,255,0.3)] hover:shadow-[0_0_20px_rgba(106,168,255,0.5),0_0_40px_rgba(155,123,255,0.3),inset_0_1px_0_rgba(255,255,255,0.4)]"
            >
              <Download className="w-4 h-4" />
              获取扩展
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-24 md:py-32">
        {/* Hero Section */}
        <motion.div 
          className="text-center max-w-4xl mx-auto mb-32"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/65 backdrop-blur-2xl border border-white/50 text-[#6b7280] text-xs font-bold uppercase tracking-widest mb-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <Chrome className="w-4 h-4" />
            全新 Chrome 扩展
          </motion.div>
          <motion.h2 variants={itemVariants} className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[1.05] text-[#111827]">
            AI视觉 副驾驶，<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#6AA8FF] to-[#9B7BFF]">创作如虎添翼。</span>
          </motion.h2>
          <motion.p variants={itemVariants} className="text-xl md:text-2xl text-[#6b7280] leading-relaxed max-w-3xl mx-auto font-medium">
            全新侧边栏架构，沉浸式 AI 辅助。支持 Gemini 在线极速推理，以及 Ollama 本地隐私计算。一键优化、智能注入，激发无限创作灵感。
          </motion.p>
          
          <motion.div variants={itemVariants} className="mt-12 flex justify-center">
            <button 
              onClick={() => handleDownloadExtension('gemini')}
              className="flex items-center justify-center gap-3 bg-gradient-to-r from-[#6AA8FF] to-[#9B7BFF] text-white hover:from-[#7BB2FF] hover:to-[#A88CFF] px-8 py-4 rounded-full font-bold text-lg transition-all active:scale-95 shadow-[0_4px_12px_rgba(106,168,255,0.3),inset_0_1px_0_rgba(255,255,255,0.3)] hover:shadow-[0_0_20px_rgba(106,168,255,0.5),0_0_40px_rgba(155,123,255,0.3),inset_0_1px_0_rgba(255,255,255,0.4)]"
            >
              <Zap className="w-5 h-5" />
              下载 AI视觉 副驾驶扩展
            </button>
          </motion.div>
          <motion.div variants={itemVariants} className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto text-left">
            <div className="bg-white/65 backdrop-blur-2xl p-6 rounded-2xl border border-white/50 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(31,38,135,0.05),0_0_15px_rgba(106,168,255,0.3),0_0_30px_rgba(155,123,255,0.15)] hover:border-[#6AA8FF]/20 transition-all duration-300">
              <div className="w-10 h-10 bg-[#6AA8FF]/10 text-[#6AA8FF] rounded-xl flex items-center justify-center mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-[#111827] mb-2">多任务并行处理</h4>
              <p className="text-sm text-[#6b7280]">支持同时处理多个图片分析任务，极大提升工作效率，无需等待单个任务完成。</p>
            </div>
            <div className="bg-white/65 backdrop-blur-2xl p-6 rounded-2xl border border-white/50 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(31,38,135,0.05),0_0_15px_rgba(106,168,255,0.3),0_0_30px_rgba(155,123,255,0.15)] hover:border-[#6AA8FF]/20 transition-all duration-300">
              <div className="w-10 h-10 bg-[#9B7BFF]/10 text-[#9B7BFF] rounded-xl flex items-center justify-center mb-4">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-[#111827] mb-2">灵活的 Chat 聊天</h4>
              <p className="text-sm text-[#6b7280]">在侧边栏与 AI 进行自由对话，随时补充细节、修改提示词，如同与真人助手交流。</p>
            </div>
            <div className="bg-white/65 backdrop-blur-2xl p-6 rounded-2xl border border-white/50 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(31,38,135,0.05),0_0_15px_rgba(106,168,255,0.3),0_0_30px_rgba(155,123,255,0.15)] hover:border-[#6AA8FF]/20 transition-all duration-300">
              <div className="w-10 h-10 bg-[#6AA8FF]/10 text-[#6AA8FF] rounded-xl flex items-center justify-center mb-4">
                <Wand2 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-[#111827] mb-2">全新百变提示词架构</h4>
              <p className="text-sm text-[#6b7280]">内置 9 大维度解析架构，一键生成结构化、高质量的提示词。更可以手动编辑预设结构满足各种创作需求。</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Interactive Demo */}
        <motion.div 
          className="mb-32"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-black tracking-tight text-[#111827] mb-4">反推效果示意</h3>
            <p className="text-xl text-[#6b7280]">右键图片截图即可一键提取提示词，自动解析画面细节。</p>
          </div>
          <div className="max-w-4xl mx-auto bg-white/65 backdrop-blur-2xl p-6 rounded-[2.5rem] border border-white/50 shadow-[0_8px_32px_rgba(31,38,135,0.05)]">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="w-full md:w-1/2 rounded-[2rem] overflow-hidden bg-white/50 aspect-[4/3] flex items-center justify-center relative group">
                <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop" alt="Demo" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                  <div className="bg-white/90 text-[#111827] px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 shadow-xl backdrop-blur-md">
                    <MousePointerClick className="w-4 h-4 text-[#6AA8FF]" />
                    右键 → 截图提取提示词
                  </div>
                </div>
              </div>
              <div className="w-full md:w-1/2 space-y-4">
                <div className="bg-white/50 p-6 rounded-2xl border border-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                  <h4 className="font-bold text-[#111827] mb-2 flex items-center gap-2"><Sparkles className="w-4 h-4 text-[#9B7BFF]" /> 提取结果</h4>
                  <p className="text-sm text-[#6b7280] leading-relaxed">
                    {promptText}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 bg-gradient-to-r from-[#6AA8FF] to-[#9B7BFF] text-white py-3 rounded-xl font-bold text-sm hover:from-[#7BB2FF] hover:to-[#A88CFF] transition-all shadow-[0_4px_12px_rgba(106,168,255,0.3),inset_0_1px_0_rgba(255,255,255,0.3)] hover:shadow-[0_0_20px_rgba(106,168,255,0.5),0_0_40px_rgba(155,123,255,0.3),inset_0_1px_0_rgba(255,255,255,0.4)]">复制提示词</button>
                  <button onClick={handleOutfitChange} className="flex-1 bg-white/65 text-[#111827] py-3 rounded-xl font-bold text-sm hover:bg-white/90 transition-all border border-white/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_0_15px_rgba(106,168,255,0.3),0_0_30px_rgba(155,123,255,0.15),inset_0_1px_0_rgba(255,255,255,1)] hover:border-[#6AA8FF]/30 hover:text-[#6AA8FF]">一键换装</button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Installation Instructions */}
        <motion.div 
          className="bg-white/65 backdrop-blur-2xl p-10 md:p-20 rounded-[3rem] border border-white/50 shadow-[0_8px_32px_rgba(31,38,135,0.05)] relative overflow-hidden"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          <div className="max-w-3xl mx-auto relative z-10">
            <h3 className="text-4xl md:text-5xl font-black mb-16 text-center text-[#111827] tracking-tight">配置指南</h3>
            
            <div className="space-y-16">
              <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-white/80 text-[#6AA8FF] flex items-center justify-center font-black text-2xl border border-white/50 shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)]">1</div>
                <div className="pt-2">
                  <h4 className="text-2xl font-bold mb-4 text-[#111827] tracking-tight">
                    安装扩展程序
                  </h4>
                  <p className="text-[#6b7280] text-lg leading-relaxed mb-4">下载并解压 <code>.zip</code> 压缩包。在 Chrome 地址栏输入 <code>chrome://extensions/</code>，开启右上角的 <strong>“开发者模式”</strong>，点击 <strong>“加载已解压的扩展程序”</strong> 并选择解压后的文件夹。</p>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-white/80 text-[#6AA8FF] flex items-center justify-center font-black text-2xl border border-white/50 shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)]">2</div>
                <div className="pt-2 w-full">
                  <h4 className="text-2xl font-bold mb-4 text-[#111827] tracking-tight">
                    配置云端模型 (Gemini)
                  </h4>
                  <p className="text-[#6b7280] text-lg leading-relaxed mb-4">如果您希望使用云端模型，请获取 Gemini API Key 并填入扩展设置中。</p>
                  <a href="https://aistudio.google.com/api-keys" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[#9B7BFF] font-bold hover:text-[#A88CFF] transition-colors">
                    获取 Gemini API Key <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-white/80 text-[#6AA8FF] flex items-center justify-center font-black text-2xl border border-white/50 shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)]">3</div>
                <div className="pt-2 w-full">
                  <h4 className="text-2xl font-bold mb-4 text-[#111827] tracking-tight">
                    配置本地模型 (Ollama)
                  </h4>
                  <p className="text-[#6b7280] text-lg leading-relaxed mb-4">如果您希望在本地运行以保护隐私，请安装 Ollama 及对应的视觉模型。</p>
                  <div className="bg-white/50 p-6 rounded-2xl border border-white/80 space-y-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                    <div>
                      <h5 className="font-bold text-[#111827] mb-2">1. 下载 Ollama</h5>
                      <a href="https://ollama.com/download" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[#9B7BFF] font-bold hover:text-[#A88CFF] transition-colors text-sm">
                        前往 Ollama 官网下载 <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                    <div>
                      <h5 className="font-bold text-[#111827] mb-2">2. 安装 gemma4:e4b 模型</h5>
                      <p className="text-sm text-[#6b7280] mb-2">打开终端或命令提示符，运行以下命令：</p>
                      <code className="block bg-[#111827] text-white p-3 rounded-lg text-sm font-mono shadow-inner">ollama run gemma4:e4b</code>
                    </div>
                    <div>
                      <h5 className="font-bold text-[#111827] mb-2">3. 允许跨域请求 (重要)</h5>
                      <p className="text-sm text-[#6b7280] mb-2">为了让扩展能够连接到本地 Ollama，您需要设置环境变量后重启 Ollama。在 PowerShell 中运行：</p>
                      <code className="block bg-[#111827] text-[#6AA8FF] p-3 rounded-lg text-sm font-mono break-all shadow-inner">
                        [System.Environment]::SetEnvironmentVariable("OLLAMA_ORIGINS", "*", "User")
                      </code>
                    </div>
                  </div>
                </div>
              </motion.div>

            </div>
          </div>
        </motion.div>
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-white/50 text-center text-[#6b7280] text-sm font-medium">
        <p>© 2026 AI Prompt Analyzer. Designed for creators.</p>
      </footer>
    </div>
  );
}

