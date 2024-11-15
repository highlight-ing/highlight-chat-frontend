import React from 'react'
import Highlight, { ConversationData } from '@highlight-ai/app-runtime'
import { EntryAttachment } from './EntryAttachment'
import { ConversationsIcon } from '@/components/icons' // Import the new icon

interface ConversationEntryProps {
  conversation?: ConversationData
  isFirst: boolean
  isLast: boolean
  isShowMore?: boolean
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

export function ConversationEntry({ conversation, isFirst, isLast, isShowMore = false }: ConversationEntryProps) {
  const roundedClasses = isFirst ? 'rounded-t-[20px]' : isLast ? 'rounded-b-[20px]' : ''

  const handleShowMore = async () => {
    try {
      await Highlight.app.openApp('conversations')
    } catch (error) {
      console.error('Failed to open conversations app:', error)
    }
  }

  if (isShowMore) {
    return (
      <div
        className={`w-full border-t border-[#0F0F0F] bg-secondary p-6 transition-all duration-300 ease-in-out ${roundedClasses}`}
      >
        <div className="flex justify-center">
          <button
            onClick={handleShowMore}
            className="rounded-[6px] bg-tertiary px-5 py-2 font-medium text-secondary transition-colors duration-200 hover:bg-white/20"
          >
            Show More
          </button>
        </div>
      </div>
    )
  }

  const isDefaultTitle = conversation?.title.startsWith('Conversation ended at')
  const displayTitle =
    isDefaultTitle || conversation?.title === ''
      ? getRelativeTimeString(conversation?.timestamp ?? new Date())
      : conversation?.title

  return (
    <div
      className={`w-full border-t border-[#0F0F0F] bg-secondary p-6 transition-all duration-300 ease-in-out ${roundedClasses}`}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ConversationsIcon width={28} height={28} color="#4D8C6E" />
          <h3 className="text-[16px] font-medium text-white">{displayTitle}</h3>
        </div>
        {/* <button
          onClick={() => {}}
          className="rounded-[6px] bg-tertiary px-5 py-1 font-[13px] text-secondary transition-colors duration-200 hover:bg-white/20"
        >
          Share
        </button> */}
      </div>
      {conversation && <EntryAttachment conversation={conversation} />}
    </div>
  )
}
