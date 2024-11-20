import React, { useState, useEffect, useRef } from 'react'
import { useStore } from '@/components/providers/store-provider'
import { StoreState } from '@/stores'
import styles from './message.module.scss'
import globalStyles from '@/global.module.scss'
import { SpinningGear, CompletedCheckbox } from '@/components/icons/ThinkingIcons'
import ThinkingDrawer from './ThinkingDrawer'

const THINKING_MESSAGES = ['Hmm.. Let me think...', 'Working on it...', 'Just a moment...', 'Hang on a second...']

interface ThinkingMessageProps {
  isAnimating?: boolean
  isLatest?: boolean
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
  const timerRef = useRef<NodeJS.Timeout>();
  
  const promptApp = useStore((state: StoreState) => state.promptApp)

  useEffect(() => {
    // Clear any existing timer first
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }

    // Update animation state immediately
    setIsLocalAnimating(isAnimating);
    
    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
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
            onToggle={() => setIsDrawerOpen(!isDrawerOpen)}
          />
        </div>
      </div>
    </div>
  )
}

export default ThinkingMessage
