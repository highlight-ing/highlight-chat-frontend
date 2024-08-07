"use client";

import * as React from "react";
import { TopBarProps } from "@/types";
import styles from "./top-bar.module.scss";
import {
  AddCircle,
  ArrowDown2,
  Clock,
  MessageText,
} from "iconsax-react";
import CircleButton from "@/components/CircleButton/CircleButton";
import Tooltip from "@/components/Tooltip";
import { useStore } from "@/providers/store-provider";
import { useRouter } from "next/navigation";
import Button from "@/components/Button/Button";
import {HighlightIcon} from "@/icons/icons";
import variables from '@/variables.module.scss'

const TopBar: React.FC<TopBarProps> = ({ showHistory, setShowHistory }) => {
  const router = useRouter();

  const { startNewConversation, promptName, openModal, messages } = useStore((state) => ({
    startNewConversation: state.startNewConversation,
    promptName: state.promptName,
    openModal: state.openModal,
    messages: state.messages
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
      <Tooltip
        tooltip="Show chats"
        position="right"
        wrapperStyle={
          showHistory || !setShowHistory ? { visibility: "hidden" } : undefined
        }
      >
        <Button size={'medium'} variant={'ghost-neutral'} onClick={onShowHistoryClick}>
          <Clock size={20} variant={'Bold'}/>
          History
        </Button>
      </Tooltip>

      {
        (promptName || !!messages.length) &&
        <div className={styles.middle}>
          <Tooltip tooltip="Switch chat app" position="bottom">
            <CircleButton
              fitContents={true}
              className={!!promptName ? (!messages.length ? styles.promptSwitchDull : styles.promptSwitch) : undefined}
              onClick={() => openModal('prompts-modal')}
            >
              {
                promptName
                  ? <MessageText variant={"Bold"} size={24}/>
                  : <HighlightIcon size={20} color={variables.light40}/>
              }
              {promptName ?? 'Highlight'}
              <ArrowDown2 size={20} variant={'Bold'}/>
            </CircleButton>
          </Tooltip>
        </div>
      }

      {
        (promptName || messages.length > 0) &&
        <div className="flex gap-1">
          <Tooltip tooltip="Start new chat" position="left">
            <Button size={'medium'} variant={'ghost-neutral'} onClick={onNewChatClick}>
              New
              <AddCircle variant={"Bold"} size={20} />
            </Button>
          </Tooltip>
        </div>
      }
    </div>
  );
};

export default TopBar;
