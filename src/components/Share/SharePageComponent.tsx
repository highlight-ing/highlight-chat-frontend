'use client'
import React from 'react'
import { Message } from '@/types/index'
import { ShareUserMessage } from '@/components/Share/Messages/User/ShareUserMessage'
import { ShareAssistantMessage } from '@/components/Share/Messages/Assistant/ShareAssistantMessage'

interface SharePageComponentProps {
  messages: Message[]
}

const SharePageComponent: React.FC<SharePageComponentProps> = ({ messages }) => {
  return (
    <div className="mx-auto w-full max-w-[--chat-body-width]">
      <p className="m-4 text-center text-xs text-text-tertiary">
        Created with Highlight. Download to create and share your own chats
      </p>
      {messages.map((message, index) => (
        <React.Fragment key={index}>
          {message.role === 'user' ? (
            <ShareUserMessage message={message} />
          ) : (
            <ShareAssistantMessage message={message} buttonTypes={['Copy', 'Share', 'Save']} />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

export default SharePageComponent
