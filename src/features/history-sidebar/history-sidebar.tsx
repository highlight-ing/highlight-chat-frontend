import * as React from 'react'
import { ChatHistoryItem } from '@/types'
import variables from '@/variables.module.scss'
import { Clock, MessageText, Trash } from 'iconsax-react'
import { useAtomValue, useSetAtom } from 'jotai'
import { GroupedVirtuoso } from 'react-virtuoso'
import { useShallow } from 'zustand/react/shallow'

import { cn, getDateGroupLengths } from '@/lib/utils'
import { trackEvent } from '@/utils/amplitude'
import { showHistoryAtom, toggleShowHistoryAtom } from '@/atoms/history'
import { useChatHistoryStore, useHistory } from '@/hooks/chat-history'
import { useApi } from '@/hooks/useApi'
import { ScrollArea } from '@/components/ui/scroll-area'
import CircleButton from '@/components/CircleButton/CircleButton'
import ContextMenu from '@/components/ContextMenu/ContextMenu'
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner'
import { useStore } from '@/components/providers/store-provider'
import Tooltip from '@/components/Tooltip/Tooltip'

import { NEW_CONVERSATION_TITLE, useAddNewChat, useUpdateConversationTitle } from './hooks'

const CONVERSATION_FETCH_DELAY = 2 * 1000

function HistorySidebarItem(props: {
  chat: ChatHistoryItem
  isSelecting?: boolean
  isSelected?: boolean
  onSelect?: () => void
  onOpenChat?: () => void
}) {
  const { addOrUpdateOpenConversation, openModal, setConversationId } = useStore(
    useShallow((state) => ({
      setConversationId: state.setConversationId,
      openModal: state.openModal,
      addOrUpdateOpenConversation: state.addOrUpdateOpenConversation,
    })),
  )
  const { mutate: updateConversationTitle } = useUpdateConversationTitle()
  const { data: historyData } = useHistory()
  const history = React.useMemo(() => historyData?.pages?.flat(), [historyData])

  async function handleOpenChat(chat: ChatHistoryItem) {
    if (typeof props.onOpenChat === 'function') {
      props.onOpenChat()
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

  function handleSelectChat() {
    if (typeof props.onSelect === 'function') {
      props.onSelect()
    }
  }

  function handleClick() {
    if (props.isSelecting) {
      handleSelectChat()
    } else {
      handleOpenChat(props.chat)
    }
  }

  async function onDeleteChat(chat: ChatHistoryItem) {
    openModal('delete-chat', chat)
    trackEvent('HL Chat Delete Initiated', {
      chatId: chat?.id,
      source: 'history',
    })
  }

  React.useEffect(() => {
    if (props.chat?.id === history?.[0].id && props.chat.title === NEW_CONVERSATION_TITLE) {
      const timeout = setTimeout(() => {
        updateConversationTitle(props.chat?.id)
      }, CONVERSATION_FETCH_DELAY)
      return () => clearTimeout(timeout)
    }
  }, [props.chat, history, updateConversationTitle])

  return (
    <ContextMenu
      key={`menu-${props.chat?.id}`}
      items={[
        {
          label: 'Open Chat',
          onClick: () => {
            handleOpenChat(props.chat)
            trackEvent('HL Chat Opened', {
              chatId: props.chat?.id,
              source: 'context_menu',
            })
          },
        },
        { divider: true },
        {
          label: <span className="text-red-400">Delete Chat</span>,
          onClick: () => onDeleteChat(props.chat),
        },
      ]}
      position={'bottom'}
      triggerId={`chat-${props.chat?.id}`}
      wrapperStyle={{ position: 'relative', width: '100%' }}
    >
      {props.isSelecting && (
        <div
          className={cn(
            'absolute left-2 top-2.5 h-[17px] w-[17px] cursor-pointer rounded-full border border-light-20 transition-colors fade-in hover:border-light-80',
            props.isSelected && 'border-light-40 bg-light-40 outline outline-2 outline-offset-[-3px] outline-black',
          )}
          onClick={handleSelectChat}
        />
      )}
      <div
        key={props.chat?.id}
        id={`chat-${props.chat?.id}`}
        className={cn(
          'relative mx-2 flex-shrink-0 cursor-pointer overflow-hidden overflow-ellipsis whitespace-nowrap rounded-md px-2 py-2.5 text-sm font-medium leading-snug text-light-40 transition-all duration-100 hover:bg-light-5 hover:text-light-80',
          props.isSelecting && 'ml-[25px] bg-transparent hover:bg-transparent',
        )}
        onClick={handleClick}
      >
        <span>
          {props.chat.title?.charAt(0) === '"' && props.chat.title.charAt(props.chat.title.length - 1) === '"'
            ? props.chat.title.substring(1, props.chat.title.length - 1)
            : props.chat.title}
        </span>
      </div>
    </ContextMenu>
  )
}

function HistorySidebarLayout(props: { children: React.ReactNode }) {
  const showHistory = useAtomValue(showHistoryAtom)
  const toggleShowHistory = useSetAtom(toggleShowHistoryAtom)

  return (
    <div
      className={cn(
        'pointer-events-none absolute left-0 top-0 z-[41] w-[250px] translate-x-[-250px] overflow-x-hidden border-r border-dark-40 bg-[#121212] opacity-0 transition-transform duration-200',
        showHistory && 'pointer-events-auto translate-x-0 opacity-100',
      )}
    >
      <div className="flex h-12 items-center gap-2 border-b border-dark-40 p-1.5 text-light-60">
        <Tooltip tooltip="Hide chat history" position="bottom">
          <CircleButton fitContents={true} onClick={toggleShowHistory}>
            <Clock size={20} variant={'Bold'} />
            <span className="text-base font-medium leading-normal">Chat History</span>
          </CircleButton>
        </Tooltip>
      </div>
      {props.children}
    </div>
  )
}

export function HistorySidebar() {
  const showHistory = useAtomValue(showHistoryAtom)
  const { deleteRequest } = useApi()
  const conversationId = useStore((state) => state.conversationId)
  const startNewConversation = useStore((state) => state.startNewConversation)
  const removeOpenConversation = useStore((state) => state.removeOpenConversation)
  const [isSelecting, setIsSelecting] = React.useState(false)
  const [selectedHistoryItems, setSelectedHistoryItems] = React.useState<Array<string>>([])
  const [isDeleting, setIsDeleting] = React.useState(false)
  const { removeChatsByIds } = useChatHistoryStore()
  const { data: historyData, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useHistory()
  const { mutate: addNewChat } = useAddNewChat(conversationId)
  const { history, chatGroupCounts, chatGroupLabels } = React.useMemo(() => {
    const history = historyData ? historyData.pages.flat() : []
    const { groupLengths, groupLabels } = getDateGroupLengths(history)
    return { history, chatGroupCounts: groupLengths, chatGroupLabels: groupLabels }
  }, [historyData])

  // Handle fetching history, and detecting new chats to fetch
  React.useEffect(() => {
    if (conversationId && !history.some((chat) => chat?.id === conversationId)) {
      const timeout = setTimeout(() => {
        addNewChat()
      }, CONVERSATION_FETCH_DELAY)
      return () => clearTimeout(timeout)
    }
  }, [history, addNewChat, conversationId])

  // Reset history selections upon collapse
  React.useEffect(() => {
    if (!showHistory && isSelecting) {
      setIsSelecting(false)
    }
  }, [showHistory, isSelecting, selectedHistoryItems])

  React.useEffect(() => {
    if (!isSelecting && selectedHistoryItems.length > 0) {
      setSelectedHistoryItems([])
    }
  }, [isSelecting, selectedHistoryItems])

  function onSelectChat(chatId: string) {
    let newItems = [...selectedHistoryItems]
    if (newItems.includes(chatId)) {
      newItems = newItems.filter((id) => id !== chatId)
    } else {
      newItems.push(chatId)
    }
    setSelectedHistoryItems(newItems)
  }

  async function handleDeleteSelections() {
    setIsDeleting(true)
    removeChatsByIds(selectedHistoryItems)
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
    setSelectedHistoryItems([])
    setIsDeleting(false)
    setIsSelecting(false)
  }

  function handleFetchMore() {
    if (hasNextPage) fetchNextPage()
  }

  if (isLoading) {
    return (
      <HistorySidebarLayout>
        <div className="mx-2 flex-shrink-0 overflow-hidden overflow-ellipsis whitespace-nowrap rounded-md px-2 py-2.5 text-sm font-medium leading-snug text-light-40">
          <p className="animate-pulse">Loading chats...</p>
        </div>
      </HistorySidebarLayout>
    )
  }

  if (!history || history.length === 0) {
    return (
      <HistorySidebarLayout>
        <div className="mx-2 flex-shrink-0 overflow-hidden overflow-ellipsis whitespace-nowrap rounded-md px-2 py-2.5 text-sm font-medium leading-snug text-light-40">
          <p>No chat history available</p>
        </div>
      </HistorySidebarLayout>
    )
  }

  return (
    <HistorySidebarLayout>
      <ScrollArea className="select-none gap-px overflow-y-auto p-1">
        <GroupedVirtuoso
          endReached={handleFetchMore}
          style={{ height: 'calc(100vh - 56px)' }}
          groupCounts={chatGroupCounts}
          groupContent={(index) => (
            <div className="group flex items-center justify-between bg-[#121212] p-2 pt-1 text-sm font-medium text-light-20">
              <span>{chatGroupLabels[index]}</span>
              <div
                className={cn(
                  'pointer-events-none opacity-0 transition-opacity duration-200 hover:text-light-60 hover:underline group-hover:pointer-events-auto group-hover:cursor-pointer group-hover:opacity-100',
                  isSelecting && 'pointer-events-auto cursor-pointer opacity-100',
                )}
                onClick={() => setIsSelecting(!isSelecting)}
              >
                {isSelecting ? 'Done' : 'Edit'}
              </div>
            </div>
          )}
          itemContent={(index) => {
            const chat = history[index]
            return (
              <HistorySidebarItem
                key={chat?.id}
                chat={chat}
                isSelecting={isSelecting}
                isSelected={selectedHistoryItems.includes(chat?.id)}
                onSelect={() => onSelectChat(chat?.id)}
              />
            )
          }}
          components={{
            Footer: () =>
              isFetchingNextPage && (
                <div className="flex items-center gap-2 font-medium">
                  <MessageText variant={'Bold'} size={20} className="animate-pulse text-subtle/50" />
                  <p className="animate-pulse text-subtle">Loading more chats...</p>
                </div>
              ),
          }}
        />
        {selectedHistoryItems.length > 0 && (
          <div className="pointer-events-[all] absolute bottom-3 right-3 z-20 flex items-center justify-between gap-2 rounded-xl border border-light-5 bg-dark-40 px-3 py-4 text-sm text-light-40 shadow-lg backdrop-blur transition-colors fade-in">
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
    </HistorySidebarLayout>
  )
}
