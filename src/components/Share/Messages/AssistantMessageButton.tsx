import React from 'react'
import { Copy, Send2, ExportCircle, Flag2 } from 'iconsax-react'
import { AssistantMessageButtonType, AssistantMessageButtonStatus } from '@/types'

interface AssistantMessageButtonProps {
  type: AssistantMessageButtonType
  onClick: () => void
  status: AssistantMessageButtonStatus
}

const AssistantMessageButton: React.FC<AssistantMessageButtonProps> = ({ type, onClick, status }) => {
  const getIcon = () => {
    switch (type) {
      case 'Copy':
        return <Copy variant="Bold" size={16} />
      case 'Share':
        return <Send2 variant="Bold" size={16} />
      case 'Save':
        return <ExportCircle variant="Bold" size={16} />
      case 'SendFeedback':
        return <Flag2 variant="Bold" size={16} />
    }
  }

  const getText = () => {
    if (status === 'success') {
      switch (type) {
        case 'Copy':
          return 'Copied!'
        case 'Share':
          return 'Shared!'
        case 'Save':
          return 'Saved!'
        case 'SendFeedback':
          return 'Sent!'
      }
    }
    return type
  }

  const buttonClass = `group flex items-center rounded-full bg-background-secondary p-2 transition-all duration-300 
        hover:bg-primary-10 ${status === 'success' ? 'animate-gentle-scale bg-primary-20' : ''}`

  const iconClass = `text-text-tertiary transition-colors group-hover:text-primary ${
    status === 'success' ? 'text-primary' : ''
  }`

  const textClass = `ml-2 text-[13px] font-medium text-text-tertiary transition-colors group-hover:text-primary ${
    status === 'success' ? 'text-primary' : ''
  }`

  return (
    <button onClick={onClick} className={buttonClass}>
      <span className={iconClass}>{getIcon()}</span>
      <span className={textClass}>{getText()}</span>
    </button>
  )
}
export default AssistantMessageButton
