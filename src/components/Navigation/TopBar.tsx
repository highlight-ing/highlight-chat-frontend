"use client";

import * as React from "react";
import {AssistantMessage, BaseMessage, ChatHistoryItem, TopBarProps, UserMessage} from "@/types";
import styles from "./top-bar.module.scss";
import {
  Add,
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
import {getPromptAppType} from "@/lib/promptapps";
import {useShallow} from "zustand/react/shallow";
import {useApi} from "@/hooks/useApi";
import TopTab from "@/components/Navigation/TopTab";

const TopBar: React.FC<TopBarProps> = ({ showHistory, setShowHistory }) => {
  const router = useRouter();
  const {get} = useApi()

  const {
    startNewConversation,
    promptName,
    openModal,
    messages,
    promptApp,
    promptUserId,
    clearPrompt,
    conversationId,
    openConversations,
    loadConversation
  } = useStore(
    useShallow((state) => ({
      startNewConversation: state.startNewConversation,
      promptName: state.promptName,
      openModal: state.openModal,
      messages: state.messages,
      promptApp: state.promptApp,
      promptUserId: state.promptUserId,
      clearPrompt: state.clearPrompt,
      conversationId: state.conversationId,
      loadConversation: state.loadConversation,
      openConversations: state.openConversations
    }))
  );

  const onNewChatClick = () => {
    startNewConversation();
    clearPrompt()

    router.push("/");
  };

  const onShowHistoryClick = () => {
    if (setShowHistory) {
      setShowHistory(!showHistory);
    }
  };

  const onSelectChat = async (chat: ChatHistoryItem) => {
    const response = await get(`history/${chat.id}/messages`)
    if (!response.ok) {
      // @TODO Error handling
      console.error('Failed to select chat')
      return
    }
    const { messages } = await response.json()
    loadConversation(chat.id, messages.map((message: any) => {
      const baseMessage: BaseMessage = {
        role: message.role,
        content: message.content,
      };

      if (message.role === 'user') {
        return {
          ...baseMessage,
          context: message.context,
          ocr_text: message.ocr_text,
          clipboard_text: message.clipboard_text,
          image_url: message.image_url
        } as UserMessage;
      } else {
        return baseMessage as AssistantMessage;
      }
    }))
  }

  const promptType = promptApp ? getPromptAppType(promptUserId, promptApp) : undefined

  return (
    <div className={styles.topBar}>
      <div className={'flex items-center gap-1'}>
        <Tooltip
          tooltip="View chat history"
          position="right"
          wrapperStyle={
            showHistory || !setShowHistory ? { visibility: "hidden" } : undefined
          }
        >
          <CircleButton onClick={onShowHistoryClick}>
            <Clock size={20} variant={'Bold'}/>
          </CircleButton>
        </Tooltip>
        {
          openConversations.map(conversation => {
            return (
              <TopTab
                conversation={conversation}
                onOpen={_ => onSelectChat(conversation)}
                isActive={conversation.id === conversationId}
              />
            )
          })
        }
        {
          // (promptName || !!messages.length) &&
          <Tooltip tooltip="Start new chat" position="bottom">
            <CircleButton onClick={onNewChatClick}>
              <Add variant={"Linear"} size={20} />
            </CircleButton>
          </Tooltip>
        }
      </div>

      {/*{*/}
      {/*  (promptName || !!messages.length) &&*/}
      {/*  <div className={styles.middle}>*/}
      {/*    <Tooltip tooltip="Switch chat app" position="bottom">*/}
      {/*      <CircleButton*/}
      {/*        fitContents={true}*/}
      {/*        className={`${styles.promptSwitch} ${promptType ? styles[(!promptName || !messages.length) ? 'default' : promptType] : ''}`}*/}
      {/*        onClick={() => openModal('prompts-modal')}*/}
      {/*      >*/}
      {/*        {*/}
      {/*          promptName*/}
      {/*            ? <MessageText variant={"Bold"} size={24}/>*/}
      {/*            : <HighlightIcon size={20} color={variables.light40}/>*/}
      {/*        }*/}
      {/*        {promptName ?? 'Highlight'}*/}
      {/*        <ArrowDown2 size={20} variant={'Bold'}/>*/}
      {/*      </CircleButton>*/}
      {/*    </Tooltip>*/}
      {/*  </div>*/}
      {/*}*/}

      {/*{*/}
      {/*  (promptName || messages.length > 0) &&*/}
      {/*  <div className="flex gap-1">*/}
      {/*    <Tooltip tooltip="Start new chat" position="left">*/}
      {/*      <Button size={'medium'} variant={'ghost-neutral'} onClick={onNewChatClick}>*/}
      {/*        New*/}
      {/*        <AddCircle variant={"Bold"} size={20} />*/}
      {/*      </Button>*/}
      {/*    </Tooltip>*/}
      {/*  </div>*/}
      {/*}*/}
    </div>
  );
};

export default TopBar;
