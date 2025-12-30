
import React from 'react';
import { ToolType, Theme } from '../types';

interface SidebarProps {
  activeTool: ToolType;
  onToolSelect: (tool: ToolType) => void;
  isOpen: boolean;
  onToggle: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}

const Logo = () => (
  <svg className="w-10 h-10" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="45" stroke="url(#paint0_linear)" strokeWidth="2" strokeDasharray="5 5" className="animate-[spin_10s_linear_infinite]" />
    <path d="M50 20L80 70H20L50 20Z" fill="url(#paint1_linear)" className="animate-pulse" />
    <circle cx="50" cy="45" r="8" fill="white" className="blur-[1px]" />
    <defs>
      <linearGradient id="paint0_linear" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6366F1" />
        <stop offset="1" stopColor="#A855F7" />
      </linearGradient>
      <linearGradient id="paint1_linear" x1="20" y1="20" x2="80" y2="70" gradientUnits="userSpaceOnUse">
        <stop stopColor="#4F46E5" />
        <stop offset="1" stopColor="#9333EA" />
      </linearGradient>
    </defs>
  </svg>
);

const Sidebar: React.FC<SidebarProps> = ({ activeTool, onToolSelect, isOpen, onToggle, theme, onToggleTheme }) => {
  const tools = [
    { id: ToolType.CHAT, label: 'Intelligence', tooltip: 'Advanced reasoning with Gemini 3 Pro', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
    { id: ToolType.LIVE, label: 'Live Voice', tooltip: 'Real-time voice interaction', icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z' },
    { id: ToolType.IMAGE_STUDIO, label: 'Imaging', tooltip: 'AI image generation & editing', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: ToolType.VIDEO_STUDIO, label: 'Cinematics', tooltip: 'Veo-powered video generation', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
    { id: ToolType.GROUNDING, label: 'Grounding', tooltip: 'Google Search & Maps verification', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z' },
    { id: ToolType.ANALYSIS, label: 'Analysis', tooltip: 'Deep visual content scan', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    { id: ToolType.FAST_AI, label: 'Flash Core', tooltip: 'Instant response synthesis', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  ];

  return (
    <div className={`${isOpen ? 'w-72' : 'w-24'} flex-shrink-0 bg-white dark:bg-slate-900 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] border-r border-slate-200 dark:border-slate-800 flex flex-col z-20 overflow-hidden`}>
      <div className="p-8 flex items-center gap-4">
        <div className="flex-shrink-0">
          <Logo />
        </div>
        <div className={`flex flex-col transition-all duration-500 ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10 pointer-events-none absolute'}`}>
          <h1 className="font-bold text-lg tracking-tight text-slate-900 dark:text-white leading-none">Omni-Suite</h1>
          <span className="text-[10px] text-indigo-500 font-bold tracking-[0.2em] uppercase mt-1">Advanced AI</span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto scrollbar-hide">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onToolSelect(tool.id)}
            title={!isOpen ? tool.tooltip : undefined}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 relative group overflow-hidden ${
              activeTool === tool.id 
                ? 'bg-indigo-500/10 dark:bg-white/5 text-indigo-600 dark:text-white border border-indigo-500/20 dark:border-white/10' 
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.02] hover:text-indigo-500 dark:hover:text-slate-200'
            }`}
          >
            {activeTool === tool.id && (
              <div className="absolute inset-y-0 left-0 w-1 bg-indigo-500 rounded-full my-3 animate-in slide-in-from-left duration-300"></div>
            )}
            <svg className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${activeTool === tool.id ? 'scale-110' : 'group-hover:scale-110'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tool.icon} />
            </svg>
            <span className={`font-medium text-sm tracking-wide transition-all duration-500 whitespace-nowrap ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10 pointer-events-none absolute'}`}>
              {tool.label}
            </span>
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-200 dark:border-slate-800/50 space-y-4">
        <button 
          onClick={onToggleTheme}
          title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="w-full h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800/50 text-slate-500 hover:text-indigo-500 transition-all border border-transparent hover:border-indigo-500/20"
        >
          {theme === 'dark' ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4-9H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.95 16.95l.707.707M7.05 7.05l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
          )}
          <span className={`ml-3 font-medium text-xs transition-all duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </span>
        </button>

        <button 
          onClick={onToggle}
          title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          className="w-full h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800/50 text-slate-500 hover:text-indigo-500 transition-all border border-transparent hover:border-indigo-500/20"
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
