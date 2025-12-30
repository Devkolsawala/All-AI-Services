
import React, { useState } from 'react';

interface OnboardingProps {
  onClose: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onClose }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Omni-Suite",
      description: "Experience the full power of Gemini in one dashboard. From creative generation to deep intelligence.",
      icon: "✨"
    },
    {
      title: "Multimodal Intelligence",
      description: "Chat with Gemini 3 Pro for complex reasoning, or use Live Voice for natural real-time conversations.",
      icon: "🧠"
    },
    {
      title: "Creative Studios",
      description: "Generate pro-grade images with Nano Banana or cinematic videos with Veo 3.1.",
      icon: "🎨"
    },
    {
      title: "Verified Grounding",
      description: "Get answers backed by Google Search and location data from Google Maps for absolute accuracy.",
      icon: "🌍"
    }
  ];

  const nextStep = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-500">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 shadow-2xl border border-slate-200 dark:border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <div className="text-8xl">{steps[step].icon}</div>
        </div>
        
        <div key={step} className="space-y-6 relative animate-in slide-in-from-right-4 fade-in duration-500">
          <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-3xl">
            {steps[step].icon}
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{steps[step].title}</h2>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              {steps[step].description}
            </p>
          </div>
          
          <div className="pt-6 flex items-center justify-between">
            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-indigo-500' : 'w-2 bg-slate-200 dark:bg-slate-700'}`} />
              ))}
            </div>
            <button 
              onClick={nextStep}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20 transform active:scale-95"
            >
              {step === steps.length - 1 ? 'Start Exploration' : 'Continue'}
            </button>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
