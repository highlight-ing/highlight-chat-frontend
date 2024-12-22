import React from 'react'
import { AnimatePresence, motion, Variants } from 'framer-motion'
import { Copy, Export, MessageText } from 'iconsax-react'
import { useAtomValue } from 'jotai'
import { useShallow } from 'zustand/react/shallow'

import { selectedAudioNoteAtom, selectedChatIdAtom } from '@/atoms/side-panel'
import { useHistoryByChatId } from '@/hooks/chat-history'
import { useMessages } from '@/hooks/chat-messages'
import { useCopyLink, useDisableLink, useGenerateShareLink } from '@/hooks/share-link'
import { Skeleton } from '@/components/ui/skeleton'
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner'
import { Message } from '@/components/Messages/Message'
import { useStore } from '@/components/providers/store-provider'

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
  const selectedChatId = useAtomValue(selectedChatIdAtom)
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
  const { mutate: copyLink, isPending: isCopyingLink, isSuccess: linkCopied } = useCopyLink()
  const isPending = isGeneratingLink || isCopyingLink

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
      copyLink(selectedChat.id)
    }
  }

  const copyLabelVariants: Variants = {
    initial: { x: 10, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -10, opacity: 0 },
  }

  return (
    <SidePanelHeaderActionButton onClick={handleCopyClick} disabled={isPending}>
      {isPending ? <LoadingSpinner size={'16px'} color="#6e6e6e" /> : <Copy size={16} variant={'Bold'} />}
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
