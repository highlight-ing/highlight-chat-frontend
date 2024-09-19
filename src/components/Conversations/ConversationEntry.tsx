import React from 'react'
import { VoiceSquare } from 'iconsax-react'
import { ConversationData } from '@/types/conversations'
import { useConversations } from '@/context/ConversationContext'

interface ConversationEntryProps {
  conversation: ConversationData
  isFirst: boolean
  isLast: boolean
}

function getRelativeTimeString(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 300) {
    return 'Moments ago'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  } else {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} day${days > 1 ? 's' : ''} ago`
  }
}

export function ConversationEntry({ conversation, isFirst, isLast }: ConversationEntryProps) {
  const { getWordCount } = useConversations()
  const isDefaultTitle = conversation.title.startsWith('Conversation ended at')
  const displayTitle =
    isDefaultTitle || conversation.title === '' ? getRelativeTimeString(conversation.timestamp) : conversation.title

  const roundedClasses = isFirst ? 'rounded-t-[20px]' : isLast ? 'rounded-b-[20px]' : ''

  return (
    <div
      className={`w-full border-t border-[#0F0F0F] bg-secondary p-6 transition-all duration-300 ease-in-out ${roundedClasses}`}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <VoiceSquare variant="Bold" size={28} color="#4CEDA0" />
          <h3 className="text-[16px] font-medium text-white">{displayTitle}</h3>
        </div>
        <button
          onClick={() => {}}
          className="rounded-[6px] bg-tertiary px-5 py-1 font-[13px] text-secondary transition-colors duration-200 hover:bg-white/20"
        >
          Share
        </button>
      </div>
      <div className="flex max-w-[280px] items-start rounded-[14px] border border-tertiary p-2 text-[14px] text-subtle">
        <VoiceSquare variant="Linear" size={42} color="#4CEDA0" className="mr-3" />
        <div className="flex flex-col justify-center">
          <span className="font-medium text-secondary">Conversation</span>
          <span className="text-[12px] text-tertiary">{getWordCount(conversation.transcript)} Words</span>
        </div>
      </div>
    </div>
  )
}
