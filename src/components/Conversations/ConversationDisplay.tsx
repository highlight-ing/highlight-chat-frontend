import React from 'react'
import { ConversationEntry } from './ConversationEntry'
import { SectionHeader } from './SectionHeader'
import { useConversations } from '@/context/ConversationContext'

type TimeFrame = 'today' | 'week' | 'two-weeks' | 'month'

interface ConversationDisplayProps {
  timeFrame?: TimeFrame
}

export default function ConversationDisplay({ timeFrame = 'week' }: ConversationDisplayProps) {
  const { conversations } = useConversations()

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const timeFrameStart = new Date(todayStart)

  switch (timeFrame) {
    case 'today':
      break
    case 'week':
      timeFrameStart.setDate(timeFrameStart.getDate() - 7)
      break
    case 'two-weeks':
      timeFrameStart.setDate(timeFrameStart.getDate() - 14)
      break
    case 'month':
      timeFrameStart.setMonth(timeFrameStart.getMonth() - 1)
      break
  }

  const todayConversations = conversations.filter((conv) => conv.timestamp >= todayStart)

  const pastConversations = conversations.filter(
    (conv) => conv.timestamp < todayStart && conv.timestamp >= timeFrameStart,
  )

  return (
    <div className="mx-auto mt-6 w-full max-w-[800px]">
      <SectionHeader title="Today" />
      {todayConversations.map((conv, index) => (
        <ConversationEntry
          key={conv.id}
          conversation={conv}
          isFirst={index === 0}
          isLast={index === todayConversations.length - 1}
        />
      ))}

      <SectionHeader title={`Past ${timeFrame === 'today' ? '24 Hours' : '7 Days'}`} />
      {pastConversations.map((conv, index) => (
        <ConversationEntry
          key={conv.id}
          conversation={conv}
          isFirst={index === 0}
          isLast={index === pastConversations.length - 1}
        />
      ))}
    </div>
  )
}
