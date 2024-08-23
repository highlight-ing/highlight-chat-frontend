'use client'
import React, { useEffect, useRef, useState } from 'react'
import ShareMessage from '@/components/Share/ShareMessage'
import { Message } from '@/types'
import styles from './share-messages.module.scss'
// import Scrollable from '@/components/Scrollable/Scrollable'
import Scrollable from '@/components/Share/ShareScrollable'

// The threshold in pixels to consider chat "scrolled up" by the user.
const IS_SCROLLED_THRESHOLD_PX = 10

interface ShareMessagesProps {
  messages: Message[]
}

const ShareMessages: React.FC<ShareMessagesProps> = ({ messages }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const isUserScrolledRef = useRef<boolean>(false)
  const [isAtBottom, setIsAtBottom] = useState(true) // Start with true since messages are at bottom initially

  const handleScroll = () => {
    if (!scrollContainerRef.current) {
      return
    }

    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current
    // Adjust for the reversed scroll direction
    const adjustedScrollTop = Math.abs(scrollTop)
    const isBottom = adjustedScrollTop + clientHeight >= scrollHeight - 1
    console.log('Scroll info:', { adjustedScrollTop, scrollHeight, clientHeight, isBottom })
    setIsAtBottom(isBottom)

    // Update isUserScrolled
    isUserScrolledRef.current = adjustedScrollTop > IS_SCROLLED_THRESHOLD_PX
  }

  useEffect(() => {
    console.log('isAtBottom changed:', isAtBottom)
  }, [isAtBottom])

  useEffect(() => {
    // Initial check for bottom position
    handleScroll()
  }, [messages]) // Re-check when messages change

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
      <div className={`${styles.messages} ${isAtBottom ? styles.bottomPadding : ''}`}>
        {messages.map((message, index) => (
          <ShareMessage key={index} message={message} />
        ))}
      </div>
    </Scrollable>
  )
}

export default ShareMessages
