import React from 'react'
import { VoiceSquare } from 'iconsax-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface EntryAttachmentProps {
  transcript: string
  wordCount: number
}

export function EntryAttachment({ transcript, wordCount }: EntryAttachmentProps) {
  const truncatedTranscript = transcript.split(' ').slice(0, 25).join(' ')
  const remainingWords = wordCount - 25

  const tooltipContent =
    remainingWords > 0 ? `${truncatedTranscript}... plus ${remainingWords} words` : truncatedTranscript

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex max-w-[280px] items-start rounded-[14px] border border-tertiary p-2 text-[14px] text-subtle">
            <VoiceSquare variant="Linear" size={42} color="#4CEDA0" className="mr-3" />
            <div className="flex flex-col justify-center">
              <span className="font-medium text-secondary">Conversation</span>
              <span className="text-[12px] text-tertiary">{wordCount} Words</span>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-[300px]">{tooltipContent}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
