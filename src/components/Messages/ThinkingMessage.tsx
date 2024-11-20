import React, { useState, useEffect, useRef } from 'react'
import { useStore } from '@/components/providers/store-provider'
import { useShallow } from 'zustand/react/shallow'
import { StoreState } from '@/stores'
import styles from './message.module.scss'
import globalStyles from '@/global.module.scss'
import { SpinningGear, CompletedCheckbox } from '@/components/icons/ThinkingIcons'
import ThinkingDrawer from './ThinkingDrawer'
import { MetadataEvent } from '@/types'

const THINKING_MESSAGES = ['Hmm.. Let me think...', 'Working on it...', 'Just a moment...', 'Hang on a second...']

interface ThinkingMessageProps {
  isAnimating?: boolean
  isLatest?: boolean
}

interface LogEntry {
  timestamp: number;
  type: string;
  value: string;
}

const ThinkingMessage: React.FC<ThinkingMessageProps> = ({ 
  isAnimating = true,
  isLatest = false 
}) => {
  const [thinkingText] = useState(() => 
    THINKING_MESSAGES[Math.floor(Math.random() * THINKING_MESSAGES.length)]
  )
  
  const [isLocalAnimating, setIsLocalAnimating] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const timerRef = useRef<NodeJS.Timeout>();

  const { promptApp } = useStore(
    useShallow((state: any) => ({
      promptApp: state.promptApp
    }))
  );

  // Log initial render
  useEffect(() => {
    console.log('ThinkingMessage rendered:', {
      isDrawerOpen,
      logsLength: logs.length,
      logs,
      promptApp: !!promptApp,
      promptAppDetails: promptApp
    });
  });

  useEffect(() => {
    const handleMetadata = (event: CustomEvent) => {
      if (!isLocalAnimating) {
        console.log('Stream ended, ignoring metadata event');
        return;
      }

      console.log('Received metadata event:', event.detail);
      
      if (!event.detail || typeof event.detail !== 'object') {
        console.error('Invalid metadata event received:', event.detail);
        return;
      }

      setLogs(prevLogs => {
        const newLogs: LogEntry[] = [];
        const metadata = event.detail;
        
        // Add model information
        if (metadata.model) {
          newLogs.push({
            timestamp: Date.now(),
            type: 'Model',
            value: metadata.model
          });
        }

        // Add LLM provider
        if (metadata.llm_provider) {
          newLogs.push({
            timestamp: Date.now(),
            type: 'Provider',
            value: metadata.llm_provider
          });
        }

        // Add live data information
        if (metadata.has_live_data !== undefined) {
          newLogs.push({
            timestamp: Date.now(),
            type: 'Live Data',
            value: metadata.has_live_data ? 'Enabled' : 'Disabled'
          });
        }

        // Add live data requirement
        if (metadata.requires_live_data) {
          newLogs.push({
            timestamp: Date.now(),
            type: 'Requires',
            value: metadata.requires_live_data
          });
        }

        // Add any other metadata fields
        if (metadata.metadata && typeof metadata.metadata === 'object') {
          Object.entries(metadata.metadata).forEach(([key, value]) => {
            newLogs.push({
              timestamp: Date.now(),
              type: key,
              value: typeof value === 'string' ? value : JSON.stringify(value)
            });
          });
        }

        const updatedLogs = [...prevLogs, ...newLogs];
        console.log('Updated logs:', updatedLogs);
        
        return updatedLogs;
      });
    };

    // Clear any existing timer first
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }

    // Update animation state immediately
    setIsLocalAnimating(isAnimating);
    
    // Set up metadata listener only when animating
    if (isAnimating) {
      window.addEventListener('highlight:metadata', handleMetadata as EventListener);
      console.log('Added metadata event listener');
    }

    // Cleanup on unmount or when animation stops
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      window.removeEventListener('highlight:metadata', handleMetadata as EventListener);
      console.log('Removed metadata event listener');
    };
  }, [isAnimating]);

  const renderAnimatedText = (text: string) => {
    return text.split('').map((char, index) => (
      <span 
        key={index} 
        className={`${styles.waveChar} ${isLocalAnimating ? styles.animating : styles.static}`}
        style={{ whiteSpace: 'pre' }}
      >
        {char}
      </span>
    ));
  };

  return (
    <div className={styles.messageContainer}>
      <div className={`${styles.thinkingAvatar} ${!isLatest && !isAnimating ? styles.inactive : ''}`}>
        <div
          className={`${globalStyles.promptIcon} ${globalStyles.self}`}
          style={{ '--size': '32px' } as React.CSSProperties}
        >
          {isLocalAnimating ? <SpinningGear /> : <CompletedCheckbox />}
        </div>
      </div>
      <div className={styles.thinkingContent}>
        <div className={styles.thinkingHeader}>
          <span className={styles.thinking}>
            {renderAnimatedText(thinkingText + '...')}
          </span>
          <ThinkingDrawer 
            isOpen={isDrawerOpen}
            onToggle={() => {
              console.log('Drawer toggled, current logs:', logs);
              setIsDrawerOpen(!isDrawerOpen);
            }}
            logs={logs}
          />
        </div>
      </div>
    </div>
  )
}

export default ThinkingMessage
