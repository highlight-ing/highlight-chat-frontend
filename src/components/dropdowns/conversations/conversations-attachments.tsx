import { useConversations } from '@/context/ConversationContext'
import { Setting2, VoiceSquare } from 'iconsax-react'
import { useShallow } from 'zustand/react/shallow'

import { getConversationDisplayTitle, getConversationWordCount } from '@/utils/conversations'
import { getWordCountFormatted } from '@/utils/string'
import { ScrollArea } from '@/components/ui/scroll-area'
import AnimatedVoiceSquare from '@/components/Conversations/AnimatedVoiceSquare'
import { useStore } from '@/components/providers/store-provider'

const MAX_NUM_CONVERSATION = 20

export const ConversationAttachments = () => {
  const { conversations, elapsedTime, currentConversation, isAudioTranscripEnabled, setIsAudioTranscriptEnabled } =
    useConversations()
  const currentConversationTitle = 'Active Audio'
  const currentConversationTimestamp = new Date(Date.now() - elapsedTime * 1000)

  const { addAttachment } = useStore(
    useShallow((state) => ({
      addAttachment: state.addAttachment,
    })),
  )

  const currentConversationOptions = {
    imageComponent: (
      <div className="size-9 grid shrink-0 place-items-center rounded-[12px] bg-green-20 text-green">
        <AnimatedVoiceSquare
          width={16}
          height={16}
          backgroundColor="transparent"
          lineColor="rgba(76, 237, 160, 1.0)"
          shouldAnimate={false}
          transitionDuration={0}
        />
      </div>
    ),
    title: currentConversationTitle,
    description: `${getWordCountFormatted(currentConversation)} Words`,
    onClick: () => {
      addAttachment({
        id: '',
        type: 'conversation',
        value: currentConversation,
        title: 'Current Conversation',
        startedAt: currentConversationTimestamp,
        endedAt: new Date(),
        isCurrentConversation: true,
      })
    },
  }

  const options = conversations
    .filter((conversation) => conversation.transcript.length > 0)
    .slice(0, MAX_NUM_CONVERSATION)
    .map((conversation) => ({
      imageComponent: (
        <div className="size-10 grid shrink-0 place-items-center rounded-[12px] bg-green-20 text-green">
          <VoiceSquare size={16} variant="Bold" />
        </div>
      ),
      title: getConversationDisplayTitle(conversation),
      description: getConversationWordCount(conversation),
      onClick: () => {
        addAttachment({
          id: conversation.id,
          type: 'conversation',
          value: conversation.transcript,
          title: conversation.title,
          startedAt: conversation.startedAt,
          endedAt: conversation.endedAt,
        })
      },
    }))

  const enableAudioTranscriptOption = {
    imageComponent: (
      <div className="size-10 grid shrink-0 place-items-center rounded-[12px] bg-green-20 text-green">
        <Setting2 size={16} variant="Bold" />
      </div>
    ),
    title: 'Enable Audio',
    description: 'Audio not being recorded',
    onClick: () => setIsAudioTranscriptEnabled(true),
  }

  const noConversationsOption = {
    imageComponent: <div className="w-1" />,
    title: 'No conversations yet',
    description: 'Transcribing...',
    onClick: () => null,
  }

  const attachmentOptions = !isAudioTranscripEnabled
    ? [enableAudioTranscriptOption, ...options]
    : currentConversation.length > 0
      ? [currentConversationOptions, ...options]
      : options.length > 0
        ? options
        : [noConversationsOption]

  return (
    <ScrollArea className="h-60 w-full">
      <div className="space-y-2">
        {attachmentOptions.map((option, index) => (
          <div
            key={index}
            onClick={option.onClick}
            className="relative flex cursor-pointer items-center gap-2 rounded-2xl border border-tertiary p-1.5 hover:bg-hover"
          >
            {option.imageComponent}
            <div className="flex flex-col">
              <span className="line-clamp-1 text-xs font-medium text-secondary">{option.title}</span>
              {option.description && <span className="text-[10px] text-tertiary">{option.description}</span>}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
