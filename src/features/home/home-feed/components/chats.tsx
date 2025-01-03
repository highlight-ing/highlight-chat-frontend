'use client'

import React from 'react'
import { ChatHistoryItem } from '@/types'
import { AnimatePresence } from 'framer-motion'
import { Copy, Export, MessageText } from 'iconsax-react'
import { useAtom, useSetAtom } from 'jotai'
import { toast } from 'sonner'
import { useShallow } from 'zustand/react/shallow'

import { cn, getDateGroupLengths } from '@/lib/utils'
import { trackEvent } from '@/utils/amplitude'
import { homeSidePanelOpenAtom, selectedChatIdAtom } from '@/atoms/side-panel'
import { useHistory } from '@/hooks/chat-history'
import { useCopyChatShareLink, useGenerateChatShareLink } from '@/hooks/share-link'
import { Tooltip } from '@/components/ui/tooltip'
import { useStore } from '@/components/providers/store-provider'

import { GroupedVirtualList, GroupHeaderRow } from '../components/grouped-virtual-list'
import { currentListIndexAtom, isMountedAtom } from '../atoms'
import { HOME_FEED_LIST_HEIGHT } from '../constants'
import { formatUpdatedAtDate } from '../utils'
import { HomeFeedListItemLayout, HomeFeedListLayout, ListEmptyState, ListLoadingState } from './home-feed'

function ChatAction(props: { chat: ChatHistoryItem }) {
  const { clearPrompt, startNewConversation, addOrUpdateOpenConversation, setConversationId } = useStore(
    useShallow((state) => ({
      setConversationId: state.setConversationId,
      addOrUpdateOpenConversation: state.addOrUpdateOpenConversation,
      clearPrompt: state.clearPrompt,
      startNewConversation: state.startNewConversation,
    })),
  )

  function handleChatClick() {
    if (!props.chat) return

    clearPrompt()
    startNewConversation()
    addOrUpdateOpenConversation(props.chat)
    setConversationId(props.chat?.id)

    trackEvent('HL Chat Opened', {
      chatId: props.chat.id,
      source: 'home_feed',
    })
  }

  return (
    <Tooltip content="Chat">
      <button
        onClick={handleChatClick}
        className="size-6 hidden place-items-center rounded-lg p-1 transition-colors hover:bg-light-5 group-hover:grid"
      >
        <MessageText variant="Bold" size={16} className="text-tertiary" />
      </button>
    </Tooltip>
  )
}

function ChatShareLinkCopyButton(props: { chat: ChatHistoryItem }) {
  const mostRecentShareLinkId = props.chat?.shared_conversations?.[0]?.id
  const { mutate: generateShareLink, isPending: isGeneratingLink } = useGenerateChatShareLink()
  const { mutateAsync: copyLink } = useCopyChatShareLink()

  async function handleCopyClick() {
    if (!props.chat) return

    if (!mostRecentShareLinkId) {
      generateShareLink(props.chat)
    } else {
      await copyLink(mostRecentShareLinkId)
      toast('Link copied to clipboard', { icon: <Copy variant="Bold" size={20} /> })
    }
  }

  return (
    <Tooltip content="Share">
      <button
        onClick={handleCopyClick}
        disabled={isGeneratingLink}
        className="size-6 hidden place-items-center rounded-lg p-1 transition-colors hover:bg-light-5 group-hover:grid"
      >
        <Export variant="Bold" size={16} className={cn('text-tertiary', isGeneratingLink && 'opacity-50')} />
      </button>
    </Tooltip>
  )
}

export function ChatListItem(props: { chat: ChatHistoryItem; listIndex: number }) {
  const setHomeSidePanelOpen = useSetAtom(homeSidePanelOpenAtom)
  const setSelectedChatId = useSetAtom(selectedChatIdAtom)
  const [currentListIndex, setCurrentListIndex] = useAtom(currentListIndexAtom)
  const isActiveElement = currentListIndex === props.listIndex
  const [isMounted, setIsMounted] = useAtom(isMountedAtom)

  const previewChat = React.useCallback(() => {
    setHomeSidePanelOpen(true)
    setSelectedChatId(props.chat.id)
    setCurrentListIndex(props.listIndex)
  }, [setHomeSidePanelOpen, setSelectedChatId, props.chat.id, props.listIndex, setCurrentListIndex])

  const handleClick = React.useCallback(() => {
    previewChat()
    trackEvent('HL Chat Previewed', {
      chatId: props.chat.id,
      source: 'home_feed',
    })
  }, [props.chat, previewChat])

  React.useEffect(() => {
    if (isActiveElement && !isMounted) {
      previewChat()
      setIsMounted(true)
    }
  }, [isActiveElement, isMounted, previewChat, setIsMounted])

  React.useEffect(() => {
    function handleEnterKeyPress(e: KeyboardEvent) {
      if (isActiveElement && e.key === 'Enter') {
        handleClick()
      }
    }

    window.addEventListener('keydown', handleEnterKeyPress)
    return () => window.removeEventListener('keydown', handleEnterKeyPress)
  }, [isActiveElement, handleClick])

  return (
    <HomeFeedListItemLayout onClick={handleClick} className={cn('justify-between', isActiveElement && 'bg-hover')}>
      <div className="flex items-center gap-2 font-medium">
        <MessageText variant={'Bold'} size={20} className="text-subtle" />
        <h3 className="max-w-sm truncate tracking-tight text-primary">{props.chat.title}</h3>
      </div>
      <div className="flex items-center gap-2 font-medium">
        <p className="block text-sm text-tertiary group-hover:hidden">{formatUpdatedAtDate(props.chat.updated_at)}</p>
        <ChatAction chat={props.chat} />
        <ChatShareLinkCopyButton chat={props.chat} />
      </div>
    </HomeFeedListItemLayout>
  )
}

export function ChatsTabContent() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useHistory()
  const { chats, chatGroupCounts, chatGroupLabels } = React.useMemo(() => {
    const chats = data ? data.pages.flat() : []
    const { groupLengths, groupLabels } = getDateGroupLengths(chats)
    return { chats, chatGroupCounts: groupLengths, chatGroupLabels: groupLabels }
  }, [data])

  function handleFetchMore() {
    if (hasNextPage) fetchNextPage()
  }

  if (!isLoading && !data) {
    return (
      <ListEmptyState>
        <p className="text-subtle">No chats</p>
      </ListEmptyState>
    )
  }

  return (
    <AnimatePresence initial={false}>
      {isLoading ? (
        <ListLoadingState />
      ) : (
        <HomeFeedListLayout>
          <GroupedVirtualList
            endReached={handleFetchMore}
            style={{ height: HOME_FEED_LIST_HEIGHT }}
            groupCounts={chatGroupCounts}
            groupContent={(index) => <GroupHeaderRow>{chatGroupLabels[index]}</GroupHeaderRow>}
            itemContent={(index) => {
              const chat = chats[index]
              return <ChatListItem key={chat.id} chat={chat} listIndex={index} />
            }}
            components={{
              Footer: () =>
                isFetchingNextPage && (
                  <HomeFeedListItemLayout>
                    <div className="flex items-center gap-2 font-medium">
                      <MessageText variant={'Bold'} size={20} className="animate-pulse text-subtle/50" />
                      <p className="animate-pulse text-subtle">Loading more chats...</p>
                    </div>
                  </HomeFeedListItemLayout>
                ),
            }}
          />
        </HomeFeedListLayout>
      )}
    </AnimatePresence>
  )
}
