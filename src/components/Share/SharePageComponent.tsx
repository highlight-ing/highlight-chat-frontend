'use client'
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { Message, UserMessage } from '@/types/index'
import { ShareUserMessage } from '@/components/Share/Messages/User/ShareUserMessage'
import { ShareAssistantMessage } from '@/components/Share/Messages/Assistant/ShareAssistantMessage'
import GetHighlightCTA from '@/components/Share/CTA/GetHighlightCTA'
import { useApi } from '@/hooks/useApi'
import { initAmplitudeAnonymous, trackEvent } from '@/utils/amplitude'

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
    // Initialize Amplitude
    initAmplitudeAnonymous()

    // Track page view
    trackEvent('HL Chat Share Page Loaded', {})
  }, [])

  useEffect(() => {
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

  return (
    <div className="flex min-h-screen flex-col items-center">
      <div className="w-full max-w-[712px] flex-grow pb-24">
        <p className="m-4 text-center text-xs text-tertiary">
          Created with Highlight.{' '}
          <a
            href="https://highlight.ing/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline transition-colors duration-200 hover:text-secondary"
          >
            Download
          </a>{' '}
          to create and share your own chats
        </p>
        <div>
          {processedMessages.map((message, index) => (
            <React.Fragment key={index}>
              {message.role === 'user' ? (
                <ShareUserMessage message={message as UserMessage} />
              ) : (
                <ShareAssistantMessage message={message} buttonTypes={['Copy', 'Share', 'Save']} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
      <GetHighlightCTA />
    </div>
  )
}

export default React.memo(SharePageComponent)
