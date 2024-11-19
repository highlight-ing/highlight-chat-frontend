import React, { useState, useEffect, useRef } from 'react'
import { useStore } from '@/components/providers/store-provider'
import { StoreState } from '@/stores'
import styles from './message.module.scss'
import globalStyles from '@/global.module.scss'
import { SpinningGear, CompletedCheckbox } from '@/components/icons/ThinkingIcons'
import { MessageText } from 'iconsax-react'

const THINKING_MESSAGES = ['Hmm.. Let me think...', 'Working on it...', 'Just a moment...', 'Hang on a second...']

interface ThinkingMessageProps {
  isAnimating?: boolean
}

const ThinkingMessage: React.FC<ThinkingMessageProps> = ({ isAnimating = true }) => {
  const [thinkingText] = useState(() => 
    THINKING_MESSAGES[Math.floor(Math.random() * THINKING_MESSAGES.length)]
  )
  
  const [isLocalAnimating, setIsLocalAnimating] = useState(true);
  const timerRef = useRef<NodeJS.Timeout>();
  
  const promptApp = useStore((state: StoreState) => state.promptApp)

  useEffect(() => {
    // Clear any existing timer first
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }

    if (!isAnimating) {
      // Add a delay before stopping the animation to match streaming completion
      timerRef.current = setTimeout(() => {
        setIsLocalAnimating(false);
      }, 2000);
    } else {
      // Start animating immediately when isAnimating becomes true
      setIsLocalAnimating(true);
    }
    
    // Cleanup on unmount or when effect reruns
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
      >
        {char}
      </span>
    ));
  };

  return (
    <div className={styles.messageContainer}>
      <div className={styles.thinkingAvatar}>
        <div
          className={`${globalStyles.promptIcon} ${globalStyles.self}`}
          style={{ '--size': '32px' } as React.CSSProperties}
        >
          {isLocalAnimating ? <SpinningGear /> : <CompletedCheckbox />}
        </div>
      </div>
      <span className={styles.thinking}>
        {renderAnimatedText(thinkingText + '...')}
      </span>
    </div>
  )
}

export default ThinkingMessage
