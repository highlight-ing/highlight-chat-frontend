import React, { useEffect, useRef } from 'react'
import styles from '@/main.module.scss'
import { useShallow } from 'zustand/react/shallow'

import { useCurrentChatMessages } from '@/hooks/useCurrentChatMessages'
import { Message } from '@/components/Messages/Message'
import ThinkingMessage from '@/components/Messages/ThinkingMessage'
import { useStore } from '@/components/providers/store-provider'
import Scrollable from '@/components/Scrollable/Scrollable'

// The threshold in pixels to consider chat "scrolled up" by the user.
const IS_SCROLLED_THRESHOLD_PX = 10

export function Messages() {
  const { inputIsDisabled } = useStore(
    useShallow((state) => ({
      inputIsDisabled: state.inputIsDisabled,
    })),
  )
  const messages = useCurrentChatMessages()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const isUserScrolledRef = useRef<boolean>(false)

  const handleScroll = () => {
    if (!scrollContainerRef.current) {
      return
    }

    // If the user has scrolled 5px up or more, then consider it scrolled up
    isUserScrolledRef.current = scrollContainerRef.current.scrollTop < -IS_SCROLLED_THRESHOLD_PX
  }

  const handleScrollableUpdate = () => {
    // If the user has scrolled up, do not update the scroll position.
    if (isUserScrolledRef.current || !scrollContainerRef.current) {
      return
    }
    scrollContainerRef.current.scrollTo({
      top: 0,
      behavior: 'instant',
    })
  }

  useEffect(() => {
    const observer = new MutationObserver(() => {
      handleScrollableUpdate()
    })

    if (scrollContainerRef.current) {
      // Listen for new children in the scrollable tree (new messages / contents)
      observer.observe(scrollContainerRef.current, {
        childList: true,
        subtree: true,
      })
    }

    return () => observer.disconnect()
  }, [])

  return (
    <Scrollable className={styles.messagesContainer} ref={scrollContainerRef} onScroll={handleScroll}>
      <div className={styles.messages}>
        {messages.length > 0 &&
          messages.map((message, index) => {
            if (
              message.role === 'assistant' &&
              typeof message.content === 'string' &&
              !message.content?.trim()?.length
            ) {
              return ''
            }

            // Show thinking message only if it's the last message and input is disabled
            const showThinkingMessage = 
              inputIsDisabled && 
              index === messages.length - 1 && 
              message.role === 'user';

            return (
              <React.Fragment key={index}>
                <Message key={index} message={message} />
                {showThinkingMessage && <ThinkingMessage />}
              </React.Fragment>
            )
          })}
        {/* Show thinking message if there are no messages and input is disabled */}
        {inputIsDisabled && messages.length === 0 && <ThinkingMessage />}
      </div>
    </Scrollable>
  )
}

