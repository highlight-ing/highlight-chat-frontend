import { ArrowRight, Copy, MessageText, VoiceSquare } from 'iconsax-react'
import { useAtomValue, useSetAtom } from 'jotai'
import { toast } from 'sonner'
import { useShallow } from 'zustand/react/shallow'

import { cn } from '@/lib/utils'
import { formatTitle } from '@/utils/conversations'
import { selectedAudioNoteAtom, showBackButtonAtom, sidePanelContentTypeAtom } from '@/atoms/side-panel'
import { Tooltip } from '@/components/ui/tooltip'
import { MeetingIcon } from '@/components/icons'
import { useStore } from '@/components/providers/store-provider'

import { useInputFocus } from '@/features/home/chat-input/chat-input'

import { TranscriptMessage } from '../types'
import { formatHeaderTimestamp, parseTranscript } from '../utils'
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

function TranscriptMessageItem(props: { message: TranscriptMessage }) {
  return (
    <div className="space-y-1">
      <div
        className={cn(
          'select-text text-sm font-medium leading-tight',
          props.message.sender === 'Me' || props.message.sender.toLowerCase().includes('self')
            ? 'text-[#4ceda0]/40'
            : 'text-white opacity-20',
        )}
      >
        {props.message.time} - {props.message.sender}
      </div>
      <p className="text-primary">{props.message.text}</p>
    </div>
  )
}

function ChatAction() {
  const selectedAudioNote = useAtomValue(selectedAudioNoteAtom)
  const focusInput = useInputFocus()

  const { clearPrompt, addAttachment, startNewConversation } = useStore(
    useShallow((state) => ({
      clearPrompt: state.clearPrompt,
      addAttachment: state.addAttachment,
      startNewConversation: state.startNewConversation,
    })),
  )

  function handleChatClick() {
    if (!selectedAudioNote?.transcript) return

    clearPrompt()
    startNewConversation()
    focusInput()

    addAttachment({
      id: selectedAudioNote?.id ?? '',
      type: 'conversation',
      title: selectedAudioNote?.title ?? '',
      value: selectedAudioNote.transcript,
      startedAt: selectedAudioNote?.startedAt ?? new Date(),
      endedAt: selectedAudioNote?.endedAt ?? new Date(),
    })
  }

  return (
    <SidePanelHeaderActionButton onClick={handleChatClick}>
      <MessageText variant="Bold" size={16} />
      <p>Chat</p>
    </SidePanelHeaderActionButton>
  )
}

function CopyAction() {
  const selectedAudioNote = useAtomValue(selectedAudioNoteAtom)

  async function handleCopyClick() {
    if (!selectedAudioNote?.transcript) return
    await window.navigator.clipboard.writeText(selectedAudioNote.transcript)
    toast('Transcript copied to clipboard', { icon: <Copy variant="Bold" size={20} /> })
  }

  return (
    <SidePanelHeaderActionButton onClick={handleCopyClick}>
      <Copy variant="Bold" size={16} />
      <p>Copy transcript</p>
    </SidePanelHeaderActionButton>
  )
}

function AudioNoteViewerBackButton() {
  const setSidePanelContentType = useSetAtom(sidePanelContentTypeAtom)
  const setShowBackButton = useSetAtom(showBackButtonAtom)

  function handleClick() {
    setShowBackButton(false)
    setSidePanelContentType('chat')
  }

  return (
    <button
      aria-label="Close Transcript Viewer"
      onClick={handleClick}
      className="relative flex items-center gap-2 text-subtle transition-colors hover:text-primary"
    >
      <ArrowRight size={14} className="rotate-180" />
      <span className="text-sm font-medium">Back to chat</span>
    </button>
  )
}

export function AudioNoteSidePanelHeader() {
  const selectedAudioNote = useAtomValue(selectedAudioNoteAtom)
  const formattedTitle = formatTitle(selectedAudioNote?.title)
  const showBackButton = useAtomValue(showBackButtonAtom)

  if (!selectedAudioNote?.transcript) {
    return (
      <h3 className="line-clamp-1 w-full text-ellipsis text-xl font-semibold tracking-tight">No audio note selected</h3>
    )
  }

  return (
    <div className="space-y-2.5">
      {showBackButton && <AudioNoteViewerBackButton />}

      <div className="space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="size-10 hidden place-items-center rounded-[10px] bg-secondary xl:grid">
            {selectedAudioNote?.meeting ? (
              <MeetingIcon meeting={selectedAudioNote.meeting} size={20} />
            ) : (
              <VoiceSquare size={20} variant="Bold" className="text-green" />
            )}
          </div>
          <div>
            <h3 className="line-clamp-1 w-full text-ellipsis font-semibold tracking-tight text-primary">
              {formattedTitle}
            </h3>
            <AudioNoteHeaderDates />
          </div>
        </div>
        <SidePanelHeaderActions>
          <ChatAction />
          <CopyAction />
        </SidePanelHeaderActions>
      </div>
    </div>
  )
}

export function AudioNoteSidePanelContent() {
  const selectedAudioNote = useAtomValue(selectedAudioNoteAtom)
  const transcriptMessages = parseTranscript(selectedAudioNote?.transcript)

  return (
    <article className="space-y-6">
      {transcriptMessages?.map((message, index) => <TranscriptMessageItem key={index} message={message} />)}
    </article>
  )
}
