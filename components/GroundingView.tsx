
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";

const GroundingView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'search' | 'maps'>('search');
  const [result, setResult] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [sources, setSources] = useState<{title?: string, uri: string}[]>([]);

  const handleSearch = async () => {
    if (!query.trim() || isSearching) return;
    setIsSearching(true);
    setResult('');
    setSources([]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      if (mode === 'search') {
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: query,
          config: { tools: [{ googleSearch: {} }] }
        });
        setResult(response.text || '');
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const webSources = chunks.filter((c: any) => c.web).map((c: any) => ({
          title: c.web.title,
          uri: c.web.uri
        }));
        setSources(webSources);
      } else {
        // Get user location for maps context if possible
        let location = { latitude: 37.78193, longitude: -122.40476 }; // Default SF
        try {
          const pos = await new Promise<GeolocationPosition>((res, rej) => navigator.geolocation.getCurrentPosition(res, rej));
          location = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        } catch (e) { console.warn("Geo blocked", e); }

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: query,
          config: {
            tools: [{ googleMaps: {} }],
            toolConfig: {
              retrievalConfig: {
                latLng: location
              }
            }
          }
        });
        setResult(response.text || '');
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const mapSources = chunks.filter((c: any) => c.maps).map((c: any) => ({
          title: c.maps.title || 'Place Details',
          uri: c.maps.uri
        }));
        setSources(mapSources);
      }
    } catch (err) {
      console.error(err);
      setResult("Encountered an error while grounding data.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950">
      <header className="px-6 py-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Spatial & Web Grounding
          </h2>
          <p className="text-sm text-slate-400">Verifiable answers using Google Search & Maps</p>
        </div>
        <div className="flex bg-slate-800 rounded-lg p-1">
          <button 
            onClick={() => setMode('search')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${mode === 'search' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Google Search
          </button>
          <button 
            onClick={() => setMode('maps')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${mode === 'maps' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Google Maps
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 max-w-4xl mx-auto w-full">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={mode === 'search' ? "Ask about recent events or complex news..." : "Find nearby restaurants, landmarks, or directions..."}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-6 pr-32 text-white shadow-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-slate-600"
          />
          <button 
            onClick={handleSearch}
            disabled={!query.trim() || isSearching}
            className="absolute right-2 top-2 bottom-2 px-6 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all"
          >
            {isSearching ? 'Searching...' : 'Explore'}
          </button>
        </div>

        {result && (
          <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="prose prose-invert max-w-none text-slate-200 leading-relaxed whitespace-pre-wrap">
              {result}
            </div>

            {sources.length > 0 && (
              <div className="pt-6 border-t border-slate-800">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Verification Sources</h3>
                <div className="flex flex-wrap gap-2">
                  {sources.map((s, i) => (
                    <a 
                      key={i} 
                      href={s.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg hover:bg-indigo-500/20 transition-all text-sm"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" /><path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" /></svg>
                      {s.title || 'View Source'}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroundingView;
