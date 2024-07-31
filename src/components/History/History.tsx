import styles from "./history.module.scss";
import * as React from "react";
import {useChatHistory} from "@/hooks/useChatHistory";
import Tooltip from "@/components/Tooltip";
import CircleButton from "@/components/CircleButton/CircleButton";
import { Category } from "iconsax-react";
import {useStore} from "@/providers/store-provider";
import {useApi} from "@/hooks/useApi";
import {ChatHistoryItem, Message} from "@/types";
import ContextMenu from "@/components/ContextMenu/ContextMenu";

interface HistoryProps {
  showHistory: boolean;
  setShowHistory: (showHistory: boolean) => void;
}

const History: React.FC<HistoryProps> = ({
  showHistory,
  setShowHistory,
}: HistoryProps) => {
  const {get} = useApi()
  const {history} = useChatHistory();
  const {loadConversation, openModal} = useStore((state) => state);

  const onSelectChat = async (chat: ChatHistoryItem) => {
    const response = await get(`history/${chat.id}/messages`)
    if (!response.ok) {
      // @TODO Error handling
      console.error('Failed to select chat')
      return
    }
    const {messages} = await response.json()
    loadConversation(chat.id, messages.map((message: any) => {
      return {
        type: message.role,
        content: message.content
      } as Message
    }))
  }

  const onDeleteChat = async (chat: ChatHistoryItem) => {
    openModal('delete-chat', chat)
  }

  return (
    <div
      className={`${styles.history} ${showHistory ? styles.show : styles.hide}`}
    >
      <div className={styles.header}>
        <Tooltip tooltip="Hide chats" position="right">
          <CircleButton onClick={() => setShowHistory(!showHistory)}>
            <Category variant={"Bold"} size={24} />
          </CircleButton>
        </Tooltip>
        Chats
      </div>
      <div className={styles.chats}>
        {history?.length > 0 ? (
          history.map((chat) => (
            <ContextMenu
              key={`menu-${chat.id}`}
              items={[
                {label: 'Open Chat', onClick: () => onSelectChat(chat)},
                {divider: true},
                {label: <span className="text-red-400">Delete Chat</span>, onClick: () => onDeleteChat(chat)},
              ]}
              position={'bottom'}
              triggerId={`chat-${chat.id}`}
              wrapperStyle={{width: '100%'}}
            >
              <div key={chat.id} id={`chat-${chat.id}`} className={styles.chat} onClick={() => onSelectChat(chat)}>
                <span className={styles.chatText}>
                  {
                    chat.title.charAt(0) === '"' && chat.title.charAt(chat.title.length - 1) === '"'
                      ? chat.title.substring(1, chat.title.length - 1)
                      : chat.title
                  }
                </span>
              </div>
            </ContextMenu>
          ))
        ) : (
          <div className={styles.baseHistoryItem}>No chat history available</div>
        )}
      </div>
    </div>
  );
};

export default History;
