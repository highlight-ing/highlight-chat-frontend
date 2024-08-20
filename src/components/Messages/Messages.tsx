import React, { useEffect, useRef } from 'react'
import { Message } from '@/components/Messages/Message'
import styles from '@/main.module.scss'
import ThinkingMessage from '@/components/Messages/ThinkingMessage'
import { useStore } from '@/providers/store-provider'
import { useShallow } from 'zustand/react/shallow'
import { useCurrentChatMessages } from '@/hooks/useCurrentChatMessages'

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
    <div className={styles.messagesContainer} ref={scrollContainerRef} onScroll={handleScroll}>
      <div className={styles.messages}>
        {messages.length > 0 &&
          messages.map((message, index) => {
            if (message.role === 'assistant' && !message.content?.trim()?.length) {
              return ''
            }
            return <Message key={index} message={message} />
          })}
        {inputIsDisabled &&
          (!messages.length ||
            messages[messages.length - 1].role !== 'assistant' ||
            !messages[messages.length - 1].content?.trim()?.length) && <ThinkingMessage />}
      </div>
    </div>
  )
}

export default Messages
