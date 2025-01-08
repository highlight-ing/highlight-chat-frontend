'use client'

import React from 'react'
import { ChatHistoryItem } from '@/types'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { AnimatePresence, motion, MotionConfig, Variants } from 'framer-motion'
import { Copy, MessageText, Trash } from 'iconsax-react'
import { useAtom, useSetAtom } from 'jotai'
import { toast } from 'sonner'
import { useShallow } from 'zustand/react/shallow'

import { cn, getDateGroupLengths } from '@/lib/utils'
import { trackEvent } from '@/utils/amplitude'
import { homeSidePanelOpenAtom, selectedChatIdAtom } from '@/atoms/side-panel'
import { useDeleteChat, useHistory } from '@/hooks/chat-history'
import { useCopyChatShareLink, useGenerateChatShareLink } from '@/hooks/share-link'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu'
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

function DeleteAction(props: { chatId: ChatHistoryItem['id']; moreOptionsOpen: boolean }) {
  const { mutate: deleteChat, isPending } = useDeleteChat()
  const [state, setState] = React.useState<'idle' | 'expanded'>('idle')
  const isExpanded = state === 'expanded'

  React.useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (isExpanded && props.moreOptionsOpen && e.key === 'Escape') {
        setState('idle')
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isExpanded, props.moreOptionsOpen])

  function handleDeleteClick() {
    if (!isExpanded) {
      setState('expanded')
    } else {
      setState('idle')
    }
  }

  function handleConfirmDeleteClick() {
    deleteChat(props.chatId)
  }

  const descriptionVariants: Variants = {
    hidden: { opacity: 0, filter: 'blur(3px)' },
    visible: { opacity: 1, filter: 'blur(0px)', transition: { duration: 0.1, delay: 0.1 } },
  }

  return (
    <MotionConfig transition={{ type: 'spring', bounce: 0.05, duration: 0.2 }}>
      <AnimatePresence initial={false}>
        {isExpanded ? (
          <motion.div
            layoutId={`${props.chatId}-wrapper`}
            style={{ borderRadius: 12 }}
            className="space-y-2 bg-light-5 p-2"
          >
            <motion.p variants={descriptionVariants} initial="hidden" animate="visible" exit="hidden">
              Are you sure you want to delete this chat?
            </motion.p>
            <button
              onClick={handleConfirmDeleteClick}
              disabled={isPending}
              className="flex w-full items-center gap-3 rounded-xl bg-[#ff3333]/10 px-2 py-1.5 text-[#ff3333] transition-colors hover:bg-[#ff3333]/20"
            >
              {isPending ? (
                <LoadingSpinner size="16px" color="#ff3333" />
              ) : (
                <motion.span layoutId={`${props.chatId}-icon`}>
                  <Trash variant="Bold" size={16} />
                </motion.span>
              )}
              <motion.span layoutId={`${props.chatId}-button-text`}>Delete</motion.span>
            </button>
          </motion.div>
        ) : (
          <motion.button
            layoutId={`${props.chatId}-wrapper`}
            onClick={handleDeleteClick}
            disabled={isPending}
            style={{ borderRadius: 12 }}
            className="flex w-full items-center gap-3 px-2 py-1.5 text-[#ff3333] transition-colors hover:bg-light-5"
          >
            <motion.span layoutId={`${props.chatId}-icon`}>
              <Trash variant="Bold" size={16} />
            </motion.span>
            <motion.span layoutId={`${props.chatId}-button-text`}>Delete</motion.span>
          </motion.button>
        )}
      </AnimatePresence>
    </MotionConfig>
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
          <DeleteAction chatId={props.chat.id} moreOptionsOpen={moreOptionsOpen} />
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
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <HomeFeedListItemLayout onClick={handleClick} className={cn('justify-between', isActiveElement && 'bg-hover')}>
          <div className="flex items-center gap-2 font-medium">
            <MessageText variant={'Bold'} size={20} className="text-subtle" />
            <h3 className="max-w-sm truncate tracking-tight text-primary">{props.chat.title}</h3>
          </div>
          <ChatActions chat={props.chat} />
        </HomeFeedListItemLayout>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-52">
        <CopyShareLinkAction chat={props.chat} />
        <DeleteAction chatId={props.chat.id} moreOptionsOpen={false} />
      </ContextMenuContent>
    </ContextMenu>
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
