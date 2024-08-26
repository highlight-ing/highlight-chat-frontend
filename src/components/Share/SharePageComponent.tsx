'use client'
import React from 'react'
import { Message } from '@/types/index'
import { ShareUserMessage } from '@/components/Share/Messages/ShareUserMessage'
import { ShareAssistantMessage } from '@/components/Share/Messages/ShareAssistantMessage'

interface SharePageComponentProps {
  messages: Message[]
}

const SharePageComponent: React.FC<SharePageComponentProps> = ({ messages }) => {
  return (
    <div className="mx-auto w-full max-w-[--chat-body-width]">
      {messages.map((message, index) => (
        <React.Fragment key={index}>
          {message.role === 'user' ? (
            <ShareUserMessage message={message} />
          ) : (
            <ShareAssistantMessage message={message} />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

export default SharePageComponent
