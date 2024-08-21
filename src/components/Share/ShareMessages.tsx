import React from 'react'
import ShareMessage from '@/components/Share/ShareMessage'
import { Message as MessageType } from '@/types'

interface ShareMessagesProps {
  messages: MessageType[]
}

const ShareMessages: React.FC<ShareMessagesProps> = ({ messages }) => {
  return (
    <div className="space-y-4">
      {messages.map((message, index) => (
        <ShareMessage key={index} message={message} />
      ))}
    </div>
  )
}

export default ShareMessages
