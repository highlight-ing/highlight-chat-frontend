import React, { useEffect, useRef } from 'react'
import { Message } from '@/components/Messages/Message'
import styles from '@/main.module.scss'
import ThinkingMessage from '@/components/Messages/ThinkingMessage'
import { useStore } from '@/providers/store-provider'
import { useShallow } from 'zustand/react/shallow'
import { useCurrentChatMessages } from '@/hooks/useCurrentChatMessages'
import Scrollable from '@/components/Scrollable/Scrollable'
import { useSubmitQuery } from '@/hooks/useSubmitQuery'
import { Message as MessageType } from '@/types'

// The threshold in pixels to consider chat "scrolled up" by the user.
const IS_SCROLLED_THRESHOLD_PX = 10

const Messages = () => {
  const { inputIsDisabled, deleteMessage } = useStore(
    useShallow((state) => ({
      inputIsDisabled: state.inputIsDisabled,
      deleteMessage: state.deleteMessage,
    })),
  )
  const messages = useCurrentChatMessages()
  const { handleSubmit } = useSubmitQuery()
  const conversationId = useStore((state) => state.conversationId)

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

  const handleRetry = async (message: MessageType) => {
    if (message.role === 'assistant' && message.error) {
      // Find the previous user message
      const userMessageIndex = messages.findIndex((m) => m.id === message.id) - 1
      if (userMessageIndex >= 0) {
        const userMessage = messages[userMessageIndex]
        if (userMessage.role === 'user' && userMessage.content) {
          // Call handleSubmit with a flag indicating it's a retry
          await handleSubmit(userMessage.content, undefined, undefined, true)
        }
      }
    }
  }

  const handleDelete = (messageId: string) => {
    if (conversationId) {
      deleteMessage(conversationId, messageId)
    }
  }

  return (
    <Scrollable className={styles.messagesContainer} ref={scrollContainerRef} onScroll={handleScroll}>
      <div className={styles.messages}>
        {messages.length > 0 &&
          messages.map((message) => (
            <Message
              key={message.id}
              message={message}
              onRetry={() => message.role === 'assistant' && handleRetry(messages[messages.length - 2])}
              onDelete={() => handleDelete(message.id)}
            />
          ))}
        {inputIsDisabled &&
          (!messages.length ||
            messages[messages.length - 1].role !== 'assistant' ||
            !messages[messages.length - 1].content?.trim()?.length) && <ThinkingMessage />}
      </div>
    </Scrollable>
  )
}

export default Messages
