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
        setTimeout(() => setCopyStatus('idle'), 2000)
      })
      .catch((err) => console.error('Failed to copy: ', err))
  }

  const handleShare = () => {
    // Implement share logic
  }

  const handleSave = () => {
    // Implement save logic
  }

  const handleSendFeedback = () => {
    // Implement send feedback logic
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
