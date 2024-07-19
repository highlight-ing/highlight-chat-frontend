import React, { useEffect, useRef, useState, useCallback } from "react";
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
  const lastScrollHeightRef = useRef<number>(0);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollContainerRef.current && shouldAutoScroll && !isUserScrolling) {
      const scrollContainer = scrollContainerRef.current;
      const newScrollHeight = scrollContainer.scrollHeight;
      const heightDifference = newScrollHeight - lastScrollHeightRef.current;

      scrollContainer.scrollTop = scrollContainer.scrollHeight;
      lastScrollHeightRef.current = newScrollHeight;

      // If height has increased significantly, ensure we're still at the bottom
      if (heightDifference > 10) {
        setTimeout(() => {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }, 50);
      }
    }
  }, [shouldAutoScroll, isUserScrolling]);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
      
      setIsUserScrolling(true);
      setShouldAutoScroll(isAtBottom);

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        setIsUserScrolling(false);
      }, 150);
    }
  };

  useEffect(() => {
    if (!isUserScrolling && shouldAutoScroll) {
      scrollToBottom();
    }
  }, [messages, isUserScrolling, shouldAutoScroll, scrollToBottom]);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (shouldAutoScroll) {
        scrollToBottom();
      }
    });

    if (scrollContainerRef.current) {
      observer.observe(scrollContainerRef.current, { childList: true, subtree: true });
    }

    return () => observer.disconnect();
  }, [shouldAutoScroll]);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      lastScrollHeightRef.current = scrollContainer.scrollHeight;
    }
  }, []);

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      if (shouldAutoScroll) {
        scrollToBottom();
      }
    });

    if (scrollContainerRef.current) {
      observer.observe(scrollContainerRef.current);
    }

    return () => observer.disconnect();
  }, [shouldAutoScroll, scrollToBottom]);

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      
      if (lastMessage.type === 'user' || lastMessage.content !== lastMessageRef.current) {
        setShouldAutoScroll(true);
        scrollToBottom();
      }

      lastMessageRef.current = lastMessage.content;
    }
  }, [messages, scrollToBottom]);

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