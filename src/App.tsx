import React, { useState } from 'react';
import { DemoImage } from './components/DemoImage';
import { Download, Sparkles, Image as ImageIcon, Chrome, CheckCircle2, Key, Puzzle, ShieldCheck, Zap, MousePointerClick, Database, LayoutGrid, ExternalLink, Layers, MessageSquare, Wand2 } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { motion } from 'motion/react';
import { manifestJson, contentCss, contentJs, backgroundJs, sidepanelHtml, sidepanelJs, collectionHtml, collectionJs } from './lib/extensionFiles';
import jszipCode from 'jszip/dist/jszip.min.js?raw';
import fileSaverCode from 'file-saver/dist/FileSaver.min.js?raw';

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

  const generateAppIcon = async (size: number): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(0, 0, size, size, size * 0.2);
        ctx.fill();

        ctx.fillStyle = '#60a5fa';
        const center = size / 2;
        const dotRadius = size * 0.15;
        ctx.beginPath();
        ctx.arc(center, center, dotRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = Math.max(1, size * 0.08);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const margin = size * 0.2;
        const arrowSize = size * 0.15;

        ctx.beginPath();
        ctx.moveTo(size - margin, margin);
        ctx.lineTo(center + dotRadius + size*0.05, center - dotRadius - size*0.05);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(size - margin - arrowSize, margin);
        ctx.lineTo(size - margin, margin);
        ctx.lineTo(size - margin, margin + arrowSize);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(margin, size - margin);
        ctx.lineTo(center - dotRadius - size*0.05, center + dotRadius + size*0.05);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(margin + arrowSize, size - margin);
        ctx.lineTo(margin, size - margin);
        ctx.lineTo(margin, size - margin - arrowSize);
        ctx.stroke();
      }
      canvas.toBlob((blob) => {
        resolve(blob!);
      }, 'image/png');
    });
  };

  const handleDownloadExtension = async (type: 'gemini' | 'ollama') => {
    const zip = new JSZip();
    
    const icon16 = await generateAppIcon(16);
    const icon48 = await generateAppIcon(48);
    const icon128 = await generateAppIcon(128);
    
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
    zip.file("js/jszip.min.js", jszipCode);
    zip.file("js/FileSaver.min.js", fileSaverCode);
    
    let updatedSidepanelHtml = sidepanelHtml.replace('src="sidepanel.js"', 'src="../js/sidepanel.js"');
    updatedSidepanelHtml = updatedSidepanelHtml.replace('</head>', '  <script src="../js/jszip.min.js"></script>\n  <script src="../js/FileSaver.min.js"></script>\n</head>');
    
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
            Prompt Hunter<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#6AA8FF] to-[#9B7BFF]">画廊嗅探与视觉反推</span>
          </motion.h2>
          <motion.p variants={itemVariants} className="text-xl md:text-2xl text-[#6b7280] leading-relaxed max-w-3xl mx-auto font-medium">
            全新侧边栏架构，沉浸式设计辅助。不仅提供强大的网页画廊嗅探与批量下载功能，更支持接入 Gemini 或 Ollama 进行精准的图片反推、生成及多轮智能对话。
          </motion.p>
          
          <motion.div variants={itemVariants} className="mt-12 flex justify-center">
            <button 
              onClick={() => handleDownloadExtension('gemini')}
              className="flex items-center justify-center gap-3 bg-gradient-to-r from-[#6AA8FF] to-[#9B7BFF] text-white hover:from-[#7BB2FF] hover:to-[#A88CFF] px-8 py-4 rounded-full font-bold text-lg transition-all active:scale-95 shadow-[0_4px_12px_rgba(106,168,255,0.3),inset_0_1px_0_rgba(255,255,255,0.3)] hover:shadow-[0_0_20px_rgba(106,168,255,0.5),0_0_40px_rgba(155,123,255,0.3),inset_0_1px_0_rgba(255,255,255,0.4)]"
            >
              <Zap className="w-5 h-5" />
              打包下载扩展 (包含画廊嗅探功能)
            </button>
          </motion.div>
          <motion.div variants={itemVariants} className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto text-left">
            <div className="bg-white/65 backdrop-blur-2xl p-6 rounded-2xl border border-white/50 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(31,38,135,0.05),0_0_15px_rgba(106,168,255,0.3),0_0_30px_rgba(155,123,255,0.15)] hover:border-[#6AA8FF]/20 transition-all duration-300 flex flex-col h-full">
              <div className="w-10 h-10 bg-[#6AA8FF]/10 text-[#6AA8FF] rounded-xl flex items-center justify-center mb-4 font-black flex-shrink-0">
                1
              </div>
              <h4 className="font-bold text-[#111827] mb-2 flex items-center gap-2"><Layers className="w-4 h-4"/>图片智能精准反推</h4>
              <p className="text-sm text-[#6b7280] leading-relaxed flex-1">支持无缝接入在线的 Gemini 或部署到本地的 Ollama (如 LLaVA)，极速推理目标图像的结构、光影及细节，一战式生成专业级 AI 绘画提示词文本序列。</p>
            </div>
            
            <div className="bg-white/65 backdrop-blur-2xl p-6 rounded-2xl border border-white/50 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(31,38,135,0.05),0_0_15px_rgba(106,168,255,0.3),0_0_30px_rgba(155,123,255,0.15)] hover:border-[#6AA8FF]/20 transition-all duration-300 flex flex-col h-full">
              <div className="w-10 h-10 bg-[#9B7BFF]/10 text-[#9B7BFF] rounded-xl flex items-center justify-center mb-4 font-black flex-shrink-0">
                2
              </div>
              <h4 className="font-bold text-[#111827] mb-2 flex items-center gap-2"><Database className="w-4 h-4"/>沉浸式极速嗅探引擎</h4>
              <p className="text-sm text-[#6b7280] leading-relaxed flex-1">自动捕获当前浏览网页深层加载的所有高清图片与视频资源。您可以通过内置强大的格式过滤及分辨率阈值筛选，一键打包 ZIP 下载数十张隐藏设定图。</p>
            </div>
            
            <div className="bg-white/65 backdrop-blur-2xl p-6 rounded-2xl border border-white/50 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(31,38,135,0.05),0_0_15px_rgba(106,168,255,0.3),0_0_30px_rgba(155,123,255,0.15)] hover:border-[#6AA8FF]/20 transition-all duration-300 flex flex-col h-full">
              <div className="w-10 h-10 bg-[#6AA8FF]/10 text-[#6AA8FF] rounded-xl flex items-center justify-center mb-4 font-black flex-shrink-0">
                3
              </div>
              <h4 className="font-bold text-[#111827] mb-2 flex items-center gap-2"><Wand2 className="w-4 h-4"/>个性化推演模型与预设</h4>
              <p className="text-sm text-[#6b7280] leading-relaxed flex-1">不仅内置预建的 9 大视觉解构锚点系统，您还能完全自定义解析模版结构。对于特定行业需求（如摄影构图、插画肌理、赛博废墟感），随心定制返回的特征信息。</p>
            </div>

            <div className="bg-white/65 backdrop-blur-2xl p-6 rounded-2xl border border-white/50 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(31,38,135,0.05),0_0_15px_rgba(106,168,255,0.3),0_0_30px_rgba(155,123,255,0.15)] hover:border-[#6AA8FF]/20 transition-all duration-300 flex flex-col h-full">
              <div className="w-10 h-10 bg-[#9B7BFF]/10 text-[#9B7BFF] rounded-xl flex items-center justify-center mb-4 font-black flex-shrink-0">
                4
              </div>
              <h4 className="font-bold text-[#111827] mb-2 flex items-center gap-2"><MessageSquare className="w-4 h-4"/>灵感库与多重重塑</h4>
              <p className="text-sm text-[#6b7280] leading-relaxed flex-1">被反推的图片将静默缓存进您的历史图库随时调阅，同时您能在侧边栏对当次解析结果进行持续沟通：“换成水彩风格并保留构图”，AI 将动态重塑提示词。</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Use Cases Section */}
        <motion.div 
          className="mb-32"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-black tracking-tight text-[#111827] mb-4">核心解决场景与应用</h3>
            <p className="text-xl text-[#6b7280]">从设计师捕捉灵感、画师整理原画、到AI创作爱好者的全阶段能力补足。</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Scenario 1 */}
            <div className="group bg-white/65 backdrop-blur-2xl rounded-[2rem] border border-white/50 overflow-hidden shadow-[0_8px_32px_rgba(31,38,135,0.05)] hover:shadow-[0_8px_32px_rgba(106,168,255,0.15)] transition-all duration-300">
              <div className="h-44 bg-slate-100 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
                <img src="https://images.unsplash.com/photo-1600132806370-bf17e65e942f?q=80&w=800&auto=format&fit=crop" alt="UI Design" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute bottom-4 left-4 z-20 text-white font-bold text-[15px] flex items-center gap-2"><Sparkles className="w-4 h-4"/> 难以用语言复制的优秀设计</div>
              </div>
              <div className="p-5">
                <p className="text-[#6b7280] leading-relaxed text-sm mb-4">
                  当你浏览 Behance 或是 Pinterest，被其惊艳的光影或角色质感所折服，却不知道如何将它们输入进 Midjourney。启动侧边栏一键反推功能，AI 会穿透视觉表象，将其拆解为标准的色彩映射及光线镜头关键词等硬核提示词矩阵，为你打破创作屏障。
                </p>
                <div className="flex gap-2 flex-wrap">
                  <span className="bg-[#6AA8FF]/10 text-[#6AA8FF] px-3 py-1 rounded-full text-xs font-bold border border-[#6AA8FF]/20">精准提示词生成</span>
                  <span className="bg-[#9B7BFF]/10 text-[#9B7BFF] px-3 py-1 rounded-full text-xs font-bold border border-[#9B7BFF]/20">局部风格提取</span>
                </div>
              </div>
            </div>

            {/* Scenario 2 */}
            <div className="group bg-white/65 backdrop-blur-2xl rounded-[2rem] border border-white/50 overflow-hidden shadow-[0_8px_32px_rgba(31,38,135,0.05)] hover:shadow-[0_8px_32px_rgba(106,168,255,0.15)] transition-all duration-300">
              <div className="h-44 bg-slate-100 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
                <img src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=800&auto=format&fit=crop" alt="Assets" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute bottom-4 left-4 z-20 text-white font-bold text-[15px] flex items-center gap-2"><Database className="w-4 h-4"/> 海量图包无法一键带走？</div>
              </div>
              <div className="p-5">
                <p className="text-[#6b7280] leading-relaxed text-sm mb-4">
                  面对电商详情页几十张高清切片，或者摄影博客中满屏的套图原画，一个个“受限另存为”令人抓狂。启动多媒体嗅探器引擎，插件通过多模式遍历当前网页 DOM 树与渲染层，立刻帮你筛选出所有高清大图或是媒体原文件，只需一步即可 ZIP 满载而归。
                </p>
                <div className="flex gap-2 flex-wrap">
                  <span className="bg-[#6AA8FF]/10 text-[#6AA8FF] px-3 py-1 rounded-full text-xs font-bold border border-[#6AA8FF]/20">一键打包ZIP</span>
                  <span className="bg-[#9B7BFF]/10 text-[#9B7BFF] px-3 py-1 rounded-full text-xs font-bold border border-[#9B7BFF]/20">智能格式过滤</span>
                </div>
              </div>
            </div>

            {/* Scenario 3 */}
            <div className="group bg-white/65 backdrop-blur-2xl rounded-[2rem] border border-white/50 overflow-hidden shadow-[0_8px_32px_rgba(31,38,135,0.05)] hover:shadow-[0_8px_32px_rgba(106,168,255,0.15)] transition-all duration-300">
              <div className="h-44 bg-slate-100 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
                <img src="https://images.unsplash.com/photo-1522252234503-e356532cafd5?q=80&w=800&auto=format&fit=crop" alt="Workflow" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute bottom-4 left-4 z-20 text-white font-bold text-[15px] flex items-center gap-2"><Layers className="w-4 h-4"/> 打破“一波流”的闭环困局</div>
              </div>
              <div className="p-5">
                <p className="text-[#6b7280] leading-relaxed text-sm mb-4">
                  通过“灵感库”串联起了你的工作心流：当你收集完批量图包素材并存入本地后，它们并没有躺尸在你的硬盘里。你可以随时在侧边栏唤醒灵感库并把这些抓取的图片抛给大模型分析，并开启针对该设定图的“换动作、补细节”的连续指令引导优化模式。
                </p>
                <div className="flex gap-2 flex-wrap">
                  <span className="bg-[#6AA8FF]/10 text-[#6AA8FF] px-3 py-1 rounded-full text-xs font-bold border border-[#6AA8FF]/20">灵感存档追溯</span>
                  <span className="bg-[#9B7BFF]/10 text-[#9B7BFF] px-3 py-1 rounded-full text-xs font-bold border border-[#9B7BFF]/20">多回合修正对话</span>
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
                      <h5 className="font-bold text-[#111827] mb-2">2. 安装 qwen3.5:9b 模型</h5>
                      <p className="text-sm text-[#6b7280] mb-2">打开终端或命令提示符，运行以下命令：</p>
                      <code className="block bg-[#111827] text-white p-3 rounded-lg text-sm font-mono shadow-inner">ollama run qwen3.5:9b</code>
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

