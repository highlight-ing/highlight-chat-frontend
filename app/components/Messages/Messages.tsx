import React, { useEffect, useRef } from 'react';
import {Message} from "@/app/components/Messages/Message";
import {useMessagesContext} from "@/app/context/MessagesContext";
import {useInputContext} from "@/app/context/InputContext";
import styles from "@/app/main.module.scss";
import ThinkingMessage from "@/app/components/Messages/ThinkingMessage";

const Messages = ({isUserScrolling, setIsUserScrolling}: {isUserScrolling: boolean, setIsUserScrolling: (isScrolling: boolean) => void}) => {
  const { messages } = useMessagesContext()
  const { isDisabled } = useInputContext()
  const isScrolledRef = useRef(isUserScrolling)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const handleScroll = () => {
    if (!scrollContainerRef.current) {
      return
    }
    const { scrollTop } = scrollContainerRef.current;
    isScrolledRef.current = scrollTop < -50
    setIsUserScrolling(isScrolledRef.current)
  }

  useEffect(() => {
    if (isUserScrolling !== isScrolledRef.current) {
      isScrolledRef.current = isUserScrolling
    }
  }, [isUserScrolling])

  useEffect(() => {
    if (!scrollContainerRef.current) {
      return
    }
    const observer = new MutationObserver(() => {
      if (isScrolledRef.current) {
        return
      }
      scrollContainerRef.current!.scrollTop = scrollContainerRef.current!.scrollHeight
    });
    observer.observe(scrollContainerRef.current, {childList: true});
    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <div className={styles.messagesContainer} onScroll={handleScroll} ref={scrollContainerRef}>
      <div className={styles.messages}>
        {
          messages.length > 0 &&
          messages.map((message, index) => (
            <Message
              key={index}
              message={message}
            />
          ))
        }
        {
          isDisabled && (!messages.length || messages[messages.length - 1].type !== 'assistant') &&
          <ThinkingMessage/>
        }
      </div>
    </div>
  )
}

export default Messages
