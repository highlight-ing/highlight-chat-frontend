import React, { useState, useEffect, useRef } from 'react'
import { useStore } from '@/components/providers/store-provider'
import { useShallow } from 'zustand/react/shallow'
import { StoreState } from '@/stores'
import styles from './message.module.scss'
import globalStyles from '@/global.module.scss'
import { SpinningGear, CompletedCheckbox } from '@/components/Icons/ThinkingIcons'
import ThinkingDrawer from './ThinkingDrawer'
import { MetadataEvent } from '@/types'

const INITIAL_THINKING_MESSAGES = [
  'Hmm...',
  'Firing up...',
  'Thinking...'
]

const MODEL_MESSAGES = [
  'Using {model}...',
  'Picking {model}...',
  'Chose {model}...',
]

const PROVIDER_MESSAGES = [
  'Plugging into {provider}...',
  'Tapping into {provider}...',
  'Working through {provider}...'
]

const GENERATING_MESSAGES = [
  'Generating...',
  'Crafting...',
  'Putting it all together...',
  'Almost there...'
]

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
  const [thinkingText, setThinkingText] = useState(() => 
    INITIAL_THINKING_MESSAGES[Math.floor(Math.random() * INITIAL_THINKING_MESSAGES.length)]
  )
  
  const [isLocalAnimating, setIsLocalAnimating] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const timerRef = useRef<NodeJS.Timeout>();
  const messageTimer = useRef<NodeJS.Timeout>();
  const stateTimer = useRef<NodeJS.Timeout>();
  const drawerRef = useRef<HTMLDivElement>(null);

  const [messageState, setMessageState] = useState<'thinking' | 'model' | 'provider' | 'generating'>('thinking');
  const [currentModel, setCurrentModel] = useState<string>('');
  const [currentProvider, setCurrentProvider] = useState<string>('');

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
    if (drawerRef.current && isDrawerOpen) {
      const height = drawerRef.current.scrollHeight;
      document.documentElement.style.setProperty('--drawer-height', `${height}px`);
    }
  }, [isDrawerOpen, logs]);

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

      const metadata = event.detail;
      
      // Update model and provider state
      if (metadata.model) {
        setCurrentModel(metadata.model);
        setMessageState('model');
      }
      if (metadata.llm_provider) {
        setCurrentProvider(metadata.llm_provider);
        setMessageState('provider');
      }
      
      // If streaming starts, update to generating state
      if (metadata.status === 'streaming') {
        setMessageState('generating');
      }

      setLogs(prevLogs => {
        const newLogs: LogEntry[] = [];
        const metadata = event.detail;
        
        // Add model information (always show)
        newLogs.push({
          timestamp: Date.now(),
          type: 'Model',
          value: metadata.model || 'Unknown'
        });

        // Add LLM provider (always show)
        newLogs.push({
          timestamp: Date.now(),
          type: 'Provider',
          value: metadata.llm_provider || 'Unknown'
        });

        // Add Search status only if live data is enabled
        if (metadata.has_live_data) {
          newLogs.push({
            timestamp: Date.now(),
            type: 'Search',
            value: 'Enabled'
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

  // For demo purposes when no real metadata is available
  const demoStates = {
    model: 'GPT-4o',
    provider: 'OpenAI'
  };

  // Set up state rotation
  useEffect(() => {
    let stateIndex = 0;
    const states = ['thinking', 'model', 'provider', 'generating'] as const;
    
    const rotateState = () => {
      const nextState = states[stateIndex];
      setMessageState(nextState);
      
      // Set demo values when transitioning to respective states
      if (nextState === 'model' && !currentModel) {
        setCurrentModel(demoStates.model);
      }
      if (nextState === 'provider' && !currentProvider) {
        setCurrentProvider(demoStates.provider);
      }
      
      // Only increment if not at the last state
      if (stateIndex < states.length - 1) {
        stateIndex++;
        
        // If we've reached the last state, clear the interval
        if (stateIndex === states.length - 1) {
          if (stateTimer.current) {
            clearInterval(stateTimer.current);
          }
        }
      }
    };

    // Clear any existing state timer
    if (stateTimer.current) {
      clearInterval(stateTimer.current);
    }

    // Start the state rotation if animating
    if (isLocalAnimating) {
      rotateState(); // Initial state
      stateTimer.current = setInterval(rotateState, 8000); // Change state every 8 seconds
    }

    return () => {
      if (stateTimer.current) {
        clearInterval(stateTimer.current);
      }
    };
  }, [isLocalAnimating]);

  const getRandomMessage = () => {
    const messages = (() => {
      switch (messageState) {
        case 'model':
          return MODEL_MESSAGES.map(msg => 
            msg.replace('{model}', currentModel || demoStates.model)
          );
        case 'provider':
          return PROVIDER_MESSAGES.map(msg => 
            msg.replace('{provider}', currentProvider || demoStates.provider)
          );
        case 'generating':
          return GENERATING_MESSAGES;
        default:
          return INITIAL_THINKING_MESSAGES;
      }
    })();
    
    // Get a random message different from the current one
    const currentIndex = messages.indexOf(thinkingText);
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * messages.length);
    } while (newIndex === currentIndex && messages.length > 1);
    
    return messages[newIndex];
  };

  // Set up message rotation timer
  useEffect(() => {
    const rotateMessage = () => {
      const newMessage = getRandomMessage();
      setThinkingText(newMessage);
    };

    // Clear any existing timer
    if (messageTimer.current) {
      clearInterval(messageTimer.current);
    }

    // Start the rotation if animating
    if (isLocalAnimating) {
      rotateMessage(); // Initial rotation
      messageTimer.current = setInterval(rotateMessage, 2000);
    }

    return () => {
      if (messageTimer.current) {
        clearInterval(messageTimer.current);
      }
    };
  }, [isLocalAnimating, messageState, currentModel, currentProvider]);

  // Clean up all timers on unmount
  useEffect(() => {
    return () => {
      if (messageTimer.current) {
        clearInterval(messageTimer.current);
      }
      if (stateTimer.current) {
        clearInterval(stateTimer.current);
      }
    };
  }, []);

  const renderAnimatedText = (text: string) => {
    return text.split('').map((char, index) => {
      // Skip animation for spaces to prevent jumpiness
      if (char === ' ') {
        return (
          <span 
            key={index} 
            style={{ whiteSpace: 'pre' }}
          >
            {char}
          </span>
        );
      }
      
      return (
        <span 
          key={`${index}-${char}`}
          className={`${styles.waveChar} ${isLocalAnimating ? styles.animating : styles.static}`}
          style={{ 
            whiteSpace: 'pre',
            display: 'inline-block'
          }}
          aria-hidden="true"
        >
          {char}
        </span>
      );
    });
  };

  return (
    <div className={`${styles.messageContainer} ${isDrawerOpen ? styles['drawer-open'] : ''}`}>
      <div className={`${styles.thinkingAvatar} ${!isLatest && !isAnimating ? styles.inactive : ''}`}>
        <div
          className={`${globalStyles.promptIcon} ${globalStyles.none}`}
          style={{ '--size': '32px' } as React.CSSProperties}
        >
          {isLocalAnimating && <SpinningGear />}
        </div>
      </div>
      <div className={styles.thinkingContent}>
        <div className={styles.thinkingHeader}>
          <span className={`${styles.thinking} ${!isLocalAnimating ? styles.completed : ''}`}>
            {isLocalAnimating ? renderAnimatedText(thinkingText) : '...'}
          </span>
          <ThinkingDrawer 
            isOpen={isDrawerOpen}
            onToggle={() => {
              console.log('Drawer toggled, current logs:', logs);
              setIsDrawerOpen(!isDrawerOpen);
            }}
            logs={logs}
            ref={drawerRef}
          />
        </div>
      </div>
    </div>
  )
}

export default ThinkingMessage
