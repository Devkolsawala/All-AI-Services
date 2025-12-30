
import React, { useState } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import { decode, decodeAudioData } from '../utils/audio';

const FastAIView: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleFastResponse = async () => {
    if (!prompt.trim() || isProcessing) return;
    setIsProcessing(true);
    setResponse('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const res = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      setResponse(res.text || '');
    } catch (err) {
      console.error(err);
      setResponse('Error getting fast response.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTTS = async () => {
    if (!response || isSpeaking) return;
    setIsSpeaking(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const res = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Say clearly: ${response}` }] }],
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
    <div className="flex flex-col h-full overflow-hidden">
      <header className="px-8 py-6 border-b border-slate-800/50 flex justify-between items-center bg-slate-950/20 backdrop-blur-md sticky top-0 z-10">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center gap-3">
            <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Flash Core
          </h2>
          <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-widest">Model: Gemini 3 Flash Preview</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-8 py-10">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <div className="inline-block px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full text-[10px] font-bold uppercase tracking-[0.2em]">
              Real-time Processing
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Ultra-Fast Responses</h1>
            <p className="text-slate-400 max-w-xl mx-auto leading-relaxed">
              Powered by the latest Flash model for instant text generation and natural speech synthesis. Perfect for translations, summaries, and quick questions.
            </p>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-sm rounded-[2.5rem] p-10 border border-white/5 shadow-2xl ring-1 ring-white/5 space-y-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
              <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.047a1 1 0 01.897.95l1.046 9.414 4.103-4.103a1 1 0 011.663.393L20 12.5a1 1 0 01-1.22 1.22L12.5 11.233a1 1 0 01-.393-1.663l4.103-4.103-9.414-1.046a1 1 0 01-.95-.897L5.047.8l9.414 1.046z" clipRule="evenodd" />
              </svg>
            </div>

            <div className="space-y-6 relative">
              <div className="space-y-4">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] ml-2">Quick Prompt</label>
                <div className="relative group">
                   <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-amber-500 rounded-2xl blur opacity-0 group-focus-within:opacity-20 transition duration-500"></div>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleFastResponse()}
                      placeholder="e.g. Translate 'Hello world' to Japanese..."
                      className="w-full bg-slate-800/80 backdrop-blur-xl border border-white/10 rounded-2xl py-5 pl-7 pr-28 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
                    />
                    <button 
                      onClick={handleFastResponse}
                      disabled={!prompt.trim() || isProcessing}
                      className="absolute right-3 px-6 py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transition-all transform active:scale-95"
                    >
                      {isProcessing ? 'Thinking' : 'Fire'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="min-h-[220px] bg-slate-950/60 rounded-[2rem] p-8 border border-white/5 flex flex-col shadow-inner relative group/res">
                {isProcessing ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-4 text-slate-500">
                    <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-bold uppercase tracking-[0.3em] animate-pulse">Computing...</span>
                  </div>
                ) : response ? (
                  <div className="flex-1 flex flex-col justify-between animate-in fade-in slide-in-from-bottom-2 duration-700">
                    <p className="text-lg text-indigo-50 font-medium leading-relaxed tracking-tight">{response}</p>
                    <div className="mt-8 flex justify-end">
                      <button 
                        onClick={handleTTS}
                        disabled={isSpeaking}
                        className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all border shadow-lg ${
                          isSpeaking 
                            ? 'bg-indigo-600 text-white border-indigo-500' 
                            : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border-white/10'
                        }`}
                      >
                        {isSpeaking ? (
                          <>
                            <div className="flex gap-1 items-end h-3">
                              <div className="w-1 bg-white rounded-full animate-wave" style={{ animationDelay: '0s' }} />
                              <div className="w-1 bg-white rounded-full animate-wave" style={{ animationDelay: '0.1s' }} />
                              <div className="w-1 bg-white rounded-full animate-wave" style={{ animationDelay: '0.2s' }} />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest">Speaking</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            </svg>
                            <span className="text-xs font-bold uppercase tracking-widest">Synthesize Audio</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-center">
                    <div className="max-w-[180px] space-y-3 opacity-20 group-hover/res:opacity-40 transition-opacity duration-500">
                      <svg className="w-12 h-12 mx-auto text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 leading-relaxed">System Idle<br/>Awaiting Input</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { label: 'Summarize Text', icon: 'M4 6h16M4 12h16M4 18h7' },
              { label: 'Grammar Polish', icon: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z' },
              { label: 'Instant Translation', icon: 'M3 5h12M9 3v2m1.048 9.5a18.022 18.022 0 01-3.83-4.994m-2.536 1.649A18.019 18.019 0 015 5c2.147 0 4.225.38 6.152 1.075M3 5h12M9 3v2m1.048 9.5a18.022 18.022 0 01-3.83-4.994m-2.536 1.649A18.019 18.019 0 015 5c2.147 0 4.225.38 6.152 1.075' }
            ].map((hint, i) => (
              <button 
                key={i}
                onClick={() => setPrompt(hint.label)}
                className="flex items-center justify-center gap-3 p-5 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.05] hover:border-indigo-500/30 transition-all group"
              >
                <svg className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={hint.icon} />
                </svg>
                <span className="text-xs font-bold text-slate-500 group-hover:text-slate-200 transition-colors uppercase tracking-widest">{hint.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes wave {
          0%, 100% { height: 4px; }
          50% { height: 12px; }
        }
        .animate-wave {
          animation: wave 1s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default FastAIView;
