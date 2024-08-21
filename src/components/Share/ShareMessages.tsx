'use client'
import React from 'react'
import ShareMessage from '@/components/Share/ShareMessage'
import { Message } from '@/types'
import styles from '../Messages/message.module.scss'

interface ShareMessagesProps {
  messages: Message[]
}

const ShareMessages: React.FC<ShareMessagesProps> = ({ messages }) => {
  return (
    <div className={styles.messagesContainer}>
      <div className={styles.messages}>
        {messages.map((message, index) => (
          <ShareMessage key={index} message={message} />
        ))}
      </div>
    </div>
  )
}

export default ShareMessages
