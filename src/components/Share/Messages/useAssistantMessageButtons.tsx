import { useState } from 'react'
import { AssistantMessageButtonType, AssistantMessageButtonConfig } from '@/types'

type UseAssistantMessageButtonsOptions = {
  message: string
  buttonTypes: AssistantMessageButtonType[]
}

export const useAssistantMessageButtons = ({ message, buttonTypes }: UseAssistantMessageButtonsOptions) => {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle')

  const handleCopy = () => {
    navigator.clipboard
      .writeText(message)
      .then(() => {
        setCopyStatus('copied')
        setTimeout(() => setCopyStatus('idle'), 1000)
      })
      .catch((err) => console.error('Failed to copy: ', err))
  }

  const handleShare = () => {
    // Implement share logic
    // This could open a modal or use the Web Share API if available
    if (navigator.share) {
      navigator
        .share({
          title: 'Shared Message',
          text: message,
          url: window.location.href,
        })
        .catch((error) => console.error('Error sharing:', error))
    } else {
      // Fallback for browsers that don't support Web Share API
      console.log('Share functionality not available')
      // You could implement a custom share modal here
    }
  }

  const handleSave = () => {
    // Implement save logic
    // This could save the message to local storage or trigger a download
    const blob = new Blob([message], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'saved_message.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleSendFeedback = () => {
    // Implement send feedback logic
    // This could open a feedback form or modal
    console.log('Send feedback clicked')
    // You could implement a custom feedback modal or form here
  }

  const buttonActions: Record<AssistantMessageButtonType, Omit<AssistantMessageButtonConfig, 'type'>> = {
    Copy: { onClick: handleCopy, status: copyStatus },
    Share: { onClick: handleShare },
    Save: { onClick: handleSave },
    SendFeedback: { onClick: handleSendFeedback },
  }

  const buttons: AssistantMessageButtonConfig[] = buttonTypes.map((type) => ({
    type,
    ...buttonActions[type],
  }))

  return buttons
}
