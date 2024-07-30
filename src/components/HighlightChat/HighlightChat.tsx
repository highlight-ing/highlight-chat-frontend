"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { Input } from "@/components/Input/Input";

import styles from "@/main.module.scss";
import TopBar from "@/components/Navigation/TopBar";
import Messages from "@/components/Messages/Messages";
import History from "@/components/History/History";
import { useStore } from "@/providers/store-provider";
import ChatHome from "@/components/ChatHome/ChatHome";

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
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const { messages, input, inputIsDisabled } = useStore((state) => ({
    messages: state.messages,
    input: state.input,
    inputIsDisabled: state.inputIsDisabled,
  }));

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

  return (
    <div className={styles.page}>
      <History showHistory={showHistory} setShowHistory={setShowHistory} />
      <TopBar showHistory={showHistory} setShowHistory={setShowHistory} />
      <div
        className={`${styles.contents} ${
          showHistory ? styles.partial : styles.full
        }`}
      >
        {(inputIsDisabled || messages.length > 0) && <Messages />}
        <Input offset={!inputIsDisabled && !messages.length} />
        <ChatHome isShowing={!inputIsDisabled && messages.length === 0}/>
      </div>
    </div>
  );
};

export default HighlightChat;
