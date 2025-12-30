
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Message } from '../types';

const GroundingView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'search' | 'maps'>('search');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isSearching]);

  const handleSearch = async () => {
    if (!query.trim() || isSearching) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: Date.now()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setQuery('');
    setIsSearching(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const apiContents = newMessages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

      if (mode === 'search') {
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: apiContents,
          config: { tools: [{ googleSearch: {} }] }
        });

        const text = response.text || '';
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const webSources = chunks.filter((c: any) => c.web).map((c: any) => ({
          title: c.web.title,
          uri: c.web.uri
        }));

        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: text,
          timestamp: Date.now(),
          grounding: webSources
        }]);
      } else {
        let location = { latitude: 37.78193, longitude: -122.40476 }; // Default SF
        try {
          const pos = await new Promise<GeolocationPosition>((res, rej) => navigator.geolocation.getCurrentPosition(res, rej));
          location = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        } catch (e) { console.warn("Geo blocked", e); }

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: apiContents,
          config: {
            tools: [{ googleMaps: {} }],
            toolConfig: {
              retrievalConfig: {
                latLng: location
              }
            }
          }
        });

        const text = response.text || '';
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const mapSources = chunks.filter((c: any) => c.maps).map((c: any) => ({
          title: c.maps.title || 'Place Details',
          uri: c.maps.uri
        }));

        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: text,
          timestamp: Date.now(),
          grounding: mapSources
        }]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Encountered an error while grounding data.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950">
      <header className="px-8 py-6 border-b border-slate-200 dark:border-slate-800 bg-white/20 dark:bg-slate-900/50 backdrop-blur-sm flex justify-between items-center z-10">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Spatial & Web Grounding
          </h2>
          <p className="text-sm text-slate-500">Verifiable answers using Google Search & Maps</p>
        </div>
        <div className="flex bg-slate-200 dark:bg-slate-800 rounded-xl p-1 shadow-inner border border-slate-300 dark:border-slate-700">
          <button 
            onClick={() => setMode('search')}
            title="Search verified real-time web content"
            className={`px-6 py-1.5 rounded-lg text-sm font-bold transition-all ${mode === 'search' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            Google Search
          </button>
          <button 
            onClick={() => setMode('maps')}
            title="Explore geographic and location-based data"
            className={`px-6 py-1.5 rounded-lg text-sm font-bold transition-all ${mode === 'maps' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            Google Maps
          </button>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-10 space-y-8 scroll-smooth">
        <div className="max-w-4xl mx-auto space-y-10">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 opacity-30">
              <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mb-4">
                 <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">Start a grounded session</p>
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
              <div className={`max-w-[85%] group`}>
                <div className={`relative px-6 py-5 rounded-3xl text-sm leading-relaxed shadow-lg ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-tr-none' 
                    : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-tl-none ring-1 ring-white/5'
                }`}>
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                  
                  {msg.grounding && msg.grounding.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Verification Sources</h4>
                      <div className="flex flex-wrap gap-2">
                        {msg.grounding.map((s, i) => (
                          <a 
                            key={i} 
                            href={s.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/10 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-500/10 dark:hover:bg-indigo-500/20 transition-all text-[11px] font-bold"
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" /><path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" /></svg>
                            {s.title || 'View Source'}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isSearching && (
            <div className="flex justify-start">
               <div className="bg-white dark:bg-slate-900 rounded-3xl rounded-tl-none px-8 py-5 border border-slate-200 dark:border-slate-800 flex items-center gap-4 shadow-sm animate-pulse">
                <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{mode === 'search' ? 'Accessing Web Data...' : 'Querying Location Services...'}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-8 pb-10 pt-2 bg-gradient-to-t from-slate-50 dark:from-slate-950 via-transparent to-transparent">
        <div className="max-w-4xl mx-auto relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-2xl blur opacity-0 group-focus-within:opacity-20 transition duration-500"></div>
          <div className="relative flex items-center">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={mode === 'search' ? "Ask about recent events or complex news..." : "Find nearby restaurants, landmarks, or directions..."}
              className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl py-5 pl-7 pr-32 border border-slate-200 dark:border-white/5 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-xl"
            />
            <button 
              onClick={handleSearch}
              disabled={!query.trim() || isSearching}
              title="Execute grounded exploration"
              className="absolute right-3 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95"
            >
              {isSearching ? '...' : 'Explore'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroundingView;
