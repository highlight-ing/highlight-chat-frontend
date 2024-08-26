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

  const buttonClass = `group flex items-center rounded-full bg-background-secondary p-2 transition-colors hover:bg-background-secondary ${
    type === 'Copy' && status === 'copied' ? 'animate-pulse' : ''
  }`

  return (
    <button onClick={onClick} className={buttonClass}>
      <span className="text-text-tertiary transition-colors group-hover:text-primary">{getIcon()}</span>
      <span className="ml-2 text-[13px] font-medium text-text-tertiary transition-colors group-hover:text-primary">
        {getText()}
      </span>
    </button>
  )
}

export default AssistantMessageButton
