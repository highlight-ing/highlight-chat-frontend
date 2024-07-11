import styles from "./history.module.scss";
import * as React from "react";
import { useChatHistory } from "@/hooks/useChatHistory";
import Tooltip from "@/components/Tooltip";
import CircleButton from "@/components/CircleButton/CircleButton";
import { Category } from "iconsax-react";

interface HistoryProps {
  showHistory: boolean;
  setShowHistory: (showHistory: boolean) => void;
}

const History: React.FC<HistoryProps> = ({
  showHistory,
  setShowHistory,
}: HistoryProps) => {
  const chatHistory = useChatHistory();

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
        {chatHistory.length > 0 ? (
          chatHistory.map((chat) => (
            <div key={chat.id} className={styles.chat}>
              <span className={styles.chatText}>{chat.context}</span>
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
