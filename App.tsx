
import React, { useState, useEffect } from 'react';
import { ToolType, Theme } from './types';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import LiveView from './components/LiveView';
import ImageStudio from './components/ImageStudio';
import VideoStudio from './components/VideoStudio';
import GroundingView from './components/GroundingView';
import AnalysisView from './components/AnalysisView';
import FastAIView from './components/FastAIView';
import Onboarding from './components/Onboarding';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolType>(ToolType.CHAT);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('omni-theme');
    return (saved as Theme) || 'dark';
  });
  const [showTour, setShowTour] = useState(() => !localStorage.getItem('omni-tour-seen'));

  useEffect(() => {
    localStorage.setItem('omni-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  const closeTour = () => {
    setShowTour(false);
    localStorage.setItem('omni-tour-seen', 'true');
  };

  const renderActiveTool = () => {
    switch (activeTool) {
      case ToolType.CHAT: return <ChatView />;
      case ToolType.LIVE: return <LiveView />;
      case ToolType.IMAGE_STUDIO: return <ImageStudio />;
      case ToolType.VIDEO_STUDIO: return <VideoStudio />;
      case ToolType.GROUNDING: return <GroundingView />;
      case ToolType.ANALYSIS: return <AnalysisView />;
      case ToolType.FAST_AI: return <FastAIView />;
      default: return <ChatView />;
    }
  };

  return (
    <div className={`flex h-screen w-full transition-colors duration-500 ${theme === 'dark' ? 'bg-slate-950 text-slate-200' : 'bg-slate-50 text-slate-900'} overflow-hidden selection:bg-indigo-500/30`}>
      <Sidebar 
        activeTool={activeTool} 
        onToolSelect={setActiveTool} 
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-900/50 via-slate-950/20 to-transparent dark:from-slate-900/50 dark:via-slate-950 dark:to-slate-950">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
        <div key={activeTool} className="flex-1 flex flex-col h-full animate-in fade-in slide-in-from-right-2 duration-500 ease-out">
          {renderActiveTool()}
        </div>
      </main>

      {showTour && <Onboarding onClose={closeTour} />}
    </div>
  );
};

export default App;
