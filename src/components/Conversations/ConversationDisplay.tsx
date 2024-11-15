import React, { useCallback, useEffect, useState } from 'react'
import { useConversations } from '@/context/ConversationContext'
import { getWordCount } from '@/utils/string'

import { ConversationEntry } from './ConversationEntry'
import { SectionHeader } from './SectionHeader'

type TimeFrame = 'today' | 'week' | 'two-weeks' | 'month'

interface ConversationDisplayProps {
  timeFrame?: TimeFrame
}

export default function ConversationDisplay({ timeFrame = 'week' }: ConversationDisplayProps) {
  const { conversations } = useConversations()
  const [timeThreshold, setTimeThreshold] = useState(new Date())

  const updateTimeThreshold = useCallback(() => {
    const now = new Date()
    setTimeThreshold(new Date(now.getTime() - 6 * 60 * 60 * 1000))
  }, [])

  useEffect(() => {
    updateTimeThreshold()
    const intervalId = setInterval(updateTimeThreshold, 5 * 60 * 1000) // Every 5 minutes
    return () => clearInterval(intervalId)
  }, [updateTimeThreshold])

  const recentConversations = conversations.filter(
    (conv) => conv.timestamp >= timeThreshold && getWordCount(conv.transcript) >= 50,
  )

  const hasRecentConversations = recentConversations.length > 0

  return (
    <div className="mx-auto mt-6 w-full max-w-[800px]">
      <SectionHeader title={hasRecentConversations ? 'Last 6 Hours' : 'No Conversations'} />
      {hasRecentConversations && (
        <>
          {recentConversations.map((conv, index) => (
            <ConversationEntry
              key={conv.id}
              conversation={conv}
              isFirst={index === 0}
              isLast={index === recentConversations.length - 1}
            />
          ))}
          <ConversationEntry isShowMore={true} isFirst={false} isLast={true} />
        </>
      )}
    </div>
  )
}
