import * as React from 'react';

export type Message = {
  type: 'user' | 'assistant';
  content: string;
  attachment?: string;
  clipboardText?: string | null;
  ocrScreenContents?: string | null;
};

export type CompareResult = {
  overview: string[];
  grok: string[];
  claude: string[];
};

export interface TopBarProps {
  mode: 'assistant' | 'compare';
  setMode: (mode: 'assistant' | 'compare') => void;
  onNewConversation: () => void;
}