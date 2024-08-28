'use client'
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { Message, UserMessage } from '@/types/index'
import { ShareUserMessage } from '@/components/Share/Messages/User/ShareUserMessage'
import { ShareAssistantMessage } from '@/components/Share/Messages/Assistant/ShareAssistantMessage'
import GetHighlightCTA from '@/components/Share/CTA/GetHighlightCTA'
import { useApi } from '@/hooks/useApi'
import { initAmplitudeAnonymous, trackEvent } from '@/utils/amplitude'
import { useDownloadOrRedirect } from '@/hooks/useDownloadOrRedirect'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/DropdownMenu/dropdown-menu'

interface SharePageComponentProps {
  messages: Message[]
}

const SharePageComponent: React.FC<SharePageComponentProps> = ({ messages }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isAtBottom, setIsAtBottom] = useState(false)
  const [processedMessages, setProcessedMessages] = useState<Message[]>([])
  const { getSharedImage } = useApi()
  const { platform, isMobile, handleDownload } = useDownloadOrRedirect()

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

  const renderDownloadButton = () => {
    if (isMobile) {
      return (
        <a
          href="https://highlight.ing/discord"
          target="_blank"
          rel="noopener noreferrer"
          className="underline transition-colors duration-200 hover:text-secondary"
        >
          Join our Discord
        </a>
      )
    }

    if (platform === 'mac') {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <a href="#" className="underline transition-colors duration-200 hover:text-secondary">
              Download
            </a>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="border border-light-10 bg-secondary">
            <DropdownMenuItem
              onClick={() => handleDownload('intel')}
              className="px-4 py-2 transition-colors duration-150 ease-in-out hover:bg-light-10"
            >
              Download for Intel Mac
            </DropdownMenuItem>
            <div className="mx-2 my-1 border-t border-light-10"></div>
            <DropdownMenuItem
              onClick={() => handleDownload('silicon')}
              className="px-4 py-2 transition-colors duration-150 ease-in-out hover:bg-light-10"
            >
              Download for Silicon Mac
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }

    return (
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault()
          handleDownload()
        }}
        className="underline transition-colors duration-200 hover:text-secondary"
      >
        Download
      </a>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center">
      <div className="w-full max-w-[712px] flex-grow pb-24">
        <p className="m-4 text-center text-xs text-tertiary">
          Created with Highlight. {renderDownloadButton()}{' '}
          {isMobile ? 'to learn more' : 'to create and share your own chats'}
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
