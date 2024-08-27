'use client'
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { Message, UserMessage } from '@/types/index'
import { ShareUserMessage } from '@/components/Share/Messages/User/ShareUserMessage'
import { ShareAssistantMessage } from '@/components/Share/Messages/Assistant/ShareAssistantMessage'
import GetHighlightCTA from '@/components/Share/CTA/GetHighlightCTA'
import { useApi } from '@/hooks/useApi'

interface SharePageComponentProps {
  messages: Message[]
}

const SharePageComponent: React.FC<SharePageComponentProps> = ({ messages }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isAtBottom, setIsAtBottom] = useState(false)
  const [processedMessages, setProcessedMessages] = useState<Message[]>([])
  const { getSharedImage } = useApi()

  const memoizedGetSharedImage = useCallback(getSharedImage, [])

  const memoizedMessages = useMemo(() => messages, [messages])

  useEffect(() => {
    console.log('SharePageComponent: Processing messages')
    const processMessages = async () => {
      const processed = await Promise.all(
        memoizedMessages.map(async (message) => {
          if (message.role === 'user' && 'image_url' in message && message.image_url) {
            try {
              const imageUrl = await memoizedGetSharedImage(message.image_url)
              return { ...message, fetchedImage: imageUrl }
            } catch (error) {
              console.error('Error fetching image:', error)
              return message
            }
          }
          return message
        }),
      )
      setProcessedMessages(processed)
    }

    processMessages()
  }, [memoizedMessages, memoizedGetSharedImage])

  console.log('SharePageComponent: Rendering')

  return (
    <div
      ref={containerRef}
      className="mx-auto w-full max-w-[--chat-body-width] overflow-y-auto"
      style={{ height: 'calc(100vh - 100px)' }}
    >
      <p className="m-4 text-center text-xs text-text-tertiary">
        Created with Highlight. Download to create and share your own chats
      </p>
      {processedMessages.map((message, index) => (
        <React.Fragment key={index}>
          {message.role === 'user' ? (
            <ShareUserMessage message={message as UserMessage} />
          ) : (
            <ShareAssistantMessage message={message} buttonTypes={['Copy', 'Share', 'Save']} />
          )}
        </React.Fragment>
      ))}
      {isAtBottom && <div className="h-20" />}
      <GetHighlightCTA />
    </div>
  )
}

export default React.memo(SharePageComponent)
