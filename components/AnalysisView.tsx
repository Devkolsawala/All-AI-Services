
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";

const AnalysisView: React.FC = () => {
  const [file, setFile] = useState<{data: string, type: 'image' | 'video'} | null>(null);
  const [analysis, setAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [prompt, setPrompt] = useState('Analyze this media in detail. What are the key objects, actions, and overall sentiment?');

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const isVideo = f.type.startsWith('video/');
    const reader = new FileReader();
    reader.onloadend = () => {
      setFile({ data: reader.result as string, type: isVideo ? 'video' : 'image' });
      setAnalysis('');
    };
    reader.readAsDataURL(f);
  };

  const startAnalysis = async () => {
    if (!file || isAnalyzing) return;
    setIsAnalyzing(true);
    setAnalysis('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Data = file.data.split(',')[1];
      const mimeType = file.type === 'video' ? 'video/mp4' : 'image/png';

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType } },
            { text: prompt }
          ]
        }
      });

      setAnalysis(response.text || 'No analysis provided.');
    } catch (err) {
      console.error(err);
      setAnalysis('Error occurred during analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">Deep Content Analysis</h2>
          <p className="text-slate-400">Gemini 3 Pro powered image & video understanding</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Upload Media</label>
                <div className="aspect-video bg-slate-800 rounded-xl border-2 border-dashed border-slate-700 flex items-center justify-center relative overflow-hidden group">
                  {file ? (
                    file.type === 'image' ? (
                      <img src={file.data} alt="Preview" className="w-full h-full object-contain" />
                    ) : (
                      <video src={file.data} className="w-full h-full object-contain" controls />
                    )
                  ) : (
                    <label className="cursor-pointer text-center p-4">
                      <svg className="w-10 h-10 text-slate-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                      <span className="text-slate-500 font-medium">Select Image or Video</span>
                      <input type="file" className="hidden" accept="image/*,video/*" onChange={handleUpload} />
                    </label>
                  )}
                  {file && (
                    <button onClick={() => setFile(null)} className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Analysis Instruction</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none h-24 resize-none text-sm"
                />
              </div>

              <button 
                onClick={startAnalysis}
                disabled={!file || isAnalyzing}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/20"
              >
                {isAnalyzing ? 'Analyzing Content...' : 'Run Analysis'}
              </button>
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl border border-slate-800 flex flex-col min-h-[400px]">
            <div className="p-4 border-b border-slate-800 bg-slate-800/30">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                AI Insights
              </h3>
            </div>
            <div className="flex-1 p-6">
              {isAnalyzing ? (
                <div className="h-full flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-slate-500 text-sm italic">Deconstructing media layers...</p>
                </div>
              ) : analysis ? (
                <div className="prose prose-invert max-w-none text-slate-300 whitespace-pre-wrap animate-in fade-in duration-700">
                  {analysis}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30 px-8">
                  <svg className="w-12 h-12 text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 2v-6m-8 13h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <p className="text-slate-400 italic">Select and upload a file to begin the deep intelligence scan</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisView;
