import styles from './history.module.scss'
import * as React from 'react'
import { useChatHistory } from '@/hooks/useChatHistory'
import Tooltip from '@/components/Tooltip'
import CircleButton from '@/components/CircleButton/CircleButton'
import { Category, Clock } from 'iconsax-react'
import { useStore } from '@/providers/store-provider'
import { useApi } from '@/hooks/useApi'
import { ChatHistoryItem, Message } from '@/types'
import ContextMenu from '@/components/ContextMenu/ContextMenu'
import { BaseMessage, UserMessage, AssistantMessage } from '@/types'
import Button from '@/components/Button/Button'
import { useMemo, useEffect, useCallback } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { trackEvent } from '@/utils/amplitude'
import Spinner from '@/components/Spinner'

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
  const { history, isLoadingHistory } = useChatHistory()

  const { today, lastWeek, lastMonth, older } = useMemo(() => {
    return sortArrayByDate(history)
  }, [history])

  const toggleHistory = () => {
    setShowHistory(!showHistory)
  }

  return (
    <div className={`${styles.history} ${showHistory ? styles.show : styles.hide}`}>
      <div className={styles.header}>
        <Tooltip tooltip="Hide chats" position="right">
          <Button size={'medium'} variant={'ghost-neutral'} onClick={toggleHistory}>
            <Clock size={20} variant={'Bold'} />
            History
          </Button>
        </Tooltip>
      </div>
      <div className={styles.chats}>
        {isLoadingHistory ? (
          <div className="flex flex-grow items-center justify-center">
            <Spinner size="medium" />
          </div>
        ) : !history?.length ? (
          <div className={styles.baseHistoryItem}>No chat history available</div>
        ) : (
          <>
            {today.length > 0 && (
              <>
                <h1>Today</h1>
                {today.map((chat) => (
                  <HistoryItem key={chat.id} chat={chat} />
                ))}
              </>
            )}
            {lastWeek.length > 0 && (
              <>
                <h1>Past 7 days</h1>
                {lastWeek.map((chat) => (
                  <HistoryItem key={chat.id} chat={chat} />
                ))}
              </>
            )}
            {lastMonth.length > 0 && (
              <>
                <h1>Past 30 days</h1>
                {lastMonth.map((chat) => (
                  <HistoryItem key={chat.id} chat={chat} />
                ))}
              </>
            )}
            {older.length > 0 && (
              <>
                <h1>Older than 30 days</h1>
                {older.map((chat) => (
                  <HistoryItem key={chat.id} chat={chat} />
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

const HistoryItem = ({ chat }: { chat: ChatHistoryItem }) => {
  const { get } = useApi()
  const { loadConversation, openModal, setIsLoadingMessages, resetConversationId, setIsChatting } = useStore(
    useShallow((state) => ({
      loadConversation: state.loadConversation,
      openModal: state.openModal,
      setIsLoadingMessages: state.setIsLoadingMessages,
      resetConversationId: state.resetConversationId,
      setIsChatting: state.setIsChatting,
    })),
  )

  const onSelectChat = useCallback(
    async (chat: ChatHistoryItem) => {
      resetConversationId()
      setIsLoadingMessages(true)
      setIsChatting(true) // Immediately show Messages component

      // Fetch messages asynchronously
      get(`history/${chat.id}/messages`).then(async (response) => {
        if (!response.ok) {
          console.error('Failed to select chat')
          trackEvent('HL Chat Select Chat Error', {
            chatId: chat.id,
            error: 'Failed to fetch messages',
          })
          setIsLoadingMessages(false)
          return
        }
        const { messages } = await response.json()
        loadConversation(
          chat.id,
          messages.map((message: any) => {
            const baseMessage: BaseMessage = {
              role: message.role,
              content: message.content,
            }

            if (message.role === 'user') {
              return {
                ...baseMessage,
                context: message.context,
                ocr_text: message.ocr_text,
                clipboard_text: message.clipboard_text,
                image_url: message.image_url,
              } as UserMessage
            } else {
              return baseMessage as AssistantMessage
            }
          }),
        )
        trackEvent('HL Chat Opened', {
          chatId: chat.id,
          messageCount: messages.length,
          source: 'history_item',
        })
        setIsLoadingMessages(false)
      })
    },
    [get, loadConversation, resetConversationId, setIsLoadingMessages, setIsChatting],
  )

  const onDeleteChat = async (chat: ChatHistoryItem) => {
    openModal('delete-chat', chat)
    trackEvent('HL Chat Delete Initiated', {
      chatId: chat.id,
    })
  }

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
