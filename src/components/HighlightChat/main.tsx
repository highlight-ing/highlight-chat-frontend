"use client";

import * as React from "react";
import { useEffect, useCallback, useState, useRef } from "react";
import { type HighlightContext } from "@highlight-ai/app-runtime";
import Highlight from "@highlight-ai/app-runtime";
import { debounce } from "throttle-debounce";

import api from "@highlight-ai/app-runtime";
import { useInputContext } from "../../context/InputContext";
import { Input } from "@/components/Input/Input";
import { useHighlightContextContext } from "../../context/HighlightContext";
import { useSubmitQuery } from "../../hooks/useSubmitQuery";
import { useMessagesContext } from "../../context/MessagesContext";
import { useConversationContext } from "../../context/ConversationContext";
import { usePromptContext } from "../../context/PromptContext";
import { useAboutMeContext } from "@/context/AboutMeContext";

import styles from "@/main.module.scss";
import TopBar from "@/components/Navigation/TopBar";
import Messages from "@/components/Messages/Messages";
import History from "@/components/History/History";

const HighlightChat = () => {
  const { messages, clearMessages } = useMessagesContext();
  const { input, setInput, isDisabled, addAttachment } = useInputContext();
  const { setHighlightContext } = useHighlightContextContext();
  const { handleIncomingContext } = useSubmitQuery();
  const { resetConversationId } = useConversationContext();
  const { prompt } = usePromptContext();
  const { setAboutMe } = useAboutMeContext();
  const [showHistory, setShowHistory] = useState(false);

  const debouncedHandleSubmit = useCallback(
    debounce(300, async (context: HighlightContext) => {
      setInput(context.suggestion || "");
      await handleIncomingContext(context, prompt);
    }),
    []
  );

  useEffect(() => {
    api.addEventListener("onContext", (context: HighlightContext) => {
      setHighlightContext(context);
      // Handle context with debounce
      debouncedHandleSubmit(context);
    });
  }, []);

  useEffect(() => {
    const getAboutMe = async () => {
      const aboutMe = await Highlight.user.getFacts();
      const aboutMeString = aboutMe.join('\n');
      console.log("About Me:", aboutMeString);
      setAboutMe(aboutMeString);
    };
    getAboutMe();
  }, []);

  const startNewConversation = () => {
    clearMessages();
    setInput("");
    resetConversationId();
  };

  useEffect(() => {
    const onClipboardPaste = (ev: ClipboardEvent) => {
      const clipboardItems = ev.clipboardData?.items;
      if (!clipboardItems?.length) {
        return;
      }
      for (let i = 0; i < clipboardItems.length; i++) {
        const item = clipboardItems[i];

        if (item.kind === "file") {
          const file = item.getAsFile();
          if (file) {
            if (file.type.startsWith("image/")) {
              console.log("Pasted image");
              console.log("Image data URL:", URL.createObjectURL(file));
              addAttachment({
                type: "image",
                value: URL.createObjectURL(file),
                file: file,
              });
            } else if (file.type === "application/pdf") {
              console.log("Pasted PDF");
              addAttachment({
                type: "pdf",
                value: file,
              });
            }
          }
        }
      }
    };
    document.addEventListener("paste", onClipboardPaste);
    return () => {
      document.removeEventListener("paste", onClipboardPaste);
    };
  }, []);

  return (
    <div className={styles.page}>
      <History showHistory={showHistory} setShowHistory={setShowHistory} />
      <div
        className={`${styles.contents} ${
          showHistory ? styles.partial : styles.full
        }`}
      >
        <TopBar
          onNewConversation={startNewConversation}
          showHistory={showHistory}
          setShowHistory={setShowHistory}
        />
        {(isDisabled || messages.length > 0) && (
          <Messages />
        )}
        <Input offset={!isDisabled && !messages.length} />
      </div>
    </div>
  );
};

export default HighlightChat;