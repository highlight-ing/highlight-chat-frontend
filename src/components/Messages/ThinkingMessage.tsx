import React, { useState, useEffect, useRef } from 'react'
import { useStore } from '@/components/providers/store-provider'
import { StoreState } from '@/stores'
import styles from './message.module.scss'
import globalStyles from '@/global.module.scss'
import { AssistantIcon } from '@/components/icons'
import { MessageText } from 'iconsax-react'
import PromptAppIcon from '@/components/PromptAppIcon/PromptAppIcon'

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
      // Add a 0.5 second delay before stopping the animation
      timerRef.current = setTimeout(() => {
        setIsLocalAnimating(false);
      }, 500);
    } else {
      // Immediately start animating when isAnimating becomes true
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
      <div className={styles.avatar}>
        <div
          className={`${globalStyles.promptIcon} ${promptApp && promptApp.image && promptApp.user_images?.file_extension ? globalStyles.none : globalStyles.self}`}
          style={{ '--size': '32px' } as React.CSSProperties}
        >
          {promptApp && promptApp.image && promptApp.user_images?.file_extension ? (
            <PromptAppIcon
              width={32}
              height={32}
              imageId={promptApp.image}
              imageExtension={promptApp.user_images?.file_extension ?? ''}
            />
          ) : promptApp ? (
            <MessageText variant={'Bold'} size={16} />
          ) : (
            <AssistantIcon />
          )}
        </div>
      </div>
      <span className={styles.thinking}>
        {renderAnimatedText(thinkingText + '...')}
      </span>
    </div>
  )
}

export default ThinkingMessage
