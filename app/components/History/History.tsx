import styles from './history.module.scss';
import * as React from 'react';
import {useChatHistory} from "@/app/hooks/useChatHistory";

interface HistoryProps {
  showHistory: boolean
}
const History: React.FC<HistoryProps> = ({showHistory}: HistoryProps) => {
  const chatHistory = useChatHistory()
  return (
    <div className={`${styles.history} ${showHistory ? styles.show : styles.hide}`}>
      Chat History
    </div>
  )
}

export default History
