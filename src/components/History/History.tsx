import styles from "./history.module.scss";
import * as React from "react";
import {ChatHistoryItem, useChatHistory} from "@/hooks/useChatHistory";
import Tooltip from "@/components/Tooltip";
import CircleButton from "@/components/CircleButton/CircleButton";
import { Category } from "iconsax-react";
import {useStore} from "@/providers/store-provider";
import {useApi} from "@/hooks/useApi";
import {Message} from "@/types";

interface HistoryProps {
  showHistory: boolean;
  setShowHistory: (showHistory: boolean) => void;
}

const History: React.FC<HistoryProps> = ({
  showHistory,
  setShowHistory,
}: HistoryProps) => {
  const {get} = useApi()
  const chatHistory = useChatHistory();
  const loadConversation = useStore(({loadConversation}) => loadConversation);

  const onSelectChat = async (chat: ChatHistoryItem) => {
    const response = await get(`history/${chat.id}/messages`)
    const {messages} = await response.json()
    loadConversation(chat.id, messages.map((message: any) => {
      return {
        type: message.role,
        content: message.content
      } as Message
    }))
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
        {chatHistory?.length > 0 ? (
          chatHistory.map((chat) => (
            <div key={chat.id} className={styles.chat} onClick={() => onSelectChat(chat)}>
              <span className={styles.chatText}>{chat.title}</span>
            </div>
          ))
        ) : (
          <div>No chat history available</div>
        )}
      </div>
    </div>
  );
};

export default History;
