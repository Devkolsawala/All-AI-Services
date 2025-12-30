
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import { decode, decodeAudioData } from '../utils/audio';
import { Message } from '../types';

const FastAIView: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isProcessing]);

  const handleFastResponse = async (customPrompt?: string) => {
    const activePrompt = customPrompt || prompt;
    if (!activePrompt.trim() || isProcessing) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: activePrompt,
      timestamp: Date.now()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setPrompt('');
    setIsProcessing(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const apiContents = newMessages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

      const res = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: apiContents
      });

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.text || '',
        timestamp: Date.now()
      }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Error getting fast response.',
        timestamp: Date.now()
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTTS = async (text: string) => {
    if (!text || isSpeaking) return;
    setIsSpeaking(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const res = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Say clearly: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
        },
      });

      const audioData = res.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (audioData) {
        const ctx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
        const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.onended = () => setIsSpeaking(false);
        source.start();
      }
    } catch (err) {
      console.error("TTS Error:", err);
      setIsSpeaking(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <header className="px-8 py-6 border-b border-slate-200 dark:border-slate-800/50 flex justify-between items-center bg-white dark:bg-slate-950/20 backdrop-blur-md sticky top-0 z-10">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-3">
            <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Flash Core
          </h2>
          <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-widest">Model: Gemini 3 Flash Preview</p>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-10">
        <div className="max-w-4xl mx-auto space-y-12">
          {messages.length === 0 && (
            <div className="text-center space-y-4 py-12">
              <div className="inline-block px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-bold uppercase tracking-[0.2em]">
                Real-time Processing
              </div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Ultra-Fast Responses</h1>
              <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
                Powered by the latest Flash model for instant text generation and natural speech synthesis.
              </p>
            </div>
          )}

          <div className="space-y-6">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
                <div className={`max-w-[85%] group`}>
                  <div className={`relative px-6 py-4 rounded-3xl text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 rounded-tl-none'
                  }`}>
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    
                    {msg.role === 'assistant' && (
                      <div className="mt-4 flex justify-end">
                        <button 
                          onClick={() => handleTTS(msg.content)}
                          disabled={isSpeaking}
                          title="Speak this response"
                          className="p-2 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl transition-all disabled:opacity-50"
                        >
                          {isSpeaking ? (
                            <div className="flex gap-0.5 items-end h-3">
                              <div className="w-0.5 bg-indigo-500 animate-pulse" style={{ height: '40%' }} />
                              <div className="w-0.5 bg-indigo-500 animate-pulse" style={{ height: '100%', animationDelay: '0.1s' }} />
                              <div className="w-0.5 bg-indigo-500 animate-pulse" style={{ height: '60%', animationDelay: '0.2s' }} />
                            </div>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-900 rounded-3xl rounded-tl-none px-6 py-4 border border-slate-200 dark:border-slate-800 flex items-center gap-4 animate-pulse">
                  <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Computing...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-8 bg-gradient-to-t from-slate-50 dark:from-slate-950 via-transparent to-transparent">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Summarize Text', icon: 'M4 6h16M4 12h16M4 18h7' },
                { label: 'Grammar Polish', icon: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z' },
                { label: 'Instant Translate', icon: 'M3 5h12M9 3v2m1.048 9.5a18.022 18.022 0 01-3.83-4.994' }
              ].map((hint, i) => (
                <button 
                  key={i}
                  onClick={() => handleFastResponse(hint.label)}
                  className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl hover:border-indigo-500/30 transition-all group text-left"
                >
                  <svg className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={hint.icon} /></svg>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{hint.label}</span>
                </button>
              ))}
            </div>
          )}

          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-amber-500 rounded-2xl blur opacity-0 group-focus-within:opacity-10 transition duration-500"></div>
            <div className="relative flex items-center">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFastResponse()}
                placeholder="Ask for an instant response..."
                className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl py-5 pl-7 pr-28 border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-xl"
              />
              <button 
                onClick={() => handleFastResponse()}
                disabled={!prompt.trim() || isProcessing}
                className="absolute right-3 px-6 py-2.5 bg-indigo-600 text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-indigo-500 disabled:opacity-50 transition-all transform active:scale-95"
              >
                Fire
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FastAIView;
