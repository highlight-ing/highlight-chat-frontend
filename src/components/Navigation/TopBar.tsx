"use client";

import * as React from "react";
import { TopBarProps } from "../../types";

import styles from "./top-bar.module.scss";
import {
  AddCircle,
  ArrowDown2,
  ArrowLeft,
  ArrowLeft2,
  Category,
  DocumentText,
} from "iconsax-react";
import CircleButton from "@/components/CircleButton/CircleButton";
import Tooltip from "@/components/Tooltip";
import { useStore } from "@/providers/store-provider";
import { useRouter } from "next/navigation";
import {
  Dropdown,
  DropdownButton,
  DropdownItem,
  DropdownMenu,
} from "@/components/catalyst/dropdown";

function AppDropdown() {
  const router = useRouter();

  const { promptName, clearPrompt } = useStore((state) => ({
    promptName: state.promptName,
    clearPrompt: state.clearPrompt,
  }));

  const onBackToHighlightChat = () => {
    clearPrompt();
    router.push("/");
  };

  return (
    <Dropdown>
      <DropdownButton plain>
        {promptName || "Highlight Chat"}
        <ArrowDown2 size={20} />
      </DropdownButton>
      <DropdownMenu>
        <DropdownItem href="/prompts">
          <DocumentText size={20} className="mr-2" />
          View Prompts
        </DropdownItem>
        {promptName && (
          <DropdownItem onClick={onBackToHighlightChat}>
            <ArrowLeft size={20} className="mr-2" />
            Back to Highlight Chat
          </DropdownItem>
        )}
      </DropdownMenu>
    </Dropdown>
  );
}

const TopBar: React.FC<TopBarProps> = ({ showHistory, setShowHistory }) => {
  const router = useRouter();

  const { startNewConversation, promptName } = useStore((state) => ({
    startNewConversation: state.startNewConversation,
    promptName: state.promptName,
  }));

  const onNewChatClick = () => {
    startNewConversation();

    router.push("/");
  };

  const onShowHistoryClick = () => {
    if (setShowHistory) {
      setShowHistory(!showHistory);
    }
  };

  return (
    <div className={styles.topBar}>
      {/* @TODO re-enable when history is working, set condition back to !showHistory */}
      <Tooltip
        tooltip="Show chats"
        position="right"
        wrapperStyle={showHistory ? { visibility: "hidden" } : undefined}
      >
        <CircleButton onClick={onShowHistoryClick}>
          <Category variant={"Bold"} size={24} />
        </CircleButton>
      </Tooltip>
      <AppDropdown />

      <Tooltip tooltip="Start new chat" position="left">
        <CircleButton onClick={onNewChatClick}>
          <AddCircle variant={"Bold"} size={24} />
        </CircleButton>
      </Tooltip>
    </div>
  );
};

export default TopBar;
