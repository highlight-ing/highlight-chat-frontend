import {
  ClipboardText,
  DocumentUpload,
  GalleryAdd,
  Sound,
} from "iconsax-react";
import Highlight from "@highlight-ai/app-runtime";

import { PaperclipIcon } from "../icons/icons";
import ContextMenu from "./ContextMenu";
import { useInputContext } from "../context/InputContext";
import { useRef } from "react";
import { useState } from "react";
import Spinner from "./Spinner";

export const AttachmentsButton = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoadingAttachment, setIsLoadingAttachment] = useState(false);
  const { addAttachment } = useInputContext();

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const onAddAudio = async () => {
    setIsLoadingAttachment(true);
    const audio = await Highlight.user.getAudio(true);
    addAttachment({ type: "audio", value: audio });
    setIsLoadingAttachment(false);
  };

  const onAddFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsLoadingAttachment(true);
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      addAttachment({
        type: "image",
        value: URL.createObjectURL(file),
        file: file,
      });
    } else if (file && file.type === "application/pdf") {
      addAttachment({
        type: "pdf",
        value: file,
      });
    } else {
      alert("Please select a valid image or PDF file.");
    }
    setIsLoadingAttachment(false);
  };

  const onAddScreenshot = async () => {
    setIsLoadingAttachment(true);
    const screenshot = await Highlight.user.getScreenshot();
    if (screenshot?.length > 0) {
      addAttachment({
        type: "image",
        value: screenshot,
      });
    }
    setIsLoadingAttachment(false);
  };

  const menuItems = [
    {
      label: (
        <div className="flex items-center gap-2">
          <Sound size={24} color="#fff" />
          Audio Memory
        </div>
      ),
      onClick: onAddAudio,
    },
    // {
    //   label: (
    //     <div className="flex items-center gap-2">
    //       <ClipboardText size={24} color="#fff" />
    //       Clipboard
    //     </div>
    //   )
    //   onClick: onAddClipboard
    // },
    {
      label: (
        <div className="flex items-center gap-2">
          <GalleryAdd variant="Bold" size={24} color="#fff" />
          Screenshot
        </div>
      ),
      onClick: onAddScreenshot,
    },
    {
      label: (
        <div className="flex items-center gap-2">
          <DocumentUpload size={24} color="#fff" />
          Upload from computer
        </div>
      ),
      onClick: handleAttachmentClick,
    },
  ];

  if (isLoadingAttachment) {
    return <Spinner size={24} />;
  }

  return (
    <ContextMenu
      position="top"
      alignment="left"
      triggerId="attachments-button"
      leftClick={true}
      items={menuItems}
    >
      <button
        type="button"
        className="flex items-center justify-center rounded-full hover:bg-light-10 w-9 h-9"
        id="attachments-button"
      >
        <PaperclipIcon />
        <input
          type="file"
          ref={fileInputRef}
          onChange={onAddFile}
          accept="image/*,application/pdf"
          className="hidden"
        />
      </button>
    </ContextMenu>
  );
};
