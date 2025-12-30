
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { GenerationConfig } from '../types';

const ImageStudio: React.FC = () => {
  const [mode, setMode] = useState<'generate' | 'edit'>('generate');
  const [prompt, setPrompt] = useState('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadImage, setUploadImage] = useState<string | null>(null);
  
  const [config, setConfig] = useState<GenerationConfig>({
    aspectRatio: "1:1",
    imageSize: "1K"
  });

  const handleGenerate = async () => {
    if (!prompt.trim() || isProcessing) return;
    setIsProcessing(true);
    setGeneratedImageUrl(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: { parts: [{ text: prompt }] },
        config: { imageConfig: config },
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          setGeneratedImageUrl(`data:image/png;base64,${part.inlineData.data}`);
          break;
        }
      }
    } catch (err) {
      console.error("Image Gen Error:", err);
      alert("Failed to generate image.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEdit = async () => {
    if (!uploadImage || !prompt.trim() || isProcessing) return;
    setIsProcessing(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: uploadImage.split(',')[1], mimeType: 'image/png' } },
            { text: prompt }
          ]
        }
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          setGeneratedImageUrl(`data:image/png;base64,${part.inlineData.data}`);
          break;
        }
      }
    } catch (err) {
      console.error("Image Edit Error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setUploadImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="px-8 py-6 border-b border-slate-800/50 flex justify-between items-center bg-slate-950/20 backdrop-blur-md z-10">
        <div>
          <h2 className="text-xl font-semibold text-white">Visual Synthesis</h2>
          <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-widest">Model: Gemini 3 Pro Vision</p>
        </div>
        <div className="flex bg-slate-900/50 backdrop-blur-md rounded-2xl p-1.5 border border-white/5 ring-1 ring-white/5">
          <button 
            onClick={() => { setMode('generate'); setGeneratedImageUrl(null); }}
            className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${mode === 'generate' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Create
          </button>
          <button 
            onClick={() => { setMode('edit'); setGeneratedImageUrl(null); }}
            className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${mode === 'edit' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Refine
          </button>
        </div>
      </header>

      <div className="flex-1 p-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-10 overflow-hidden">
        <div className="flex flex-col gap-6 overflow-y-auto pr-4 scrollbar-hide">
          <div className="bg-slate-900/40 backdrop-blur-sm rounded-[2rem] p-8 border border-white/5 space-y-8 ring-1 ring-white/5">
            {mode === 'edit' && (
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Source Reference</label>
                <div className="relative group aspect-square rounded-3xl bg-slate-950/80 border border-white/5 overflow-hidden flex items-center justify-center ring-1 ring-white/5 transition-all hover:ring-indigo-500/30">
                  {uploadImage ? (
                    <>
                      <img src={uploadImage} alt="Upload" className="w-full h-full object-cover" />
                      <button onClick={() => setUploadImage(null)} className="absolute top-4 right-4 p-2 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-red-500 transition-all border border-white/10">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center p-8 group/upload">
                      <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mb-4 border border-white/5 group-hover/upload:border-indigo-500/30 transition-all">
                        <svg className="w-8 h-8 text-slate-600 group-hover/upload:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Select Base Image</span>
                      <input type="file" className="hidden" accept="image/*" onChange={onFileChange} />
                    </label>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">{mode === 'generate' ? 'Creative Prompt' : 'Instructional Overlay'}</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={mode === 'generate' ? "Cyberpunk landscape, vibrant neon, volumetric fog, 8k..." : "Change the sky to a blood-red sunset..."}
                className="w-full bg-slate-950/60 border border-white/5 rounded-3xl p-6 text-sm text-white focus:ring-1 focus:ring-indigo-500/50 focus:outline-none h-40 resize-none leading-relaxed placeholder:text-slate-700 transition-all"
              />
            </div>

            {mode === 'generate' && (
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Display Format</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["1:1", "4:3", "16:9"].map(ratio => (
                      <button 
                        key={ratio}
                        onClick={() => setConfig({...config, aspectRatio: ratio as any})}
                        className={`py-2 rounded-xl text-[10px] font-bold transition-all border ${config.aspectRatio === ratio ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950/40 border-white/5 text-slate-500 hover:text-slate-300'}`}
                      >
                        {ratio}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <button 
              onClick={mode === 'generate' ? handleGenerate : handleEdit}
              disabled={isProcessing || !prompt.trim() || (mode === 'edit' && !uploadImage)}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold py-5 rounded-[1.5rem] transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 group active:scale-95"
            >
              {isProcessing ? (
                <>
                   <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                   <span className="text-xs uppercase tracking-[0.2em]">Processing Synth</span>
                </>
              ) : (
                <>
                   <span className="text-xs uppercase tracking-[0.2em]">{mode === 'generate' ? 'Render Manifestation' : 'Execute Modification'}</span>
                   <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-col h-full overflow-hidden">
          <div className="flex-1 bg-slate-900/20 backdrop-blur-sm rounded-[3rem] border border-white/5 ring-1 ring-white/5 flex items-center justify-center relative overflow-hidden group/canvas shadow-[inset_0_0_80px_rgba(0,0,0,0.5)]">
            {isProcessing ? (
              <div className="flex flex-col items-center gap-6 animate-pulse">
                <div className="relative">
                  <div className="w-20 h-20 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                     <div className="w-10 h-10 bg-indigo-500/10 rounded-full blur-lg"></div>
                  </div>
                </div>
                <div className="text-center space-y-1">
                   <p className="text-sm font-black text-white uppercase tracking-[0.3em]">Latent Space Scan</p>
                   <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Mapping Neurons...</p>
                </div>
              </div>
            ) : generatedImageUrl ? (
              <div className="w-full h-full p-10 animate-in zoom-in-95 duration-1000 ease-out">
                <img src={generatedImageUrl} alt="Generated" className="w-full h-full object-contain rounded-3xl shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-white/5" />
                <div className="absolute top-8 right-8 flex gap-3 opacity-0 group-hover/canvas:opacity-100 transition-all duration-500 translate-y-2 group-hover/canvas:translate-y-0">
                  <a 
                    href={generatedImageUrl} 
                    download="gemini-visual.png"
                    className="p-4 bg-slate-900/80 backdrop-blur-xl hover:bg-indigo-600 text-white rounded-2xl transition-all border border-white/10 shadow-2xl"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center px-12 space-y-6">
                <div className="w-28 h-28 bg-slate-950/80 rounded-[2.5rem] flex items-center justify-center mx-auto ring-1 ring-white/5 shadow-2xl transition-transform duration-700 group-hover/canvas:scale-110">
                  <svg className="w-12 h-12 text-indigo-500/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <div className="space-y-2">
                   <h3 className="text-white font-bold text-lg tracking-tight uppercase tracking-[0.1em]">Awaiting Creation</h3>
                   <p className="text-slate-500 text-[11px] max-w-[240px] mx-auto font-medium leading-relaxed uppercase tracking-widest">Provide parameters to generate a new high-fidelity visual entity</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageStudio;
