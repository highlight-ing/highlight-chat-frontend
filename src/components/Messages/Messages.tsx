import React, { useEffect, useRef, useState } from "react";
import { Message } from "@/components/Messages/Message";
import { useMessagesContext } from "@/context/MessagesContext";
import { useInputContext } from "@/context/InputContext";
import styles from "@/main.module.scss";
import ThinkingMessage from "@/components/Messages/ThinkingMessage";

const Messages = () => {
  const { messages } = useMessagesContext();
  const { isDisabled } = useInputContext();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const lastMessageRef = useRef<string | null>(null);

  const scrollToBottom = () => {
    if (scrollContainerRef.current && shouldAutoScroll) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 1;
      setShouldAutoScroll(isAtBottom);
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      
      if (lastMessage.type === 'user') {
        setShouldAutoScroll(true);
        scrollToBottom();
      } else if (lastMessage.content !== lastMessageRef.current) {
        scrollToBottom();
      }

      lastMessageRef.current = lastMessage.content;
    }
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [shouldAutoScroll]);

  return (
    <div
      className={styles.messagesContainer}
      ref={scrollContainerRef}
      onScroll={handleScroll}
    >
      <div className={styles.messages}>
        {messages.length > 0 &&
          messages.map((message, index) => (
            <Message key={index} message={message} />
          ))}
        {isDisabled &&
          (!messages.length ||
            messages[messages.length - 1].type !== "assistant") && (
            <ThinkingMessage />
          )}
      </div>
    </div>
  );
};

export default Messages;