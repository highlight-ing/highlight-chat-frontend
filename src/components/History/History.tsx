import styles from './history.module.scss'
import variables from '@/variables.module.scss'
import * as React from 'react'
import { useChatHistory } from '@/hooks/useChatHistory'
import Tooltip from '@/components/Tooltip/Tooltip'
import { Clock, Trash } from 'iconsax-react'
import { useStore } from '@/providers/store-provider'
import { ChatHistoryItem } from '@/types'
import ContextMenu from '@/components/ContextMenu/ContextMenu'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import CircleButton from '@/components/CircleButton/CircleButton'
import { trackEvent } from '@/utils/amplitude'
import { useApi } from '@/hooks/useApi'
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner'

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
  const { deleteRequest } = useApi()
  const initialFetchDone = useRef(false)
  const conversationId = useStore((state) => state.conversationId)
  const startNewConversation = useStore((state) => state.startNewConversation)
  const removeOpenConversation = useStore((state) => state.removeOpenConversation)
  const setHistory = useStore((state) => state.setHistory)
  const { history, refreshChatHistory, refreshChatItem } = useChatHistory()
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectedHistoryItems, setSelectedHistoryItems] = useState<string[]>([])
  const [isDeleting, setIsDeleting] = useState(false)

  const { today, lastWeek, lastMonth, older } = useMemo(() => {
    return sortArrayByDate(history)
  }, [history])

  const toggleHistory = () => {
    setShowHistory(!showHistory)
  }

  const onOpenChat = () => {
    setShowHistory(false)
  }

  const onSelectChat = (chatId: string) => {
    let newItems = [...selectedHistoryItems]
    if (newItems.includes(chatId)) {
      newItems = newItems.filter((id) => id !== chatId)
    } else {
      newItems.push(chatId)
    }
    setSelectedHistoryItems(newItems)
  }

  const handleDeleteSelections = async () => {
    setIsDeleting(true)
    setHistory(history.filter((item) => !selectedHistoryItems.includes(item.id)))
    for (const chatId of selectedHistoryItems) {
      const response = await deleteRequest(`history/${chatId}`)
      if (!response.ok) {
        // @TODO Error handling
        console.error('Failed to delete')
        return
      }
      if (chatId === conversationId) {
        startNewConversation()
      }
      removeOpenConversation(chatId)
    }
    await refreshChatHistory()
    setSelectedHistoryItems([])
    setIsDeleting(false)
    setIsSelecting(false)
  }

  // Handle fetching history, and detecting new chats to fetch
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
        const newConversation = await refreshChatItem(conversationId, true)
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

  // Reset history selections upon collapse
  useEffect(() => {
    if (!showHistory && isSelecting) {
      setIsSelecting(false)
    }
  }, [showHistory, isSelecting, selectedHistoryItems])

  useEffect(() => {
    if (!isSelecting && selectedHistoryItems.length > 0) {
      setSelectedHistoryItems([])
    }
  }, [isSelecting, selectedHistoryItems])

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
                <div className={`${styles.chatGroupHeader} ${isSelecting ? styles.selecting : ''}`}>
                  <span>Today</span>
                  <div className={styles.edit} onClick={() => setIsSelecting(!isSelecting)}>
                    {isSelecting ? 'Done' : 'Edit'}
                  </div>
                </div>
                {today.map((chat) => (
                  <HistoryItem
                    key={chat.id}
                    chat={chat}
                    onOpenChat={onOpenChat}
                    isSelecting={isSelecting}
                    isSelected={selectedHistoryItems.includes(chat.id)}
                    onSelect={() => onSelectChat(chat.id)}
                  />
                ))}
              </>
            )}
            {lastWeek.length > 0 && (
              <>
                <div className={`${styles.chatGroupHeader} ${isSelecting ? styles.selecting : ''}`}>
                  <span>Past 7 days</span>
                  <div className={styles.edit} onClick={() => setIsSelecting(!isSelecting)}>
                    {isSelecting ? 'Done' : 'Edit'}
                  </div>
                </div>
                {lastWeek.map((chat) => (
                  <HistoryItem
                    key={chat.id}
                    chat={chat}
                    onOpenChat={onOpenChat}
                    isSelecting={isSelecting}
                    isSelected={selectedHistoryItems.includes(chat.id)}
                    onSelect={() => onSelectChat(chat.id)}
                  />
                ))}
              </>
            )}
            {lastMonth.length > 0 && (
              <>
                <div className={`${styles.chatGroupHeader} ${isSelecting ? styles.selecting : ''}`}>
                  <span>Past 30 days</span>
                  <div className={styles.edit} onClick={() => setIsSelecting(!isSelecting)}>
                    {isSelecting ? 'Done' : 'Edit'}
                  </div>
                </div>
                {lastMonth.map((chat) => (
                  <HistoryItem
                    key={chat.id}
                    chat={chat}
                    onOpenChat={onOpenChat}
                    isSelecting={isSelecting}
                    isSelected={selectedHistoryItems.includes(chat.id)}
                    onSelect={() => onSelectChat(chat.id)}
                  />
                ))}
              </>
            )}
            {older.length > 0 && (
              <>
                <div className={`${styles.chatGroupHeader} ${isSelecting ? styles.selecting : ''}`}>
                  <span>Older than 30 days</span>
                  <div className={styles.edit} onClick={() => setIsSelecting(!isSelecting)}>
                    {isSelecting ? 'Done' : 'Edit'}
                  </div>
                </div>
                {older.map((chat) => (
                  <HistoryItem
                    key={chat.id}
                    chat={chat}
                    onOpenChat={onOpenChat}
                    isSelecting={isSelecting}
                    isSelected={selectedHistoryItems.includes(chat.id)}
                    onSelect={() => onSelectChat(chat.id)}
                  />
                ))}
              </>
            )}
          </>
        )}
        {selectedHistoryItems.length > 0 && (
          <div className={styles.selectionOptions}>
            {isDeleting ? (
              <span>Deleting {selectedHistoryItems.length} chats</span>
            ) : (
              <span>{selectedHistoryItems.length} chats selected</span>
            )}
            {isDeleting ? (
              <LoadingSpinner color={variables.light60} size={'28px'} />
            ) : (
              <Tooltip position={'top'} tooltip={'Permanently delete'}>
                <CircleButton onClick={handleDeleteSelections} size={'28px'}>
                  <Trash size={20} variant={'Bold'} color={variables.red80} />
                </CircleButton>
              </Tooltip>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default History

// Title retry logic
const MAX_RETRIES = 3
const RETRY_INTERVAL = 10000

interface HistoryItemProps {
  chat: ChatHistoryItem
  isSelecting?: boolean
  isSelected?: boolean
  onSelect?: () => void
  onOpenChat?: () => void
}

const HistoryItem = ({ chat, isSelecting, isSelected, onSelect, onOpenChat }: HistoryItemProps) => {
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

  const handleOpenChat = async (chat: ChatHistoryItem) => {
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
      source: 'history',
    })
  }

  const handleSelectChat = () => {
    if (typeof onSelect === 'function') {
      onSelect()
    }
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
            handleOpenChat(chat)
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
      wrapperStyle={{ position: 'relative', width: '100%' }}
    >
      {isSelecting && (
        <div className={`${styles.selector} ${isSelected ? styles.selected : ''}`} onClick={handleSelectChat} />
      )}
      <div
        key={chat.id}
        id={`chat-${chat.id}`}
        className={`${styles.chat} ${isSelecting ? styles.selecting : ''}`}
        onClick={() => (isSelecting ? handleSelectChat() : handleOpenChat(chat))}
      >
        <span className={styles.chatText}>
          {chat.title.charAt(0) === '"' && chat.title.charAt(chat.title.length - 1) === '"'
            ? chat.title.substring(1, chat.title.length - 1)
            : chat.title}
        </span>
      </div>
    </ContextMenu>
  )
}
