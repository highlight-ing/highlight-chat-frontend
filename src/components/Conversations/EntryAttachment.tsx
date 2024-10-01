import React from 'react'
import { VoiceSquare } from 'iconsax-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useStore } from '@/providers/store-provider'
import { useInputFocus } from '@/components/Input/Input'
import { ConversationData } from '@highlight-ai/app-runtime'
import { getWordCount } from '@/utils/string'

interface EntryAttachmentProps {
  conversation: ConversationData
}

export function EntryAttachment({ conversation }: EntryAttachmentProps) {
  const addAttachment = useStore((state) => state.addAttachment)
  const focusInput = useInputFocus()

  const truncatedTranscript = conversation.transcript.split(' ').slice(0, 25).join(' ')
  const remainingWords = getWordCount(conversation.transcript) - 25

  const tooltipContent =
    remainingWords > 0 ? `${truncatedTranscript}... plus ${remainingWords} words` : truncatedTranscript

  const handleAttachConversation = () => {
    addAttachment({
      type: 'conversation',
      value: conversation.transcript,
      title: conversation.title,
      startedAt: conversation.startedAt,
      endedAt: conversation.endedAt,
    })
    focusInput()
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleAttachConversation}
            className="flex w-[280px] max-w-[280px] items-start rounded-[14px] border border-tertiary p-2 text-[14px] text-subtle hover:bg-tertiary"
          >
            <VoiceSquare variant="Linear" size={42} color="#4CEDA0" className="mr-3" />
            <div className="flex flex-col items-start justify-center">
              <span className="font-medium text-secondary">Conversation</span>
              <span className="text-[12px] text-tertiary">{wordCount} Words</span>
            </div>
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-[300px]">{tooltipContent}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
