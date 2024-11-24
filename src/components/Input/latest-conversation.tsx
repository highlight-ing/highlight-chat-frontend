import { useMemo } from 'react'
import { useConversations } from '@/context/ConversationContext'
import { ConversationData } from '@highlight-ai/app-runtime'
import { VoiceSquare } from 'iconsax-react'
import { useSetAtom } from 'jotai'
import { useShallow } from 'zustand/react/shallow'

import { selectedAudioNoteAtom, transcriptOpenAtom } from '@/atoms/transcript-viewer'
import { useStore } from '@/components/providers/store-provider'

import { OpenAppButton } from '../buttons/open-app-button'
import Tooltip from '../Tooltip/Tooltip'
import { formatConversationDuration, formatConversationEndDate } from './utils'

function NoAudioNote() {
  return (
    <div className="flex h-14 w-full items-center justify-between rounded-2xl border border-[#191919] bg-primary px-3">
      <div className="flex items-center gap-3 font-medium text-subtle">
        <VoiceSquare size={24} variant="Bold" />
        <p>Your most recent audio note will show here</p>
      </div>
      <OpenAppButton
        appId="conversations"
        className="rounded-[6px] p-0.5 px-2 text-sm text-secondary transition-colors hover:bg-hover active:text-primary"
      >
        Open Highlight Audio
      </OpenAppButton>
    </div>
  )
}

function ChatWithConversationButton(props: { conversation: ConversationData }) {
  const { clearPrompt, addAttachment, startNewConversation } = useStore(
    useShallow((state) => ({
      clearPrompt: state.clearPrompt,
      addAttachment: state.addAttachment,
      startNewConversation: state.startNewConversation,
    })),
  )

  function handleClick() {
    clearPrompt()
    startNewConversation()

    addAttachment({
      id: props.conversation.id,
      type: 'conversation',
      title: props.conversation.title,
      value: props.conversation.transcript,
      startedAt: props.conversation.startedAt,
      endedAt: props.conversation.endedAt,
    })
  }

  return (
    <button
      type="button"
      aria-label="Chat"
      onClick={handleClick}
      className="hover:bg-white/15 rounded-[6px] bg-white/[8%] px-6 py-1 text-xs text-secondary transition-colors"
    >
      Chat
    </button>
  )
}

export function LatestConversation(props: { focusInput: () => void }) {
  const { conversations } = useConversations()
  const setTranscriptOpen = useSetAtom(transcriptOpenAtom)
  const setSelectedAudioNote = useSetAtom(selectedAudioNoteAtom)

  const { formattedMostRecentConversation, mostRecentConversation } = useMemo(() => {
    if (!conversations?.[0]) return { formattedMostRecentConversation: undefined, mostRecentConversation: undefined }

    const mostRecentConversation = conversations[0]

    const formattedConversationTitle =
      mostRecentConversation?.title.startsWith('Conversation ended') ||
      mostRecentConversation?.title.startsWith('Audio Notes from')
        ? 'Most Recent Audio Note'
        : (mostRecentConversation?.title ?? 'Most Recent Audio Note')

    const conversationWordCount = mostRecentConversation?.transcript.split(' ').length

    const conversationDurationInMilliseconds =
      mostRecentConversation?.endedAt.getTime() - mostRecentConversation?.startedAt.getTime()
    const formattedConversationDuration = formatConversationDuration(conversationDurationInMilliseconds)

    const formattedConversationEndDate = formatConversationEndDate(mostRecentConversation.endedAt)

    return {
      formattedMostRecentConversation: {
        id: mostRecentConversation.id,
        title: formattedConversationTitle,
        wordCount: conversationWordCount,
        duration: formattedConversationDuration,
        endedAt: formattedConversationEndDate,
        conversation: mostRecentConversation,
      },
      mostRecentConversation,
    }
  }, [conversations?.[0]])

  if (!formattedMostRecentConversation) return <NoAudioNote />

  function handleClick() {
    if (!mostRecentConversation) return
    setSelectedAudioNote(mostRecentConversation)
    setTranscriptOpen(true)
  }

  return (
    <button
      aria-label="View Audio Note"
      onClick={handleClick}
      className="group flex w-full items-start justify-between rounded-2xl border border-[#191919] bg-secondary p-4 shadow-md transition-colors ease-out hover:bg-secondary"
    >
      <div className="space-y-1.5">
        <Tooltip position="top" tooltip="View audio note">
          <div className="flex items-center gap-3 font-medium text-primary">
            <VoiceSquare size={24} variant="Bold" className="text-green" />
            <p>{formattedMostRecentConversation.title}</p>
          </div>
        </Tooltip>
        <div className="flex items-center gap-3 text-sm capitalize text-subtle">
          <Tooltip position="top" tooltip="Ended">
            <p>{formattedMostRecentConversation.endedAt}</p>
          </Tooltip>
          <Tooltip position="top" tooltip="Duration">
            <p>{formattedMostRecentConversation.duration}</p>
          </Tooltip>
          <Tooltip position="top" tooltip="Word count">
            <p>{`${formattedMostRecentConversation.wordCount} Words`}</p>
          </Tooltip>
        </div>
      </div>
      <div
        onClick={props.focusInput}
        className="flex items-center gap-3 opacity-0 transition-opacity group-hover:opacity-100"
      >
        <ChatWithConversationButton conversation={formattedMostRecentConversation.conversation} />
      </div>
    </button>
  )
}
