import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Copy, Check, Loader2, X } from 'lucide-react';
import { analyzeImagePrompt } from '../lib/gemini';
import { motion, AnimatePresence } from 'motion/react';

interface DemoImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function DemoImage({ src, alt, className = '' }: DemoImageProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [promptData, setPromptData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'zh' | 'noOutfit'>('zh');
  const [copied, setCopied] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleAnalyze = async () => {
    setShowCard(true);
    if (promptData) return; // Already analyzed

    setIsLoading(true);
    try {
      // Fetch the image and convert to base64
      const response = await fetch(src);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        const base64Image = base64data.split(',')[1];
        const mimeType = blob.type;
        
        try {
          const apiKey = process.env.GEMINI_API_KEY;
          const result = await analyzeImagePrompt(base64Image, mimeType, apiKey || "");
          setPromptData(result);
        } catch (err) {
          console.error("Failed to analyze image:", err);
          // Handle error state if needed
        } finally {
          setIsLoading(false);
        }
      };
    } catch (err) {
      console.error("Failed to fetch image:", err);
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!promptData) return;
    const data = promptData[activeTab];
    const textToCopy = [
      `风格与效果: ${data.part1}`,
      `光影与机位: ${data.part2}`,
      `主体与姿态: ${data.part3}`,
      `主色与氛围: ${data.part4}`,
      `背景与空间: ${data.part5}`,
      `道具与互动: ${data.part6}`,
      `动作与细节: ${data.part7}`,
      `穿搭与风格: ${data.part8}`,
      `特殊效果: ${data.part9}`
    ].join('\n');

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img 
        ref={imageRef}
        src={src} 
        alt={alt} 
        className={`rounded-lg shadow-md ${className}`}
        crossOrigin="anonymous"
      />

      {/* Hover Button */}
      <AnimatePresence>
        {isHovered && !showCard && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={handleAnalyze}
            className="absolute top-4 right-4 bg-zinc-900/70 hover:bg-zinc-800/80 text-white p-2 rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.4),0_0_20px_rgba(139,92,246,0.2)] backdrop-blur-xl border border-white/10 transition-colors flex items-center gap-2 group"
          >
            <span className="text-lg leading-none pl-1">🦆</span>
            <span className="text-sm font-medium pr-2 whitespace-nowrap overflow-hidden max-w-0 group-hover:max-w-[120px] transition-all duration-300 ease-in-out">
              AI Prompt
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Result Card */}
      <AnimatePresence>
        {showCard && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute top-0 left-[calc(100%+1rem)] w-[400px] bg-zinc-900/65 backdrop-blur-3xl rounded-3xl shadow-[0_0_0_1px_rgba(255,255,255,0.05)_inset,0_24px_64px_rgba(0,0,0,0.6),0_0_80px_rgba(139,92,246,0.15)] z-50 overflow-hidden flex flex-col max-h-[600px]"
          >
            {/* Diffuse Background */}
            <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] pointer-events-none -z-10" style={{
              background: 'radial-gradient(circle at 50% 0%, rgba(139, 92, 246, 0.15), transparent 50%), radial-gradient(circle at 100% 100%, rgba(56, 189, 248, 0.1), transparent 50%)'
            }} />

            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/5 bg-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center border border-purple-500/30 text-lg">
                  🦆
                </div>
                <h3 className="font-bold text-zinc-100">AI Prompt Analyzer</h3>
              </div>
              <button 
                onClick={() => setShowCard(false)}
                className="p-1.5 hover:bg-white/10 rounded-xl transition-all text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
                    <Sparkles className="w-4 h-4 text-purple-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                  </div>
                  <p className="text-sm font-bold text-zinc-400 animate-pulse uppercase tracking-widest">Analyzing Image...</p>
                </div>
              ) : promptData ? (
                <div className="space-y-5">
                  {/* Tabs */}
                  <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
                    <button
                      onClick={() => setActiveTab('zh')}
                      className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${activeTab === 'zh' ? 'bg-white text-black shadow-xl' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                      详细解析
                    </button>
                    <button
                      onClick={() => setActiveTab('noOutfit')}
                      className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${activeTab === 'noOutfit' ? 'bg-white text-black shadow-xl' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                      角色动作
                    </button>
                  </div>

                  {/* Prompt Data */}
                  <div className="space-y-3">
                    <PromptPart icon="🎨" title="风格与效果" content={promptData[activeTab].part1} />
                    <PromptPart icon="💡" title="光影与机位" content={promptData[activeTab].part2} />
                    <PromptPart icon="👤" title="主体与姿态" content={promptData[activeTab].part3} />
                    <PromptPart icon="🌈" title="主色与氛围" content={promptData[activeTab].part4} />
                    <PromptPart icon="🏔️" title="背景与空间" content={promptData[activeTab].part5} />
                    <PromptPart icon="🎒" title="道具与互动" content={promptData[activeTab].part6} />
                    <PromptPart icon="🔍" title="动作与细节" content={promptData[activeTab].part7} />
                    <PromptPart icon="👕" title="穿搭与风格" content={promptData[activeTab].part8} />
                    <PromptPart icon="✨" title="特殊效果" content={promptData[activeTab].part9} />
                  </div>
                </div>
              ) : (
                <div className="text-center text-zinc-500 py-12 bg-white/5 rounded-3xl border border-white/5">
                  <p className="font-bold">Failed to analyze image.</p>
                  <p className="text-xs mt-1">Please check your API Key and try again.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {promptData && !isLoading && (
              <div className="p-5 border-t border-white/5 bg-white/5">
                <button
                  onClick={handleCopy}
                  className="w-full flex items-center justify-center gap-3 bg-white hover:bg-zinc-200 text-black py-3.5 rounded-2xl font-black transition-all shadow-xl shadow-white/5 active:scale-[0.98]"
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  {copied ? (activeTab === 'zh' ? '已复制到剪贴板' : 'Copied to Clipboard') : (activeTab === 'zh' ? '一键复制提示词' : 'Copy Full Prompt')}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PromptPart({ icon, title, content }: { icon: string, title: string, content: string }) {
  return (
    <div className="bg-white/5 rounded-2xl p-4 border border-white/5 hover:border-white/10 transition-colors group">
      <div className="font-bold text-zinc-100 mb-2 flex items-center gap-2">
        <span className="text-sm filter drop-shadow-[0_0_4px_rgba(255,255,255,0.1)]">{icon}</span>
        <span className="text-xs uppercase tracking-widest text-zinc-400 group-hover:text-zinc-200 transition-colors">{title}</span>
      </div>
      <div className="text-zinc-300 text-sm leading-relaxed font-medium">
        {content}
      </div>
    </div>
  );
}
