'use client'
import React, { useEffect, useRef, useState } from 'react'
import { Message } from '@/types/index'
import { ShareUserMessage } from '@/components/Share/Messages/User/ShareUserMessage'
import { ShareAssistantMessage } from '@/components/Share/Messages/Assistant/ShareAssistantMessage'
import GetHighlightCTA from '@/components/Share/CTA/GetHighlightCTA'

interface SharePageComponentProps {
  messages: Message[]
}

const SharePageComponent: React.FC<SharePageComponentProps> = ({ messages }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isAtBottom, setIsAtBottom] = useState(false)

  useEffect(() => {
    const checkIfAtBottom = () => {
      if (containerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = containerRef.current
        setIsAtBottom(scrollTop + clientHeight >= scrollHeight - 10) // 10px threshold
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('scroll', checkIfAtBottom)
      checkIfAtBottom() // Check initial state
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', checkIfAtBottom)
      }
    }
  }, [messages])

  return (
    <div
      ref={containerRef}
      className="mx-auto w-full max-w-[--chat-body-width] overflow-y-auto"
      style={{ height: 'calc(100vh - 100px)' }} // Adjust this value as needed
    >
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
      {isAtBottom && <div className="h-20" />} {/* Additional padding when at bottom */}
      <GetHighlightCTA />
    </div>
  )
}

export default SharePageComponent
