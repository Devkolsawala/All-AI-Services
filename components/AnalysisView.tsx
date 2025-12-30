
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Message } from '../types';

const AnalysisView: React.FC = () => {
  const [file, setFile] = useState<{data: string, type: 'image' | 'video', mimeType: string} | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isAnalyzing]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const isVideo = f.type.startsWith('video/');
    const reader = new FileReader();
    reader.onloadend = () => {
      setFile({ 
        data: reader.result as string, 
        type: isVideo ? 'video' : 'image',
        mimeType: f.type
      });
      setMessages([]); // Reset conversation when a new file is uploaded
    };
    reader.readAsDataURL(f);
  };

  const handleSend = async () => {
    if ((!input.trim() && messages.length > 0) || !file || isAnalyzing) return;
    
    const userPrompt = input.trim() || 'Analyze this media in detail. What are the key objects, actions, and overall sentiment?';
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userPrompt,
      timestamp: Date.now()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsAnalyzing(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Data = file.data.split(',')[1];

      // Construct history
      const apiContents = newMessages.map((m, idx) => {
        const parts: any[] = [{ text: m.content }];
        // Add media only to the very first turn to set context
        if (idx === 0 && m.role === 'user') {
          parts.unshift({ inlineData: { data: base64Data, mimeType: file.mimeType } });
        }
        return {
          role: m.role === 'user' ? 'user' : 'model',
          parts
        };
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: apiContents
      });

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text || 'No analysis provided.',
        timestamp: Date.now()
      }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Error occurred during analysis conversation.',
        timestamp: Date.now()
      }]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <header className="px-8 py-6 border-b border-slate-200 dark:border-slate-800 bg-white/20 dark:bg-slate-900/50 backdrop-blur-sm flex justify-between items-center z-10">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 2v-6m-8 13h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            Deep Content Analysis
          </h2>
          <p className="text-sm text-slate-500">Multimodal reasoning with Gemini 3 Pro</p>
        </div>
        <div className="flex items-center gap-4">
          <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            {file ? 'Replace Media' : 'Upload Media'}
            <input type="file" className="hidden" accept="image/*,video/*" onChange={handleUpload} />
          </label>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        {/* Media Preview Panel */}
        <div className="lg:w-1/3 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 bg-slate-100/30 dark:bg-slate-900/20 p-6 flex flex-col gap-4">
          <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Active Context</h3>
          <div className="flex-1 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative shadow-inner">
            {file ? (
              file.type === 'image' ? (
                <img src={file.data} alt="Preview" className="w-full h-full object-contain" />
              ) : (
                <video src={file.data} className="w-full h-full object-contain" controls />
              )
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-30">
                <svg className="w-12 h-12 text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">No Media Loaded</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Panel */}
        <div className="flex-1 flex flex-col h-full">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center opacity-20">
                <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">Awaiting Analysis Thread</p>
              </div>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
                <div className={`max-w-[90%] lg:max-w-[80%] rounded-3xl px-5 py-4 text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none'
                }`}>
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
              </div>
            ))}
            {isAnalyzing && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-900 rounded-3xl rounded-tl-none px-6 py-4 border border-slate-200 dark:border-slate-800 flex items-center gap-4 animate-pulse">
                  <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Reasoning...</span>
                </div>
              </div>
            )}
          </div>

          <div className="p-8 pt-0">
            <div className="relative group">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                disabled={!file || isAnalyzing}
                placeholder={messages.length === 0 ? "Ask for a detailed analysis..." : "Ask follow-up questions about this media..."}
                className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl py-4 pl-6 pr-32 border border-slate-200 dark:border-white/5 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-xl disabled:opacity-50"
              />
              <button 
                onClick={handleSend}
                disabled={!file || isAnalyzing || (!input.trim() && messages.length > 0)}
                className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95"
              >
                {messages.length === 0 ? 'Analyze' : 'Ask'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisView;
