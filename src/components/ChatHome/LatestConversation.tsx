import { VoiceSquare } from 'iconsax-react'
import { OpenAppButton } from '../buttons/open-app-button'
import { useConversations } from '@/context/ConversationContext'
import { useMemo } from 'react'
import { formatConversationDuration, formatConversationEndDate } from './utils'
import Tooltip from '../Tooltip/Tooltip'
import { useStore } from '@/providers/store-provider'
import { ConversationData } from '@highlight-ai/app-runtime'

function NoAudioNote() {
  return (
    <div className="flex h-14 w-full items-center justify-between rounded-2xl border border-[#191919] px-3">
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
  const addAttachment = useStore((state) => state.addAttachment)

  function handleClick() {
    addAttachment({
      id: props.conversation.id,
      type: 'conversation',
      title: props.conversation.title,
      value: props.conversation.transcript,
      startedAt: props.conversation.startedAt,
      endedAt: props.conversation.endedAt,
    })
  }

  return <button onClick={handleClick}>Chat</button>
}

export function LatestConversation() {
  const { conversations } = useConversations()

  const mostRecentConversation = useMemo(() => {
    if (conversations.length > 0) {
      const mostRecentConversation = conversations[0]

      const formattedConversationTitle =
        mostRecentConversation?.title.startsWith('Conversation ended') ||
        mostRecentConversation?.title.startsWith('Audio Notes from')
          ? 'Audio Note'
          : (mostRecentConversation?.title ?? 'Audio Note')

      const conversationWordCount = mostRecentConversation?.transcript.split(' ').length

      const conversationDurationInMilliseconds =
        mostRecentConversation?.endedAt.getTime() - mostRecentConversation?.startedAt.getTime()
      const formattedConversationDuration = formatConversationDuration(conversationDurationInMilliseconds)

      const formattedConversationEndDate = formatConversationEndDate(mostRecentConversation.endedAt)

      return {
        title: formattedConversationTitle,
        wordCount: conversationWordCount,
        duration: formattedConversationDuration,
        endedAt: formattedConversationEndDate,
        conversation: mostRecentConversation,
      }
    }
  }, [conversations])

  if (!mostRecentConversation) return <NoAudioNote />

  return (
    <div className="group flex w-full items-start justify-between rounded-2xl border border-[#191919] p-4 transition-colors ease-out hover:bg-white/[4%]">
      <div className="space-y-1.5">
        <div className="flex items-center gap-3 font-medium text-primary">
          <VoiceSquare size={24} variant="Bold" className="text-green" />
          <p>{mostRecentConversation.title}</p>
        </div>
        <div className="flex items-center gap-3 text-sm capitalize text-subtle">
          <Tooltip position="top" tooltip="Ended">
            <p>{mostRecentConversation.endedAt}</p>
          </Tooltip>
          <Tooltip position="top" tooltip="Duration">
            <p>{mostRecentConversation.duration}</p>
          </Tooltip>
          <Tooltip position="top" tooltip="Word count">
            <p>{`${mostRecentConversation.wordCount} Words`}</p>
          </Tooltip>
        </div>
      </div>
      <div className="flex items-center gap-3 opacity-0 transition-opacity group-hover:opacity-100">
        <ChatWithConversationButton conversation={mostRecentConversation.conversation} />
      </div>
    </div>
  )
}
