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
  const [activeThinkingIndices, setActiveThinkingIndices] = useState<number[]>([])
  const streamingTimeoutRef = useRef<NodeJS.Timeout>()
  const [messageStates, setMessageStates] = useState<{ [key: number]: 'thinking' | 'completed' }>({})

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

  // Initialize thinking and completed states when messages change
  useEffect(() => {
    const newThinkingIndices: number[] = [];
    const newCompletedIndices: number[] = [];
    const newActiveThinkingIndices: number[] = [];
    
    // Set states for all existing messages
    messages.forEach((message, index) => {
      if (message.role === 'user') {
        // If there's a following assistant message, mark as completed
        const hasAssistantResponse = messages[index + 1]?.role === 'assistant';
        if (hasAssistantResponse) {
          newCompletedIndices.push(index);
        } else {
          newThinkingIndices.push(index);
          // Only the last thinking message should be active
          if (index === messages.findLastIndex(m => m.role === 'user')) {
            newActiveThinkingIndices.push(index);
          }
        }
      }
    });
    
    setThinkingMessageIndices(newThinkingIndices);
    setCompletedMessageIndices(newCompletedIndices);
    setActiveThinkingIndices(newActiveThinkingIndices);
  }, []); // Run only on mount

  useEffect(() => {
    const prevMessages = prevMessagesRef.current
    const currentMessages = messages

    // If we have a new message
    if (currentMessages.length > prevMessages.length) {
      const lastMessage = currentMessages[currentMessages.length - 1]

      // If it's a user message, immediately show blue thinking message
      if (lastMessage?.role === 'user') {
        const newIndex = currentMessages.length - 1
        setThinkingMessageIndices(prev => [...prev, newIndex])
        setCompletedMessageIndices(prev => prev.filter(i => i !== newIndex))
        // Set this as the only active thinking message
        setActiveThinkingIndices([newIndex])
      }

      // If it's an assistant message
      if (lastMessage?.role === 'assistant') {
        // Find the last user message before this assistant message
        const lastUserIndex = currentMessages.slice(0, -1).findLastIndex(m => m.role === 'user')
        if (lastUserIndex !== -1) {
          // Mark that thinking message as completed
          setCompletedMessageIndices(prev => [...prev, lastUserIndex])
          // Remove from active indices when completed
          setActiveThinkingIndices(prev => prev.filter(i => i !== lastUserIndex))
        }
      }
    }

    // Update our reference
    prevMessagesRef.current = messages
  }, [messages])

  // Separate effect for handling input state
  useEffect(() => {
    if (inputIsDisabled) {
      const lastUserIndex = messages.findLastIndex(m => m.role === 'user')
      if (lastUserIndex !== -1 && !thinkingMessageIndices.includes(lastUserIndex)) {
        setThinkingMessageIndices(prev => [...prev, lastUserIndex])
        setCompletedMessageIndices(prev => prev.filter(i => i !== lastUserIndex))
        // Ensure this is the only active thinking message
        setActiveThinkingIndices([lastUserIndex])
      }
    }
  }, [inputIsDisabled, messages, thinkingMessageIndices])

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
          // Remove from active indices when completed
          setActiveThinkingIndices(prev => prev.filter(i => i !== lastUserIndex))
        }
      }, 100);
    }

    return () => {
      if (streamingTimeoutRef.current) {
        clearTimeout(streamingTimeoutRef.current);
      }
    };
  }, [inputIsDisabled, messages]);

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
                    isLatest={activeThinkingIndices.includes(index)}
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
