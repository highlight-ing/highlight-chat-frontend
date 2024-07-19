import { useRef, useState } from "react";
import { DocumentUpload, GalleryAdd, Sound } from "iconsax-react";
import Highlight from "@highlight-ai/app-runtime";

import { PaperclipIcon } from "../../icons/icons";
import ContextMenu, { MenuItemType } from "../ContextMenu";
import styles from "./attachments-button.module.scss";
import { useStore } from "@/providers/store-provider";

export const AttachmentsButton = () => {
  const [screenshot, setScreenshot] = useState<string>("");
  const [audio, setAudio] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addAttachment } = useStore((state) => ({
    addAttachment: state.addAttachment,
  }));

  const updateAttachments = async () => {
    const [screenshot, audio] = await Promise.all([
      Highlight.user.getScreenshot(),
      Highlight.user.getAudio(false),
    ]);
    setScreenshot(screenshot);
    setAudio(audio);
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const onAddAudio = async () => {
    addAttachment({ type: "audio", value: audio });
  };

  const onAddFile = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  };

  const onAddScreenshot = async () => {
    if (screenshot.length > 0) {
      addAttachment({
        type: "image",
        value: screenshot,
      });
    }
  };

  const audioMenuItem = {
    label: (
      <div className={styles.menuItem}>
        <Sound size={24} color="#fff" />
        Audio Memory
      </div>
    ),
    onClick: onAddAudio,
  };

  const screenshotMenuItem = {
    label: (
      <div className={styles.menuItem}>
        <GalleryAdd variant="Bold" size={24} color="#fff" />
        Screenshot
      </div>
    ),
    onClick: onAddScreenshot,
  };

  const menuItems = [
    audio && audioMenuItem,
    screenshot && screenshotMenuItem,
    {
      label: (
        <div className={styles.menuItem}>
          <DocumentUpload size={24} color="#fff" />
          Upload from computer
        </div>
      ),
      onClick: handleAttachmentClick,
    },
  ].filter(Boolean) as MenuItemType[];

  return (
    <ContextMenu
      position="top"
      alignment="left"
      triggerId="attachments-button"
      leftClick={true}
      items={menuItems}
      onOpen={updateAttachments}
    >
      <button type="button" className={styles.button} id="attachments-button">
        <PaperclipIcon />
        <input
          type="file"
          ref={fileInputRef}
          onChange={onAddFile}
          accept="image/*,application/pdf"
          className={styles.hiddenInput}
        />
      </button>
    </ContextMenu>
  );
};
