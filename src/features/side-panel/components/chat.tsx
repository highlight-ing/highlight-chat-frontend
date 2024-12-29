import React from 'react'
import { AnimatePresence, motion, Variants } from 'framer-motion'
import { Copy, Export, MessageText } from 'iconsax-react'
import { useAtom, useAtomValue } from 'jotai'
import { useShallow } from 'zustand/react/shallow'

import { selectedAudioNoteAtom, selectedChatIdAtom } from '@/atoms/side-panel'
import { useHistoryByChatId } from '@/hooks/chat-history'
import { useMessages } from '@/hooks/chat-messages'
import { useCopyLink, useGenerateShareLink } from '@/hooks/share-link'
import { Popover, PopoverTrigger } from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner'
import { Message } from '@/components/Messages/Message'
import { useStore } from '@/components/providers/store-provider'
import { SharePopoverContent } from '@/components/share-popover'

import { formatHeaderTimestamp } from '../utils'
import { SidePanelHeaderActionButton, SidePanelHeaderActions } from './side-panel'

function AudioNoteHeaderDates() {
  const selectedAudioNote = useAtomValue(selectedAudioNoteAtom)

  if (!selectedAudioNote?.startedAt || !selectedAudioNote?.endedAt) return null

  return (
    <p className="text-sm font-medium text-tertiary">
      {formatHeaderTimestamp(selectedAudioNote.startedAt, selectedAudioNote.endedAt)}
    </p>
  )
}

function Messages() {
  const selectedChatId = useAtomValue(selectedChatIdAtom)
  const { data: messages, isLoading } = useMessages(selectedChatId)

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-20 w-full rounded-xl bg-hover/90" />
        <Skeleton className="h-16 w-full rounded-xl bg-hover/60" />
        <Skeleton className="h-20 w-full rounded-xl bg-hover/30" />
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col items-center gap-5">
      {messages?.map((message, index) => {
        if (message.role === 'assistant' && typeof message.content === 'string' && !message.content?.trim()?.length) {
          return ''
        }
        return <Message key={index} message={message} hideAssistantIcon className="max-w-full" />
      })}
    </div>
  )
}

function ChatAction() {
  const [selectedChatId, setSelectedChatId] = useAtom(selectedChatIdAtom)
  const { data: selectedChat } = useHistoryByChatId(selectedChatId)
  const { clearPrompt, startNewConversation, addOrUpdateOpenConversation, setConversationId } = useStore(
    useShallow((state) => ({
      setConversationId: state.setConversationId,
      addOrUpdateOpenConversation: state.addOrUpdateOpenConversation,
      clearPrompt: state.clearPrompt,
      startNewConversation: state.startNewConversation,
    })),
  )

  function handleChatClick() {
    if (!selectedChat) return

    clearPrompt()
    startNewConversation()
    addOrUpdateOpenConversation(selectedChat)
    setConversationId(selectedChat?.id)
    setSelectedChatId('')
  }

  return (
    <SidePanelHeaderActionButton onClick={handleChatClick}>
      <MessageText variant="Bold" size={16} />
      <p>Chat</p>
    </SidePanelHeaderActionButton>
  )
}

function CopyLinkAction() {
  const selectedChatId = useAtomValue(selectedChatIdAtom)
  const { data: selectedChat } = useHistoryByChatId(selectedChatId)
  const mostRecentShareLinkId = selectedChat?.shared_conversations?.[0]?.id
  const [showSuccessState, setShowSuccessState] = React.useState(false)
  const { mutate: generateShareLink, isPending: isGeneratingLink } = useGenerateShareLink()
  const { mutate: copyLink, isSuccess: linkCopied } = useCopyLink()

  React.useEffect(() => {
    let timeout: NodeJS.Timeout | null
    if (linkCopied) {
      setShowSuccessState(true)
      timeout = setTimeout(() => {
        setShowSuccessState(false)
      }, 1200)
    }
    return () => {
      if (timeout) clearTimeout(timeout)
      setShowSuccessState(false)
    }
  }, [linkCopied, setShowSuccessState])

  function handleCopyClick() {
    if (!selectedChat) return

    if (!mostRecentShareLinkId) {
      generateShareLink(selectedChat)
    } else {
      copyLink(mostRecentShareLinkId)
    }
  }

  const copyLabelVariants: Variants = {
    initial: { x: 10, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -10, opacity: 0 },
  }

  return (
    <SidePanelHeaderActionButton onClick={handleCopyClick} disabled={isGeneratingLink}>
      {isGeneratingLink ? <LoadingSpinner size={'16px'} color="#6e6e6e" /> : <Copy size={16} variant={'Bold'} />}
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          variants={copyLabelVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          key={showSuccessState ? 'true' : 'false'}
        >
          {showSuccessState ? 'Copied' : 'Copy Link'}
        </motion.span>
      </AnimatePresence>
    </SidePanelHeaderActionButton>
  )
}

function ShareAction() {
  const [open, setOpen] = React.useState(false)
  const selectedChatId = useAtomValue(selectedChatIdAtom)
  const { data: selectedChat } = useHistoryByChatId(selectedChatId)
  const mostRecentShareLinkId = selectedChat?.shared_conversations?.[0]?.id
  const { mutate: generateShareLink, isPending: isGeneratingLink } = useGenerateShareLink()

  function handleShareClick() {
    if (!selectedChat || mostRecentShareLinkId) return
    generateShareLink(selectedChat)
    setOpen(true)
  }

  if (!selectedChat) return null

  if (!mostRecentShareLinkId) {
    return (
      <SidePanelHeaderActionButton onClick={handleShareClick} disabled={isGeneratingLink}>
        {isGeneratingLink ? <LoadingSpinner size={'16px'} color="#6e6e6e" /> : <Export variant="Bold" size={16} />}
        <p>Share</p>
      </SidePanelHeaderActionButton>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="flex w-full flex-col items-center rounded-[10px] border border-transparent bg-secondary p-2 text-sm font-medium tracking-tight text-tertiary shadow-md transition hover:border-tertiary hover:bg-hover active:opacity-90 active:shadow-none">
        <Export variant="Bold" size={16} />
        <p>Share</p>
      </PopoverTrigger>
      <SharePopoverContent conversation={selectedChat} />
    </Popover>
  )
}

export function ChatSidePanelHeader() {
  const selectedChatId = useAtomValue(selectedChatIdAtom)
  const { data: selectedChat } = useHistoryByChatId(selectedChatId)

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2.5">
        <div className="size-10 hidden place-items-center rounded-[10px] bg-secondary xl:grid">
          <MessageText variant="Bold" size={20} />
        </div>
        <div>
          <h3 className="line-clamp-1 w-full text-ellipsis font-semibold tracking-tight text-primary">
            {selectedChat?.title ?? 'New Conversation'}
          </h3>
          <AudioNoteHeaderDates />
        </div>
      </div>
      <SidePanelHeaderActions>
        <ChatAction />
        <CopyLinkAction />
        <ShareAction />
      </SidePanelHeaderActions>
    </div>
  )
}

export function ChatSidePanelContent() {
  return (
    <article className="space-y-6">
      <Messages />
    </article>
  )
}
