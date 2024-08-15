import { useEffect, useRef } from "react";
import { Attachment } from "../Attachment";
import { AttachmentsButton } from "../AttachmentsButton/AttachmentsButton";
import { Attachment as AttachmentType } from "@/types";
import { useSubmitQuery } from "../../hooks/useSubmitQuery";
import { useStore } from "@/providers/store-provider";

import styles from "./chatinput.module.scss";
import * as React from "react";
import { base64ToFile, getAudioAttachmentPreview } from "@/utils/attachments";
import { useShallow } from "zustand/react/shallow";

const MAX_INPUT_HEIGHT = 160;

function prepareFileAttachmentsForRender(
  atts: AttachmentType[]
): AttachmentType[] {
  const processedAttachments: AttachmentType[] = atts.map((attachment) => {
    if (attachment.type !== "file") {
      return attachment;
    }

    const mimeType = attachment.mimeType.toLowerCase();

    if (mimeType.startsWith("image/")) {
      return {
        type: "image",
        value: attachment.value,
      };
    } else if (mimeType === "application/pdf") {
      const file = base64ToFile(
        attachment.value,
        attachment.fileName,
        mimeType
      );
      if (!file) {
        return attachment;
      }
      return {
        type: "pdf",
        value: file,
      };
    } else if (
      mimeType.includes("spreadsheetml") ||
      mimeType.includes("excel") ||
      attachment.fileName.endsWith(".xlsx") ||
      attachment.fileName.endsWith(".csv")
    ) {
      const file = base64ToFile(
        attachment.value,
        attachment.fileName,
        mimeType
      );
      if (!file) {
        return attachment;
      }

      return {
        type: "spreadsheet",
        value: file,
      };
    } else if (
      mimeType.startsWith("text/") ||
      mimeType === "application/json" ||
      mimeType === "application/xml" ||
      mimeType === "application/javascript" ||
      mimeType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      mimeType === "application/msword" ||
      mimeType === "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    ) {
      return {
        type: "text_file",
        value: attachment.value,
        fileName: attachment.fileName,
      };
    } else {
      return attachment;
    }
  });
  
  // Check if any file attachments still file type, log if so
  processedAttachments.forEach((attachment) => {
    if (attachment.type === "file") {
      console.error(
        `Unhandled file type: ${attachment.mimeType} for ${attachment.fileName}`
      );
    }
  });

  return processedAttachments;
}

/**
 * This is the main Highlight Chat input box, not a reusable Input component.
 */
export const Input = ({ sticky }: { sticky: boolean }) => {
  const {
    attachments,
    input,
    setInput,
    inputIsDisabled,
    promptName,
    promptApp,
  } = useStore(
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
    }
  };

  const onClickContainer = (e: React.MouseEvent) => {
    inputRef.current?.focus();
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

  const getValue = (attachment: AttachmentType) => {
    switch (attachment.type) {
      case "pdf":
        return attachment.value.name;
      case "audio":
        return getAudioAttachmentPreview(attachment);
      case "spreadsheet":
        return attachment.value.name;
      case "file":
        return attachment.fileName;
      case "text_file":
        return attachment.fileName;
      default:
        return attachment.value;
    }
  };

  const preparedAttachments = prepareFileAttachmentsForRender(attachments);

  return (
    <div
      className={`${styles.inputContainer} ${sticky ? styles.sticky : ""}`}
      onClick={onClickContainer}
    >
      {preparedAttachments.length > 0 && (
        <div className="flex gap-2">
          {preparedAttachments.map(
            (attachment: AttachmentType, index: number) => (
              <Attachment
                type={attachment.type}
                value={getValue(attachment)}
                isFile={
                  attachment.type === "pdf" ||
                  (attachment.type === "image" && !!attachment.file) ||
                  attachment.type === "spreadsheet" ||
                  attachment.type === "text_file"
                }
                removeEnabled
                key={index}
              />
            )
          )}
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
      />
    </div>
  );
};
