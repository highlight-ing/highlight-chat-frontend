import React from 'react'
import { Message as MessageType } from '@/types'

interface ShareMessageProps {
  message: MessageType
}

const ShareMessage: React.FC<ShareMessageProps> = ({ message }) => {
  return (
    <div className={`message ${message.role === 'user' ? 'user' : 'assistant'}`}>
      <div className="message-content">
        {/* Render message content */}
        {message.content}
      </div>
    </div>
  )
}

export default ShareMessage
