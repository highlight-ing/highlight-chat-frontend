'use client'
import React, { useEffect, useRef } from 'react'
import ShareMessage from '@/components/Share/ShareMessage'
import { Message } from '@/types'
import styles from '../Messages/message.module.scss'
import Scrollable from '@/components/Scrollable/Scrollable'

// The threshold in pixels to consider chat "scrolled up" by the user.
const IS_SCROLLED_THRESHOLD_PX = 10

interface ShareMessagesProps {
  messages: Message[]
}

const ShareMessages: React.FC<ShareMessagesProps> = ({ messages }) => {
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
        {messages.map((message, index) => (
          <ShareMessage key={index} message={message} />
        ))}
      </div>
    </Scrollable>
  )
}

export default ShareMessages
