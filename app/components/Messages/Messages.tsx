import React, { useEffect, useRef } from 'react';
import {Message} from "@/app/components/Messages/Message";
import {useMessagesContext} from "@/app/context/MessagesContext";
import {useInputContext} from "@/app/context/InputContext";
import styles from "@/app/main.module.scss";

const Messages = ({isUserScrolling, setIsUserScrolling}: {isUserScrolling: boolean, setIsUserScrolling: (isScrolling: boolean) => void}) => {
  const { messages } = useMessagesContext()
  const { isDisabled } = useInputContext()
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const handleScroll = () => {
    if (!scrollContainerRef.current) return
    const scrollTop = scrollContainerRef.current.scrollTop
    const scrollHeight = scrollContainerRef.current.scrollHeight
    const clientHeight = scrollContainerRef.current.clientHeight
    const isScrolledToBottom = scrollTop + clientHeight >= scrollHeight - 10
    setIsUserScrolling(!isScrolledToBottom)
  }

  useEffect(() => {
    if (!isUserScrolling && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div className={styles.messages} onScroll={handleScroll} ref={scrollContainerRef}>
      {
        messages.length > 0 &&
        messages.map((message, index) => (
          <Message
            key={index}
            isFirst={index === 0}
            message={message}
          />
        ))
      }
      {
        isDisabled && (!messages.length || messages[messages.length - 1].type !== 'assistant') &&
        <Message
          isFirst={!messages.length}
          isThinking={true}
          message={{type: 'assistant', content: 'Hmm... Let me think...'}}
        />
      }
    </div>
  )
}

export default Messages
