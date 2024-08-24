'use client'
import React, { useMemo } from 'react'
import { Message, UserMessage } from '@/types/index'
import { ShareUserMessage } from '@/components/Share/Messages/ShareUserMessage'

interface SharePageComponentProps {
  messages: Message[]
}

const SharePageComponent: React.FC<SharePageComponentProps> = ({ messages }) => {
  const firstUserMessage = useMemo(() => {
    return messages.find((message): message is UserMessage => message.role === 'user')
  }, [messages])

  return (
    <div className="mx-auto w-full max-w-[--chat-body-width]">
      {firstUserMessage && <ShareUserMessage message={firstUserMessage} />}
    </div>
  )
}

export default SharePageComponent
