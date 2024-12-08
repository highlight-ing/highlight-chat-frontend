import * as React from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ChatHistoryItem } from '@/types'
import variables from '@/variables.module.scss'
import { Clock, Trash } from 'iconsax-react'
import { useShallow } from 'zustand/react/shallow'

import { trackEvent } from '@/utils/amplitude'
import { useApi } from '@/hooks/useApi'
import { useChatHistory } from '@/hooks/useChatHistory'
import { ScrollArea } from '@/components/ui/scroll-area'
import CircleButton from '@/components/CircleButton/CircleButton'
import ContextMenu from '@/components/ContextMenu/ContextMenu'
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner'
import { useStore } from '@/components/providers/store-provider'
import Tooltip from '@/components/Tooltip/Tooltip'

import styles from './history-sidebar.module.scss'
import { NEW_CONVERSATION_TITLE, useAddNewChat, useHistory, useUpdateConversationTitle } from './hooks'
import { sortArrayByDate } from './utils'

const CONVERSATION_FETCH_DELAY = 2 * 1000

type HistorySidebarItemProps = {
  chat: ChatHistoryItem
  isSelecting?: boolean
  isSelected?: boolean
  onSelect?: () => void
  onOpenChat?: () => void
}

function HistorySidebarItem({ chat, isSelecting, isSelected, onSelect, onOpenChat }: HistorySidebarItemProps) {
  const { addOrUpdateOpenConversation, openModal, setConversationId } = useStore(
    useShallow((state) => ({
      setConversationId: state.setConversationId,
      openModal: state.openModal,
      addOrUpdateOpenConversation: state.addOrUpdateOpenConversation,
    })),
  )
  const { history } = useChatHistory()
  const { mutate: updateConversationTitle } = useUpdateConversationTitle()

  const handleOpenChat = async (chat: ChatHistoryItem) => {
    if (typeof onOpenChat === 'function') {
      onOpenChat()
    }
    addOrUpdateOpenConversation(chat)
    setConversationId(chat?.id)

    // @TODO move to use chat loading hook
    trackEvent('HL Chat Opened', {
      chatId: chat?.id,
      // messageCount: messages.length,
      source: 'history_item',
    })
  }

  const onDeleteChat = async (chat: ChatHistoryItem) => {
    openModal('delete-chat', chat)
    trackEvent('HL Chat Delete Initiated', {
      chatId: chat?.id,
      source: 'history',
    })
  }

  const handleSelectChat = () => {
    if (typeof onSelect === 'function') {
      onSelect()
    }
  }

  useEffect(() => {
    if (chat?.id === history?.[0].id && chat.title === NEW_CONVERSATION_TITLE) {
      const timeout = setTimeout(() => {
        updateConversationTitle(chat?.id)
      }, CONVERSATION_FETCH_DELAY)
      return () => clearTimeout(timeout)
    }
  }, [chat, history])

  return (
    <ContextMenu
      key={`menu-${chat?.id}`}
      items={[
        {
          label: 'Open Chat',
          onClick: () => {
            handleOpenChat(chat)
            trackEvent('HL Chat Opened', {
              chatId: chat?.id,
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
      triggerId={`chat-${chat?.id}`}
      wrapperStyle={{ position: 'relative', width: '100%' }}
    >
      {isSelecting && (
        <div className={`${styles.selector} ${isSelected ? styles.selected : ''}`} onClick={handleSelectChat} />
      )}
      <div
        key={chat?.id}
        id={`chat-${chat?.id}`}
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

type HistorySidebarProps = {
  showHistory: boolean
  setShowHistory: React.Dispatch<React.SetStateAction<boolean>>
}

export function HistorySidebar({ showHistory, setShowHistory }: HistorySidebarProps) {
  const { deleteRequest } = useApi()
  const conversationId = useStore((state) => state.conversationId)
  const startNewConversation = useStore((state) => state.startNewConversation)
  const removeOpenConversation = useStore((state) => state.removeOpenConversation)
  const setHistory = useStore((state) => state.setHistory)
  const { history, refreshChatHistory } = useChatHistory()
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectedHistoryItems, setSelectedHistoryItems] = useState<string[]>([])
  const [isDeleting, setIsDeleting] = useState(false)

  const { mutate: addNewChat } = useAddNewChat(conversationId)
  useHistory()

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
    if (conversationId && !history.some((chat) => chat?.id === conversationId)) {
      const timeout = setTimeout(() => {
        addNewChat()
      }, CONVERSATION_FETCH_DELAY)
      return () => clearTimeout(timeout)
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
            <span className={styles.headerButton}>Chat History</span>
          </CircleButton>
        </Tooltip>
      </div>
      <ScrollArea className={styles.chats}>
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
                  <HistorySidebarItem
                    key={chat?.id}
                    chat={chat}
                    onOpenChat={onOpenChat}
                    isSelecting={isSelecting}
                    isSelected={selectedHistoryItems.includes(chat?.id)}
                    onSelect={() => onSelectChat(chat?.id)}
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
                  <HistorySidebarItem
                    key={chat?.id}
                    chat={chat}
                    onOpenChat={onOpenChat}
                    isSelecting={isSelecting}
                    isSelected={selectedHistoryItems.includes(chat?.id)}
                    onSelect={() => onSelectChat(chat?.id)}
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
                  <HistorySidebarItem
                    key={chat?.id}
                    chat={chat}
                    onOpenChat={onOpenChat}
                    isSelecting={isSelecting}
                    isSelected={selectedHistoryItems.includes(chat?.id)}
                    onSelect={() => onSelectChat(chat?.id)}
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
                  <HistorySidebarItem
                    key={chat?.id}
                    chat={chat}
                    onOpenChat={onOpenChat}
                    isSelecting={isSelecting}
                    isSelected={selectedHistoryItems.includes(chat?.id)}
                    onSelect={() => onSelectChat(chat?.id)}
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
      </ScrollArea>
    </div>
  )
}
