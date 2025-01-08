'use client'

import React from 'react'
import { ChatHistoryItem } from '@/types'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { AnimatePresence, motion, Variants } from 'framer-motion'
import { Copy, MessageText } from 'iconsax-react'
import { useAtom, useSetAtom } from 'jotai'
import { toast } from 'sonner'
import { useShallow } from 'zustand/react/shallow'

import { cn, getDateGroupLengths } from '@/lib/utils'
import { trackEvent } from '@/utils/amplitude'
import { homeSidePanelOpenAtom, selectedChatIdAtom } from '@/atoms/side-panel'
import { useHistory } from '@/hooks/chat-history'
import { useCopyChatShareLink, useGenerateChatShareLink } from '@/hooks/share-link'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner'
import { useStore } from '@/components/providers/store-provider'

import { GroupedVirtualList, GroupHeaderRow } from '../components/grouped-virtual-list'
import { currentListIndexAtom, isMountedAtom } from '../atoms'
import { HOME_FEED_LIST_HEIGHT } from '../constants'
import { formatUpdatedAtDate } from '../utils'
import { ActionButton, HomeFeedListItemLayout, HomeFeedListLayout, ListEmptyState, ListLoadingState } from './home-feed'

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

  return <ActionButton onClick={handleChatClick}>Chat</ActionButton>
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
    <ActionButton disabled={isGeneratingLink} onClick={handleCopyClick}>
      Share
    </ActionButton>
  )
}

function CopyShareLinkAction(props: { chat: ChatHistoryItem }) {
  const {
    mutate: generateShareLink,
    isPending: isGeneratingLink,
    isSuccess: linkGenerated,
  } = useGenerateChatShareLink()
  const { mutate: copyLink, isSuccess: linkCopied } = useCopyChatShareLink()
  const mostRecentShareLink = props.chat?.shared_conversations?.[0]?.id
  const [showSuccessState, setShowSuccessState] = React.useState(false)

  React.useEffect(() => {
    let timeout: NodeJS.Timeout | null
    if (linkCopied || linkGenerated) {
      setShowSuccessState(true)
      timeout = setTimeout(() => {
        setShowSuccessState(false)
      }, 1200)
    }
    return () => {
      if (timeout) clearTimeout(timeout)
      setShowSuccessState(false)
    }
  }, [linkCopied, linkGenerated, setShowSuccessState])

  function handleCopyClick() {
    if (!props.chat) return

    if (!mostRecentShareLink) {
      generateShareLink(props.chat)
    } else {
      copyLink(mostRecentShareLink)
    }
  }

  const copyLabelVariants: Variants = {
    initial: { x: 10, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -10, opacity: 0 },
  }

  return (
    <button
      onClick={handleCopyClick}
      disabled={isGeneratingLink}
      className="flex w-full items-center gap-3.5 rounded-xl px-2 py-1.5 transition-colors hover:bg-light-5"
    >
      {isGeneratingLink ? <LoadingSpinner size={'16px'} color="#6e6e6e" /> : <Copy size={16} variant={'Bold'} />}
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          variants={copyLabelVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          key={showSuccessState ? 'true' : 'false'}
          className="w-full text-left"
        >
          {showSuccessState ? 'Copied' : mostRecentShareLink ? 'Copy share link' : 'Create share link'}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}

function ChatActions(props: { chat: ChatHistoryItem }) {
  const [moreOptionsOpen, setMoreOptionsOpen] = React.useState(false)

  return (
    <div className="flex items-center gap-1 font-medium">
      <p
        className={cn('text-sm text-tertiary group-hover:hidden', moreOptionsOpen ? 'translate-x-0' : 'translate-x-7')}
      >
        {formatUpdatedAtDate(props.chat.updated_at)}
      </p>
      <ChatAction chat={props.chat} />
      <ChatShareLinkCopyButton chat={props.chat} />
      <Popover open={moreOptionsOpen} onOpenChange={setMoreOptionsOpen}>
        <PopoverTrigger className="size-6 invisible grid place-items-center rounded-lg p-1 transition-colors hover:bg-light-5 group-hover:visible data-[state=open]:visible data-[state=open]:bg-light-5">
          <DotsHorizontalIcon className="size-4 text-tertiary" />
        </PopoverTrigger>
        <PopoverContent align="end" sideOffset={16} className="max-w-52 p-1.5 text-secondary">
          <CopyShareLinkAction chat={props.chat} />
        </PopoverContent>
      </Popover>
    </div>
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

      <ChatActions chat={props.chat} />
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
