import * as React from 'react';

export type Message = {
  type: 'user' | 'assistant' | 'compare';
  content: string | React.ReactNode;
  attachment?: string;
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