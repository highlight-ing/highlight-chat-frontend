import React, { useEffect, useState, useRef } from 'react'
import { AssistantMessage } from '@/types'
import { useStore } from '@/components/providers/store-provider'
import { StoreState } from '@/stores'
import styles from './message.module.scss'
import globalStyles from '@/global.module.scss'
import TypedText from '@/components/TypedText/TypedText'
import { AssistantIcon } from '@/components/icons'
import { MessageText } from 'iconsax-react'
import PromptAppIcon from '@/components/PromptAppIcon/PromptAppIcon'

const THINKING_MESSAGES = ['Hmm.. Let me think...', 'Working on it...', 'Just a moment...', 'Hang on a second...']

const ThinkingMessage = () => {
  const [dots, setDots] = useState('...')
  const messageId = useRef('thinking-' + Date.now().toString())
  const [thinkingText] = useState(() => 
    THINKING_MESSAGES[Math.floor(Math.random() * THINKING_MESSAGES.length)]
  )
  
  const conversationId = useStore((state: StoreState) => state.conversationId ?? '')
  const promptApp = useStore((state: StoreState) => state.promptApp)

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return '.'
        return prev + '.'
      })
    }, 500)

    return () => clearInterval(interval)
  }, [])

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
        <TypedText 
          text={`${thinkingText}${dots}`} 
          cursor={false} 
          speed={1.5} 
        />
      </span>
    </div>
  )
}

export default ThinkingMessage
