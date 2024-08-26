import { useState } from 'react'
import { AssistantMessageButtonType, AssistantMessageButtonConfig, AssistantMessageButtonStatus } from '@/types'

type UseAssistantMessageButtonsOptions = {
  message: string
  buttonTypes: AssistantMessageButtonType[]
}

export const useAssistantMessageButtons = ({
  message,
  buttonTypes,
}: UseAssistantMessageButtonsOptions): AssistantMessageButtonConfig[] => {
  const [buttonStatuses, setButtonStatuses] = useState<
    Record<AssistantMessageButtonType, AssistantMessageButtonStatus>
  >(
    Object.fromEntries(buttonTypes.map((type) => [type, 'idle'])) as Record<
      AssistantMessageButtonType,
      AssistantMessageButtonStatus
    >,
  )

  const updateButtonStatus = (type: AssistantMessageButtonType, status: AssistantMessageButtonStatus) => {
    setButtonStatuses((prev) => ({ ...prev, [type]: status }))
    if (status === 'success') {
      setTimeout(() => setButtonStatuses((prev) => ({ ...prev, [type]: 'idle' })), 1000)
    }
  }

  const shareMessage = `${message}\n\nCreated with Highlight`

  const handleCopy = () => {
    navigator.clipboard
      .writeText(shareMessage)
      .then(() => updateButtonStatus('Copy', 'success'))
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
        .then(() => updateButtonStatus('Share', 'success'))
        .catch((error) => console.error('Error sharing:', error))
    } else {
      console.log('Share functionality not available')
    }
  }

  const handleSave = () => {
    try {
      const blob = new Blob([shareMessage], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'saved_message.txt'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      updateButtonStatus('Save', 'success')
    } catch (error) {
      console.error('Error saving:', error)
    }
  }

  const handleSendFeedback = () => {
    setTimeout(() => updateButtonStatus('SendFeedback', 'success'), 500)
  }

  const buttonActions: Record<AssistantMessageButtonType, Pick<AssistantMessageButtonConfig, 'onClick'>> = {
    Copy: { onClick: handleCopy },
    Share: { onClick: handleShare },
    Save: { onClick: handleSave },
    SendFeedback: { onClick: handleSendFeedback },
  }

  const buttons: AssistantMessageButtonConfig[] = buttonTypes.map((type) => ({
    type,
    onClick: buttonActions[type].onClick,
    status: buttonStatuses[type],
  }))

  return buttons
}
