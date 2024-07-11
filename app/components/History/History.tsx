import styles from './history.module.scss';
import * as React from 'react';
import {useChatHistory} from "@/app/hooks/useChatHistory";
import Tooltip from "@/app/components/Tooltip";
import CircleButton from "@/app/components/CircleButton/CircleButton";
import {Category} from "iconsax-react";

const HistoryData = {
  conversations: [
    {
      context: 'This is a new conversation with Highlight Chat',
      created_at: '2024-07-10T19:41:43.184414+00:00',
      id: '80305b5d-2c49-49d7-be17-3080167113e7',
      messages: [],
      updated_at: '2024-07-10T19:41:43.184414+00:00',
      userId: '0a737dcd-48bb-4bd9-aa19-110a03333318'
    },
    {
      context: 'This is a recent conversation with Highlight Chat',
      created_at: '2024-07-10T12:41:43.184414+00:00',
      id: '80305b5d-2c49-49d7-be17-3080167113e7',
      messages: [],
      updated_at: '2024-07-10T12:41:43.184414+00:00',
      userId: '0a737dcd-48bb-4bd9-aa19-110a03333318'
    }
  ]
}

interface HistoryProps {
  showHistory: boolean
  setShowHistory: (showHistory: boolean) => void
}
const History: React.FC<HistoryProps> = ({showHistory, setShowHistory}: HistoryProps) => {
  // const chatHistory = useChatHistory()
  return (
    <div className={`${styles.history} ${showHistory ? styles.show : styles.hide}`}>
      <div className={styles.header}>
        <Tooltip tooltip="Hide chats" position="right">
          <CircleButton onClick={() => setShowHistory(!showHistory)}>
            <Category variant={"Bold"} size={24}/>
          </CircleButton>
        </Tooltip>
        Chats
      </div>
      <div className={styles.chats}>
        {
          HistoryData.conversations.map(chat => {
            return (
              <div className={styles.chat}>
                <span className={styles.chatText}>{chat.context}</span>
              </div>
            )
          })
        }
      </div>
    </div>
  )
}

export default History
