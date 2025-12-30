
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";

const VideoStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [uploadImage, setUploadImage] = useState<string | null>(null);

  const checkAndOpenKey = async () => {
    if (typeof window.aistudio?.hasSelectedApiKey === 'function') {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await window.aistudio.openSelectKey();
      }
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() && !uploadImage) return;
    setIsProcessing(true);
    setVideoUrl(null);

    try {
      await checkAndOpenKey();
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const payload: any = {
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: aspectRatio
        }
      };

      if (uploadImage) {
        payload.image = {
          imageBytes: uploadImage.split(',')[1],
          mimeType: 'image/png'
        };
      }

      let operation = await ai.models.generateVideos(payload);
      
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await videoResponse.blob();
        setVideoUrl(URL.createObjectURL(blob));
      }
    } catch (err) {
      console.error("Video Gen Error:", err);
      if (err instanceof Error && err.message.includes("Requested entity was not found")) {
        await window.aistudio.openSelectKey();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 overflow-y-auto p-8">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">Veo Video Studio</h2>
          <p className="text-slate-400">Generate high-quality cinematic videos from prompts or images</p>
        </div>

        <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Starting Image (Optional)</label>
                <div className="aspect-video rounded-2xl bg-slate-800 border-2 border-dashed border-slate-700 flex items-center justify-center overflow-hidden relative group">
                  {uploadImage ? (
                    <>
                      <img src={uploadImage} alt="Reference" className="w-full h-full object-cover" />
                      <button onClick={() => setUploadImage(null)} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <span className="text-white font-medium">Remove Image</span>
                      </button>
                    </>
                  ) : (
                    <label className="cursor-pointer text-center p-4">
                      <svg className="w-8 h-8 text-slate-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <span className="text-xs text-slate-500">Image-to-Video Mode</span>
                      <input type="file" className="hidden" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setUploadImage(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }} />
                    </label>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Video Prompt</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Cinematic drone shot of a futuristic neon forest..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none h-32 resize-none"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Format</label>
                  <div className="flex bg-slate-800 rounded-xl p-1">
                    <button 
                      onClick={() => setAspectRatio('16:9')}
                      className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${aspectRatio === '16:9' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                    >
                      Landscape
                    </button>
                    <button 
                      onClick={() => setAspectRatio('9:16')}
                      className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${aspectRatio === '9:16' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                    >
                      Portrait
                    </button>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleGenerate}
                disabled={isProcessing || (!prompt.trim() && !uploadImage)}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-indigo-600/20"
              >
                {isProcessing ? 'Generating Video (may take 1-2 mins)...' : 'Animate with Veo'}
              </button>
              
              <p className="text-[10px] text-slate-500 text-center">
                Note: Veo generations require a billing-enabled API key from Google AI Studio.
              </p>
            </div>

            <div className="bg-slate-800/50 rounded-2xl flex flex-col items-center justify-center p-4 border border-slate-800 overflow-hidden relative">
              {isProcessing ? (
                <div className="space-y-4 text-center">
                  <div className="relative w-20 h-20 mx-auto">
                    <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-white font-medium">Creating Cinematic AI Video</p>
                    <p className="text-xs text-slate-400 px-6">This takes about 60-90 seconds. We're rendering pixels from thin air!</p>
                  </div>
                </div>
              ) : videoUrl ? (
                <video src={videoUrl} controls autoPlay loop className="w-full h-full object-contain rounded-lg" />
              ) : (
                <div className="text-center space-y-4 opacity-50">
                  <svg className="w-16 h-16 text-slate-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  <p className="text-slate-400 text-sm">Generated video preview</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoStudio;
