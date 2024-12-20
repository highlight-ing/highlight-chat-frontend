import { Copy, Export, MessageText } from 'iconsax-react'
import { useAtomValue } from 'jotai'
import { useShallow } from 'zustand/react/shallow'

import { selectedAudioNoteAtom, selectedChatAtom } from '@/atoms/side-panel'
import { useMessages } from '@/hooks/chat-messages'
import { Skeleton } from '@/components/ui/skeleton'
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
  const selectedChat = useAtomValue(selectedChatAtom)
  const { data: messages, isLoading } = useMessages(selectedChat?.id)

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
  const selectedChat = useAtomValue(selectedChatAtom)
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
  function handleCopyClick() { }

  return (
    <SidePanelHeaderActionButton onClick={handleCopyClick}>
      <Copy variant="Bold" size={16} />
      <p>Copy link</p>
    </SidePanelHeaderActionButton>
  )
}

function ShareAction() {
  function handleShareClick() { }

  return (
    <SidePanelHeaderActionButton onClick={handleShareClick}>
      <Export variant="Bold" size={16} />
      <p>Share</p>
    </SidePanelHeaderActionButton>
  )
}

export function ChatSidePanelHeader() {
  const selectedChat = useAtomValue(selectedChatAtom)

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
