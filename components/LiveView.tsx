
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { decode, encode, decodeAudioData, createBlob } from '../utils/audio';

const LiveView: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState('Disconnected');
  const [transcription, setTranscription] = useState<string[]>([]);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startSession = async () => {
    try {
      setStatus('Connecting...');
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
      outAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
      
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setStatus('Live');
            setIsActive(true);
            const source = audioContextRef.current!.createMediaStreamSource(streamRef.current!);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              setTranscription(prev => [...prev.slice(-9), `AI: ${text}`]);
            }
            if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              setTranscription(prev => [...prev.slice(-9), `You: ${text}`]);
            }

            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outAudioContextRef.current) {
              const ctx = outAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              const buffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              source.addEventListener('ended', () => sourcesRef.current.delete(source));
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error('Live Error:', e);
            setStatus('Error');
            stopSession();
          },
          onclose: () => {
            setStatus('Disconnected');
            setIsActive(false);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
          },
          systemInstruction: 'You are a helpful conversational assistant. Keep your responses concise and natural for voice conversation.',
          inputAudioTranscription: {},
          outputAudioTranscription: {}
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setStatus('Failed to start');
    }
  };

  const stopSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsActive(false);
    setStatus('Disconnected');
    setTranscription([]);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Live Voice Conversation</h2>
          <p className="text-slate-400">Low-latency, real-time voice interaction with Gemini</p>
        </div>

        <div className="relative">
          <div 
            title={isActive ? "Active voice stream" : "Microphone inactive"}
            className={`w-48 h-48 mx-auto rounded-full border-4 flex items-center justify-center transition-all duration-500 ${
              isActive ? 'border-indigo-500 shadow-[0_0_50px_rgba(79,70,229,0.3)] bg-slate-900' : 'border-slate-800 bg-slate-900/50'
            }`}
          >
            {isActive ? (
              <div className="flex gap-1 items-end h-16">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-3 bg-indigo-500 rounded-full animate-pulse" 
                    style={{ 
                      height: `${20 + Math.random() * 80}%`,
                      animationDelay: `${i * 100}ms`,
                      animationDuration: '600ms'
                    }} 
                  />
                ))}
              </div>
            ) : (
              <svg className="w-16 h-16 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </div>
          <div className="mt-4 flex flex-col items-center">
            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
              status === 'Live' ? 'bg-green-500/10 text-green-500' : 
              status === 'Connecting...' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-slate-800 text-slate-500'
            }`}>
              {status}
            </span>
          </div>
        </div>

        <div className="min-h-[120px] bg-slate-900/40 rounded-2xl p-6 text-left border border-slate-800/50 shadow-inner">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Live Transcription</h3>
          <div className="space-y-2">
            {transcription.length === 0 ? (
              <p className="text-slate-600 italic text-sm">Conversation text will appear here...</p>
            ) : (
              transcription.map((line, i) => (
                <p key={i} className={`text-sm ${line.startsWith('AI:') ? 'text-indigo-300' : 'text-slate-300'}`}>
                  {line}
                </p>
              ))
            )}
          </div>
        </div>

        <button
          onClick={isActive ? stopSession : startSession}
          title={isActive ? "Terminate current session" : "Initialize new voice session"}
          className={`px-12 py-4 rounded-2xl font-bold text-lg transition-all transform active:scale-95 ${
            isActive 
              ? 'bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500 hover:text-white' 
              : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500'
          }`}
        >
          {isActive ? 'End Conversation' : 'Start Talking'}
        </button>
      </div>
    </div>
  );
};

export default LiveView;
