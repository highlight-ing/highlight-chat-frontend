import { useConversations } from '@/context/ConversationContext'
import { getWordCountFormatted } from '@/utils/string'
import { getConversationDisplayTitle, getConversationWordCount } from '@/utils/conversations'
import { Setting2, VoiceSquare } from 'iconsax-react'
import { useStore } from '@/providers/store-provider'
import { useShallow } from 'zustand/react/shallow'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import AnimatedVoiceSquare from '@/components/Conversations/AnimatedVoiceSquare'
import { ScrollArea } from '@/components/ui/scroll-area'

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
      <div className="grid size-8 place-items-center rounded-[10px] border border-light-10 bg-green-20 text-green">
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
        <div className="grid size-8 grow-0 place-items-center rounded-[10px] border border-light-10 bg-green-20 text-green">
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
      <div className="grid size-8 grow-0 place-items-center rounded-[10px] border border-light-10 bg-green-20 text-green">
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
    <ScrollArea className="h-72 w-full">
      {attachmentOptions.map((option, index) => (
        <DropdownMenuItem key={index} onClick={option.onClick}>
          {option.imageComponent}
          <div className="flex flex-col">
            <span className="text-sm font-medium text-secondary">{option.title}</span>
            {option.description && <span className="text-xs text-tertiary">{option.description}</span>}
          </div>
        </DropdownMenuItem>
      ))}
    </ScrollArea>
  )
}
