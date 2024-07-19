import React, { useEffect, useRef, useLayoutEffect } from "react";
import { Message } from "@/components/Messages/Message";
import { useMessagesContext } from "@/context/MessagesContext";
import { useInputContext } from "@/context/InputContext";
import styles from "@/main.module.scss";
import ThinkingMessage from "@/components/Messages/ThinkingMessage";

const Messages = () => {
  const { messages } = useMessagesContext();
  const { isDisabled } = useInputContext();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  };

  useLayoutEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const observer = new MutationObserver(scrollToBottom);
    observer.observe(container, { childList: true, subtree: true, characterData: true });

    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={styles.messagesContainer}
      ref={scrollContainerRef}
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
      <div ref={messagesEndRef} />
    </div>
  );
};

export default Messages;