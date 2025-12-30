
import React, { useState } from 'react';
import { ToolType } from './types';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import LiveView from './components/LiveView';
import ImageStudio from './components/ImageStudio';
import VideoStudio from './components/VideoStudio';
import GroundingView from './components/GroundingView';
import AnalysisView from './components/AnalysisView';
import FastAIView from './components/FastAIView';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolType>(ToolType.CHAT);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
    <div className="flex h-screen w-full bg-slate-950 text-slate-200 overflow-hidden selection:bg-indigo-500/30">
      <Sidebar 
        activeTool={activeTool} 
        onToolSelect={setActiveTool} 
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-900/50 via-slate-950 to-slate-950">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
        <div key={activeTool} className="flex-1 flex flex-col h-full animate-in fade-in slide-in-from-right-2 duration-500 ease-out">
          {renderActiveTool()}
        </div>
      </main>
    </div>
  );
};

export default App;
