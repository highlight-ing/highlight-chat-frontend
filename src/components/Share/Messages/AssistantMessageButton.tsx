import React from 'react'
import { Copy, Send2, ExportCircle, Flag2 } from 'iconsax-react'
import { AssistantMessageButtonType } from '@/types'

interface AssistantMessageButtonProps {
  type: AssistantMessageButtonType
  onClick: () => void
  status?: 'idle' | 'copied' // Only used for Copy button
}

const AssistantMessageButton: React.FC<AssistantMessageButtonProps> = ({ type, onClick, status = 'idle' }) => {
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
    if (type === 'Copy' && status === 'copied') {
      return 'Copied!'
    }
    return type
  }

  const buttonClass = `group flex items-center rounded-full bg-background-secondary p-2 transition-all duration-300 
        hover:bg-primary-10 ${type === 'Copy' && status === 'copied' ? 'animate-gentle-scale bg-primary-20' : ''}`

  const iconClass = `text-text-tertiary transition-colors group-hover:text-primary ${
    type === 'Copy' && status === 'copied' ? 'text-primary' : ''
  }`

  const textClass = `ml-2 text-[13px] font-medium text-text-tertiary transition-colors group-hover:text-primary ${
    type === 'Copy' && status === 'copied' ? 'text-primary' : ''
  }`

  return (
    <button onClick={onClick} className={buttonClass}>
      <span className={iconClass}>{getIcon()}</span>
      <span className={textClass}>{getText()}</span>
    </button>
  )
}
export default AssistantMessageButton
