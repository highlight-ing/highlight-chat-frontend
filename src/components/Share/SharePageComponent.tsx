'use client'
import React, { useMemo } from 'react'
import { Message, UserMessage, AssistantMessage } from '@/types/index'
import { ShareUserMessage } from '@/components/Share/Messages/ShareUserMessage'
import { ShareAssistantMessage } from '@/components/Share/Messages/ShareAssistantMessage'

interface SharePageComponentProps {
  messages: Message[]
}

const SharePageComponent: React.FC<SharePageComponentProps> = ({ messages }) => {
  const firstUserMessage = useMemo(() => {
    return messages.find((message): message is UserMessage => message.role === 'user')
  }, [messages])

  const firstAssistantMessage = useMemo(() => {
    return messages.find((message): message is AssistantMessage => message.role === 'assistant')
  }, [messages])

  return (
    <div className="mx-auto w-full max-w-[--chat-body-width]">
      {firstUserMessage && <ShareUserMessage message={firstUserMessage} />}
      {firstAssistantMessage && <ShareAssistantMessage message={firstAssistantMessage} />}
    </div>
  )
}

export default SharePageComponent
