
import React from 'react';
import { ToolType } from '../types';

interface SidebarProps {
  activeTool: ToolType;
  onToolSelect: (tool: ToolType) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTool, onToolSelect, isOpen, onToggle }) => {
  const tools = [
    { id: ToolType.CHAT, label: 'Intelligence', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
    { id: ToolType.LIVE, label: 'Live Voice', icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z' },
    { id: ToolType.IMAGE_STUDIO, label: 'Imaging', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: ToolType.VIDEO_STUDIO, label: 'Cinematics', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
    { id: ToolType.GROUNDING, label: 'Grounding', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z' },
    { id: ToolType.ANALYSIS, label: 'Analysis', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    { id: ToolType.FAST_AI, label: 'Flash Core', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  ];

  return (
    <div className={`${isOpen ? 'w-72' : 'w-20'} flex-shrink-0 bg-slate-900/40 backdrop-blur-xl border-r border-slate-800/50 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col z-20`}>
      <div className="p-8 flex items-center gap-4">
        <div className="relative group">
          <div className="absolute -inset-1.5 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
          <div className="relative w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center border border-white/10">
            <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
        {isOpen && (
          <div className="flex flex-col animate-in fade-in duration-700">
            <h1 className="font-bold text-lg tracking-tight text-white leading-none">Omni-Suite</h1>
            <span className="text-[10px] text-indigo-500 font-bold tracking-[0.2em] uppercase mt-1">Advanced AI</span>
          </div>
        )}
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onToolSelect(tool.id)}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 relative group overflow-hidden ${
              activeTool === tool.id 
                ? 'bg-white/5 text-white shadow-[0_0_20px_rgba(79,70,229,0.1)] border border-white/10' 
                : 'text-slate-500 hover:bg-white/[0.02] hover:text-slate-300'
            }`}
          >
            {activeTool === tool.id && (
              <div className="absolute inset-y-0 left-0 w-1 bg-indigo-500 rounded-full my-3"></div>
            )}
            <svg className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${activeTool === tool.id ? 'scale-110 text-indigo-400' : 'group-hover:scale-110 group-hover:text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tool.icon} />
            </svg>
            {isOpen && <span className="font-medium text-sm tracking-wide whitespace-nowrap">{tool.label}</span>}
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-800/50">
        <button 
          onClick={onToggle}
          className="w-full h-10 flex items-center justify-center rounded-xl bg-slate-800/50 text-slate-500 hover:text-white hover:bg-slate-800 transition-all border border-transparent hover:border-slate-700"
        >
          <svg className={`w-5 h-5 transform transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
