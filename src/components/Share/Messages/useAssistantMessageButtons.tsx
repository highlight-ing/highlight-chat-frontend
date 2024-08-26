import { useState } from 'react'
import { AssistantMessageButtonType, AssistantMessageButtonConfig } from '@/types'

type UseAssistantMessageButtonsOptions = {
  message: string
  buttonTypes: AssistantMessageButtonType[]
}

export const useAssistantMessageButtons = ({ message, buttonTypes }: UseAssistantMessageButtonsOptions) => {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle')

  //TODO: - What copy do we want here?
  const shareMessage = `${message}\n\nCreated with Highlight`

  const handleCopy = () => {
    navigator.clipboard
      .writeText(shareMessage)
      .then(() => {
        setCopyStatus('copied')
        setTimeout(() => setCopyStatus('idle'), 1000)
      })
      .catch((err) => console.error('Failed to copy: ', err))
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: 'Shared Message',
          text: shareMessage,
          url: window.location.href,
        })
        .catch((error) => console.error('Error sharing:', error))
    } else {
      // Fallback for browsers that don't support Web Share API
      console.log('Share functionality not available')
    }
  }

  const handleSave = () => {
    const blob = new Blob([shareMessage], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'saved_message.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  //TODO: Implement send feedback logic
  const handleSendFeedback = () => {
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
