"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { Input } from "@/components/Input/Input";

import styles from "@/main.module.scss";
import TopBar from "@/components/Navigation/TopBar";
import Messages from "@/components/Messages/Messages";
import History from "@/components/History/History";
import { useStore } from "@/providers/store-provider";

/**
 * Hook that handles pasting from the clipboard.
 */
function useHandleClipboardPaste() {
  const { addAttachment } = useStore((state) => ({
    addAttachment: state.addAttachment,
  }));

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
}

const HighlightChat = () => {
  // STATE
  const { messages, clearMessages, input, setInput, inputIsDisabled } =
    useStore((state) => ({
      messages: state.messages,
      clearMessages: state.clearMessages,
      input: state.input,
      setInput: state.setInput,
      inputIsDisabled: state.inputIsDisabled,
    }));

  const { resetConversationId } = useStore((state) => ({
    resetConversationId: state.resetConversationId,
  }));

  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // HOOKS
  useHandleClipboardPaste();

  // If the agent is not currently responding and the user types something, set isUserScrolling to false
  // so that the next time the agent responds, the chat will scroll to the bottom.
  useEffect(() => {
    if (!inputIsDisabled && isUserScrolling) {
      setIsUserScrolling(false);
    }
  }, [input, inputIsDisabled]);

  const startNewConversation = () => {
    clearMessages();
    setInput("");
    resetConversationId();
  };

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
        {(inputIsDisabled || messages.length > 0) && (
          <Messages
            isUserScrolling={isUserScrolling}
            setIsUserScrolling={(scrolled) => {
              setIsUserScrolling(scrolled);
            }}
          />
        )}
        <Input offset={!inputIsDisabled && !messages.length} />
      </div>
    </div>
  );
};

export default HighlightChat;
