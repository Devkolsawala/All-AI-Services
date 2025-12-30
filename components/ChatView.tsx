
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message } from '../types';

const ChatView: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: 'Hello! I am Gemini 3 Pro. I can handle complex tasks and even "think" through difficult problems. How can I help you today?', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [useThinkingMode, setUseThinkingMode] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isThinking]);

  const handleSend = async () => {
    if (!input.trim() || isThinking) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsThinking(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const config: any = { temperature: 0.7 };

      if (useThinkingMode) {
        config.thinkingConfig = { thinkingBudget: 32768 };
      }

      // Maintain multi-turn context by mapping internal messages to API structured content
      // We skip the first message if it's the assistant's greeting to ensure the model sees a user turn first
      const apiContents = newMessages
        .filter((m, i) => !(i === 0 && m.role === 'assistant'))
        .map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        }));

      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: apiContents,
        config: config
      });

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text || "I couldn't generate a response.",
        timestamp: Date.now()
      }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Sorry, I encountered an error. Please check your connection or try again later.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="px-8 py-6 border-b border-slate-200 dark:border-slate-800/50 flex justify-between items-center bg-white/20 dark:bg-slate-950/20 backdrop-blur-md sticky top-0 z-10">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
            </span>
            Deep Intelligence Chat
          </h2>
          <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-widest">Model: Gemini 3 Pro Preview</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3" title="Enable deep reasoning for complex problems (consumes more tokens)">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Reasoning Mode</span>
            <button 
              onClick={() => setUseThinkingMode(!useThinkingMode)}
              className={`w-11 h-6 rounded-full p-1 transition-all duration-300 relative border ${useThinkingMode ? 'bg-indigo-600 border-indigo-500' : 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${useThinkingMode ? 'translate-x-5' : 'translate-x-0 shadow-sm'}`} />
            </button>
          </div>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-10 space-y-8 scroll-smooth">
        <div className="max-w-4xl mx-auto space-y-10">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
              <div className={`max-w-[85%] sm:max-w-[70%] group`}>
                <div className={`relative px-5 py-4 rounded-3xl text-sm leading-relaxed shadow-lg ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-tr-none' 
                    : 'bg-white dark:bg-slate-900/60 backdrop-blur-sm text-slate-900 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-tl-none ring-1 ring-white/5'
                }`}>
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
                <div className={`flex items-center gap-2 mt-2 px-1 text-[10px] font-bold text-slate-500 uppercase tracking-tighter ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <span>{msg.role === 'user' ? 'You' : 'Gemini'}</span>
                  <span className="opacity-40">•</span>
                  <span className="opacity-40">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>
          ))}
          {isThinking && (
            <div className="flex justify-start animate-pulse">
              <div className="bg-white dark:bg-slate-900/40 text-slate-400 rounded-3xl rounded-tl-none px-6 py-4 border border-slate-200 dark:border-slate-800/50 flex items-center gap-4 shadow-sm">
                <div className="flex gap-1.5">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest">{useThinkingMode ? 'Deep Reasoning...' : 'Processing...'}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-8 pb-10 pt-2 bg-gradient-to-t from-slate-50 dark:from-slate-950 via-transparent to-transparent">
        <div className="max-w-4xl mx-auto relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-0 group-focus-within:opacity-20 transition duration-500"></div>
          <div className="relative flex items-center">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Ask me anything complex..."
              className="w-full bg-white dark:bg-slate-900/80 backdrop-blur-xl text-slate-900 dark:text-white rounded-2xl py-4 pl-6 pr-16 border border-slate-200 dark:border-white/5 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-xl dark:shadow-2xl"
              rows={1}
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isThinking}
              title="Send Message (Enter)"
              className="absolute right-3 p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 dark:disabled:text-slate-600 disabled:cursor-not-allowed transition-all transform active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
