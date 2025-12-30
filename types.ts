


export enum ToolType {
  CHAT = 'CHAT',
  LIVE = 'LIVE',
  IMAGE_STUDIO = 'IMAGE_STUDIO',
  VIDEO_STUDIO = 'VIDEO_STUDIO',
  GROUNDING = 'GROUNDING',
  ANALYSIS = 'ANALYSIS',
  FAST_AI = 'FAST_AI'
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  thinking?: string;
  grounding?: any[];
}

export interface GenerationConfig {
  aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
  imageSize?: "1K" | "2K" | "4K";
}

declare global {
  interface Window {
    // Add missing webkitAudioContext type for Safari support
    webkitAudioContext: typeof AudioContext;
  }
}