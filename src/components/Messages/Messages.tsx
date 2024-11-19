import React, { useEffect, useRef, useState } from 'react'
import styles from '@/main.module.scss'
import { useShallow } from 'zustand/react/shallow'

import { useCurrentChatMessages } from '@/hooks/useCurrentChatMessages'
import { Message } from '@/components/Messages/Message'
import ThinkingMessage from '@/components/Messages/ThinkingMessage'
import { useStore } from '@/components/providers/store-provider'
import Scrollable from '@/components/Scrollable/Scrollable'

// The threshold in pixels to consider chat "scrolled up" by the user.
const IS_SCROLLED_THRESHOLD_PX = 10

const Messages = () => {
  const { inputIsDisabled } = useStore(
    useShallow((state) => ({
      inputIsDisabled: state.inputIsDisabled,
    })),
  )
  const messages = useCurrentChatMessages()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const isUserScrolledRef = useRef<boolean>(false)
  const [thinkingMessageIndices, setThinkingMessageIndices] = useState<number[]>([])
  const prevMessagesRef = useRef<typeof messages>([])
  const [completedMessageIndices, setCompletedMessageIndices] = useState<number[]>([])
  const streamingTimeoutRef = useRef<NodeJS.Timeout>()

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

  useEffect(() => {
    // When input becomes enabled (streaming ends)
    if (!inputIsDisabled) {
      // Clear any existing timeout
      if (streamingTimeoutRef.current) {
        clearTimeout(streamingTimeoutRef.current);
      }
      // Set a new timeout to ensure we don't have any race conditions
      streamingTimeoutRef.current = setTimeout(() => {
        const lastUserIndex = messages.findLastIndex(m => m.role === 'user')
        if (lastUserIndex !== -1) {
          setCompletedMessageIndices(prev => [...prev, lastUserIndex])
        }
      }, 100);
    }

    return () => {
      if (streamingTimeoutRef.current) {
        clearTimeout(streamingTimeoutRef.current);
      }
    };
  }, [inputIsDisabled, messages]);

  useEffect(() => {
    const prevMessages = prevMessagesRef.current
    const currentMessages = messages

    // If we have a new message
    if (currentMessages.length > prevMessages.length) {
      const lastMessage = currentMessages[currentMessages.length - 1]
      if (lastMessage?.role === 'user') {
        const newIndex = currentMessages.length - 1
        setThinkingMessageIndices(prev => [...prev, newIndex])
        // Reset completed state for new message
        setCompletedMessageIndices(prev => prev.filter(i => i !== newIndex))
      }
    }

    // Also handle input disabled state
    if (inputIsDisabled) {
      const lastUserIndex = messages.findLastIndex(m => m.role === 'user')
      if (lastUserIndex !== -1 && !thinkingMessageIndices.includes(lastUserIndex)) {
        setThinkingMessageIndices(prev => [...prev, lastUserIndex])
        // Reset completed state when streaming starts
        setCompletedMessageIndices(prev => prev.filter(i => i !== lastUserIndex))
      }
    }

    // Update our reference
    prevMessagesRef.current = messages
  }, [messages, inputIsDisabled, thinkingMessageIndices])

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

            const showThinkingAfterMessage = 
              message.role === 'user' && (
                inputIsDisabled || 
                thinkingMessageIndices.includes(index)
              )

            return (
              <React.Fragment key={index}>
                <Message message={message} />
                {showThinkingAfterMessage && (
                  <ThinkingMessage 
                    isAnimating={!completedMessageIndices.includes(index)} 
                  />
                )}
              </React.Fragment>
            )
          })}
      </div>
    </Scrollable>
  )
}

export default Messages
