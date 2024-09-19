import React, { useState, useEffect, useCallback } from 'react'
import { ConversationEntry } from './ConversationEntry'
import { SectionHeader } from './SectionHeader'
import { useConversations } from '@/context/ConversationContext'

type TimeFrame = 'today' | 'week' | 'two-weeks' | 'month'

interface ConversationDisplayProps {
  timeFrame?: TimeFrame
}

export default function ConversationDisplay({ timeFrame = 'week' }: ConversationDisplayProps) {
  const { conversations, getWordCount } = useConversations()
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

  return (
    <div className="mx-auto mt-6 w-full max-w-[800px]">
      <SectionHeader title="Last 6 Hours" />
      {recentConversations.map((conv, index) => (
        <ConversationEntry
          key={conv.id}
          conversation={conv}
          isFirst={index === 0}
          isLast={index === recentConversations.length - 1}
        />
      ))}
    </div>
  )
}
