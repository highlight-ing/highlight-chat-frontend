import { useEffect, useRef } from "react";
import { Attachment } from "../Attachment";
import { AttachmentsButton } from "../AttachmentsButton/AttachmentsButton";
import { Attachment as AttachmentType } from "@/types";
import { useSubmitQuery } from "../../hooks/useSubmitQuery";
import { useStore } from "@/providers/store-provider";

import styles from "./chatinput.module.scss";
import * as React from "react";
import { getAudioAttachmentPreview } from "@/utils/attachments";
import { useShallow } from "zustand/react/shallow";
import { trackEvent } from '@/utils/amplitude';

const MAX_INPUT_HEIGHT = 160;

/**
 * This is the main Highlight Chat input box, not a reusable Input component.
 */
export const Input = ({ sticky }: { sticky: boolean }) => {
  const { attachments, input, setInput, inputIsDisabled, promptName, promptApp } =
    useStore(
      useShallow((state) => ({
        attachments: state.attachments,
        input: state.input,
        setInput: state.setInput,
        inputIsDisabled: state.inputIsDisabled,
        promptName: state.promptName,
        promptApp: state.promptApp,
      }))
    );

  const { handleSubmit } = useSubmitQuery();

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!inputIsDisabled && e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(promptApp);
      setInput("");
      trackEvent('HL Chat Message Sent', { messageLength: input.length });
    }
  };

  const onClickContainer = (e: React.MouseEvent) => {
    inputRef.current?.focus();
    trackEvent('HL Chat Input Focused', {});
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "0px";
      const scrollHeight = inputRef.current.scrollHeight;

      const newHeight =
        scrollHeight > MAX_INPUT_HEIGHT ? MAX_INPUT_HEIGHT : scrollHeight;
      inputRef.current.style.height = newHeight + "px";
    }
  }, [inputRef, input]);

  useEffect(() => {
    if (attachments.length > 0) {
      trackEvent('HL Chat Attachments Present', { 
        attachmentCount: attachments.length,
        attachmentTypes: attachments.map(a => a.type)
      });
    }
  }, [attachments]);

  const getValue = (attachment: AttachmentType) => {
    switch (attachment.type) {
      case "pdf":
        return attachment.value.name;
      case "audio":
        return getAudioAttachmentPreview(attachment);
      case "spreadsheet":
        return attachment.value.name;
      default:
        return attachment.value;
    }
  };

  return (
    <div
      className={`${styles.inputContainer} ${sticky ? styles.sticky : ""}`}
      onClick={onClickContainer}
    >
      {attachments.length > 0 && (
        <div className="flex gap-2">
          {attachments.map((attachment: AttachmentType, index: number) => (
            <Attachment
              type={attachment.type}
              value={getValue(attachment)}
              isFile={
                attachment.type === "pdf" ||
                (attachment.type === "image" && !!attachment.file) ||
                attachment.type === "spreadsheet"
              }
              removeEnabled
              key={index}
            />
          ))}
        </div>
      )}
      <div className={styles.attachmentsButtonContainer}>
        <AttachmentsButton />
      </div>
      <textarea
        ref={inputRef}
        autoFocus={true}
        placeholder={`Ask ${promptName ? promptName : "Highlight"} anything...`}
        value={input}
        rows={1}
        onInput={(e) => setInput(e.currentTarget.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => trackEvent('HL Chat Input Focused', {})}
      />
    </div>
  );
};