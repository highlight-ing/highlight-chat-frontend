import styles from "./history.module.scss";
import * as React from "react";
import {useChatHistory} from "@/hooks/useChatHistory";
import Tooltip from "@/components/Tooltip";
import CircleButton from "@/components/CircleButton/CircleButton";
import {Category, Clock} from "iconsax-react";
import {useStore} from "@/providers/store-provider";
import {useApi} from "@/hooks/useApi";
import {ChatHistoryItem, Message} from "@/types";
import ContextMenu from "@/components/ContextMenu/ContextMenu";
import { BaseMessage, UserMessage, AssistantMessage } from "@/types";
import Button from "@/components/Button/Button";
import {useMemo, useEffect} from "react";
import {useShallow} from "zustand/react/shallow";
import { trackEvent } from '@/utils/amplitude';

interface HistoryProps {
  showHistory: boolean;
  setShowHistory: (showHistory: boolean) => void;
}

function sortArrayByDate(inputArray: ChatHistoryItem[]) {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const today: ChatHistoryItem[] = [];
  const lastWeek: ChatHistoryItem[] = [];
  const lastMonth: ChatHistoryItem[] = [];
  const older: ChatHistoryItem[] = [];

  inputArray.forEach(item => {
    const createdAt = new Date(item.updated_at);

    if (createdAt >= oneDayAgo) {
      today.push(item);
    } else if (createdAt >= oneWeekAgo) {
      lastWeek.push(item);
    } else if (createdAt >= oneMonthAgo) {
      lastMonth.push(item);
    } else {
      older.push(item);
    }
  });

  return {
    today,
    lastWeek,
    lastMonth,
    older
  };
}


const History: React.FC<HistoryProps> = ({
  showHistory,
  setShowHistory,
}: HistoryProps) => {
  const {history} = useChatHistory();

  const {today, lastWeek, lastMonth, older} = useMemo(() => {
    return sortArrayByDate(history)
  }, [history])

  useEffect(() => {
    trackEvent('HL Chat History Viewed', {});
  }, []);

  useEffect(() => {
    trackEvent('HL Chat Conversation Selected', { conversationId: history.length });
  }, [history.length]);

  const toggleHistory = () => {
    setShowHistory(!showHistory);
    trackEvent('HL Chat History Toggled', { 
      newState: !showHistory ? 'visible' : 'hidden',
      historyItemCount: history.length
    });
  };

  return (
    <div
      className={`${styles.history} ${showHistory ? styles.show : styles.hide}`}
    >
      <div className={styles.header}>
        <Tooltip tooltip="Hide chats" position="right">
          <Button size={'medium'} variant={'ghost-neutral'} onClick={toggleHistory}>
            <Clock size={20} variant={'Bold'}/>
            History
          </Button>
        </Tooltip>
      </div>
      <div className={styles.chats}>
        {
          !history?.length
            ? <div className={styles.baseHistoryItem}>No chat history available</div>
            : (
              <>
                {
                  today.length > 0 &&
                  <>
                    <h1>Today</h1>
                    {today.map((chat) => <HistoryItem key={chat.id} chat={chat}/>)}
                  </>
                }
                {
                  lastWeek.length > 0 &&
                  <>
                    <h1>Past 7 days</h1>
                    {lastWeek.map((chat) => <HistoryItem key={chat.id} chat={chat}/>)}
                  </>
                }
                {
                  lastMonth.length > 0 &&
                  <>
                    <h1>Past 30 days</h1>
                    {lastMonth.map((chat) => <HistoryItem key={chat.id} chat={chat}/>)}
                  </>
                }
                {
                  older.length > 0 &&
                  <>
                    <h1>Older than 30 days</h1>
                    {older.map((chat) => <HistoryItem key={chat.id} chat={chat}/>)}
                  </>
                }
              </>
            )
        }
      </div>
    </div>
  );
};

export default History;

const HistoryItem = ({chat}: {chat: ChatHistoryItem}) => {
  const {get} = useApi()
  const {loadConversation, openModal} = useStore(
    useShallow((state) => ({
      loadConversation: state.loadConversation,
      openModal: state.openModal
    }))
  );

  const onSelectChat = async (chat: ChatHistoryItem) => {
    const response = await get(`history/${chat.id}/messages`)
    if (!response.ok) {
      console.error('Failed to select chat')
      trackEvent('HL Chat Select Chat Error', { 
        chatId: chat.id,
        error: 'Failed to fetch messages'
      });
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
    trackEvent('HL Chat Selected', { 
      chatId: chat.id,
      messageCount: messages.length
    });
  }

  const onDeleteChat = async (chat: ChatHistoryItem) => {
    openModal('delete-chat', chat)
    trackEvent('HL Chat Delete Initiated', { 
      chatId: chat.id
    });
  }

  return (
    <ContextMenu
      key={`menu-${chat.id}`}
      items={[
        {
          label: 'Open Chat', 
          onClick: () => {
            onSelectChat(chat);
            trackEvent('HL Chat Opened From Context Menu', { 
              chatId: chat.id
            });
          }
        },
        {divider: true},
        {
          label: <span className="text-red-400">Delete Chat</span>, 
          onClick: () => onDeleteChat(chat)
        },
      ]}
      position={'bottom'}
      triggerId={`chat-${chat.id}`}
      wrapperStyle={{width: '100%'}}
    >
      <div 
        key={chat.id} 
        id={`chat-${chat.id}`} 
        className={styles.chat} 
        onClick={() => onSelectChat(chat)}
      >
        <span className={styles.chatText}>
          {
            chat.title.charAt(0) === '"' && chat.title.charAt(chat.title.length - 1) === '"'
              ? chat.title.substring(1, chat.title.length - 1)
              : chat.title
          }
        </span>
      </div>
    </ContextMenu>
  )
}