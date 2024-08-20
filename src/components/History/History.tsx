import styles from './history.module.scss'
import * as React from 'react'
import { useChatHistory } from '@/hooks/useChatHistory'
import Tooltip from '@/components/Tooltip/Tooltip'
import { Category, Clock } from 'iconsax-react'
import { useStore } from '@/providers/store-provider'
import { useApi } from '@/hooks/useApi'
import { ChatHistoryItem, Message } from '@/types'
import ContextMenu from '@/components/ContextMenu/ContextMenu'
import { BaseMessage, UserMessage, AssistantMessage } from '@/types'
import Button from '@/components/Button/Button'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import CircleButton from '@/components/CircleButton/CircleButton'
import { trackEvent } from '@/utils/amplitude'

interface HistoryProps {
  showHistory: boolean
  setShowHistory: (showHistory: boolean) => void
}

function sortArrayByDate(inputArray: ChatHistoryItem[]) {
  const now = new Date()
  const oneDayAgo = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const today: ChatHistoryItem[] = []
  const lastWeek: ChatHistoryItem[] = []
  const lastMonth: ChatHistoryItem[] = []
  const older: ChatHistoryItem[] = []

  inputArray.forEach((item) => {
    const createdAt = new Date(item.updated_at)

    if (createdAt >= oneDayAgo) {
      today.push(item)
    } else if (createdAt >= oneWeekAgo) {
      lastWeek.push(item)
    } else if (createdAt >= oneMonthAgo) {
      lastMonth.push(item)
    } else {
      older.push(item)
    }
  })

  return {
    today,
    lastWeek,
    lastMonth,
    older,
  }
}

const History: React.FC<HistoryProps> = ({ showHistory, setShowHistory }: HistoryProps) => {
  const initialFetchDone = useRef(false)
  const conversationId = useStore((state) => state.conversationId)
  const { history, refreshChatHistory, refreshChatItem } = useChatHistory()

  const { today, lastWeek, lastMonth, older } = useMemo(() => {
    return sortArrayByDate(history)
  }, [history])

  const toggleHistory = () => {
    setShowHistory(!showHistory)
  }

  const onOpenChat = () => {
    setShowHistory(false)
  }

  useEffect(() => {
    if (!initialFetchDone.current) {
      // Initial fetch
      console.log('Fetching chat history')
      refreshChatHistory()
      initialFetchDone.current = true
    } else if (conversationId && !history.some((chat) => chat.id === conversationId)) {
      const fetchAndSafeRetry = async (retries: number) => {
        // New conversation found after initial fetch
        console.log('Fetching new conversation and adding it to history')
        const newConversation = await refreshChatItem(conversationId)
        if (newConversation) {
          console.log('Added conversation to history')
          return
        }
        if (retries > 0) {
          console.log('Failed to fetch new conversation, retrying in 1s')
          setTimeout(() => {
            fetchAndSafeRetry(--retries)
          }, 1000)
        } else {
          console.error('Repeatedly failed to fetch new conversation, giving up')
        }
      }
      fetchAndSafeRetry(5)
    }
  }, [history, conversationId])

  return (
    <div className={`${styles.history} ${showHistory ? styles.show : styles.hide}`}>
      <div className={styles.header}>
        <Tooltip tooltip="Hide chat history" position="bottom">
          <CircleButton fitContents={true} onClick={toggleHistory}>
            <Clock size={20} variant={'Bold'} />
            <span className={'text-sm'}>Chat History</span>
          </CircleButton>
        </Tooltip>
      </div>
      <div className={styles.chats}>
        {!history?.length ? (
          <div className={styles.baseHistoryItem}>No chat history available</div>
        ) : (
          <>
            {today.length > 0 && (
              <>
                <h1>Today</h1>
                {today.map((chat) => (
                  <HistoryItem key={chat.id} chat={chat} onOpenChat={onOpenChat} />
                ))}
              </>
            )}
            {lastWeek.length > 0 && (
              <>
                <h1>Past 7 days</h1>
                {lastWeek.map((chat) => (
                  <HistoryItem key={chat.id} chat={chat} onOpenChat={onOpenChat} />
                ))}
              </>
            )}
            {lastMonth.length > 0 && (
              <>
                <h1>Past 30 days</h1>
                {lastMonth.map((chat) => (
                  <HistoryItem key={chat.id} chat={chat} onOpenChat={onOpenChat} />
                ))}
              </>
            )}
            {older.length > 0 && (
              <>
                <h1>Older than 30 days</h1>
                {older.map((chat) => (
                  <HistoryItem key={chat.id} chat={chat} onOpenChat={onOpenChat} />
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default History

// Title retry logic
const MAX_RETRIES = 3
const RETRY_INTERVAL = 10000

const HistoryItem = ({ chat, onOpenChat }: { chat: ChatHistoryItem; onOpenChat?: () => void }) => {
  const fetchRetryRef = useRef<NodeJS.Timeout>()
  const [fetchRetryCount, setFetchRetryCount] = useState(0)
  const { refreshChatItem } = useChatHistory()
  const { addOrUpdateOpenConversation, openModal, setConversationId } = useStore(
    useShallow((state) => ({
      setConversationId: state.setConversationId,
      openModal: state.openModal,
      addOrUpdateOpenConversation: state.addOrUpdateOpenConversation,
    })),
  )

  const onSelectChat = async (chat: ChatHistoryItem) => {
    if (typeof onOpenChat === 'function') {
      onOpenChat()
    }
    addOrUpdateOpenConversation(chat)
    setConversationId(chat.id)

    // @TODO move to use chat loading hook
    trackEvent('HL Chat Opened', {
      chatId: chat.id,
      // messageCount: messages.length,
      source: 'history_item',
    })
  }

  const onDeleteChat = async (chat: ChatHistoryItem) => {
    openModal('delete-chat', chat)
    trackEvent('HL Chat Delete Initiated', {
      chatId: chat.id,
    })
  }

  useEffect(() => {
    if (chat.title === 'New Conversation' && fetchRetryCount < MAX_RETRIES && !fetchRetryRef.current) {
      console.log(`Fetching updated conversation, ${MAX_RETRIES - fetchRetryCount} tries remaining`)

      // Retry until title is assigned
      fetchRetryRef.current = setTimeout(async () => {
        const updatedConversation = await refreshChatItem(chat.id)
        if (updatedConversation && updatedConversation.title !== 'New Conversation') {
          setFetchRetryCount(0)
          console.log('Updated conversation:', updatedConversation.title)
        } else {
          setFetchRetryCount(fetchRetryCount + 1)
        }
        fetchRetryRef.current = undefined
      }, RETRY_INTERVAL)
    }
  }, [chat, fetchRetryCount])

  return (
    <ContextMenu
      key={`menu-${chat.id}`}
      items={[
        {
          label: 'Open Chat',
          onClick: () => {
            onSelectChat(chat)
            trackEvent('HL Chat Opened', {
              chatId: chat.id,
              source: 'context_menu',
            })
          },
        },
        { divider: true },
        {
          label: <span className="text-red-400">Delete Chat</span>,
          onClick: () => onDeleteChat(chat),
        },
      ]}
      position={'bottom'}
      triggerId={`chat-${chat.id}`}
      wrapperStyle={{ width: '100%' }}
    >
      <div key={chat.id} id={`chat-${chat.id}`} className={styles.chat} onClick={() => onSelectChat(chat)}>
        <span className={styles.chatText}>
          {chat.title.charAt(0) === '"' && chat.title.charAt(chat.title.length - 1) === '"'
            ? chat.title.substring(1, chat.title.length - 1)
            : chat.title}
        </span>
      </div>
    </ContextMenu>
  )
}
