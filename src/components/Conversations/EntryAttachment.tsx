import React from 'react'
import { getWordCount } from '@/utils/string'
import { ConversationData } from '@highlight-ai/app-runtime'
import { VoiceSquare } from 'iconsax-react'

import { Tooltip } from '@/components/ui/tooltip'
import { useInputFocus } from '@/components/Input/Input'
import { useStore } from '@/components/providers/store-provider'

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
      id: conversation.id,
      type: 'conversation',
      value: conversation.transcript,
      title: conversation.title,
      startedAt: conversation.startedAt,
      endedAt: conversation.endedAt,
    })
    focusInput()
  }

  return (
    <Tooltip content={tooltipContent} className="max-w-[300px]">
      <button
        onClick={handleAttachConversation}
        className="flex w-[280px] max-w-[280px] items-start rounded-[14px] border border-tertiary p-2 text-[14px] text-subtle hover:bg-tertiary"
      >
        <VoiceSquare variant="Linear" size={42} color="#4CEDA0" className="mr-3" />
        <div className="flex flex-col items-start justify-center">
          <span className="font-medium text-secondary">Conversation</span>
          <span className="text-[12px] text-tertiary">{getWordCount(conversation.transcript)} Words</span>
        </div>
      </button>
    </Tooltip>
  )
}
