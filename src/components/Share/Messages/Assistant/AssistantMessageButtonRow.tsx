import React from 'react'
import AssistantMessageButton from './AssistantMessageButton'
import { AssistantMessageButtonConfig } from '@/types'

interface AssistantMessageButtonRowProps {
  buttons: AssistantMessageButtonConfig[]
}

const AssistantMessageButtonRow: React.FC<AssistantMessageButtonRowProps> = ({ buttons }) => {
  return (
    <div className="flex space-x-4">
      {buttons.map((button) => (
        <AssistantMessageButton key={button.type} type={button.type} onClick={button.onClick} status={button.status} />
      ))}
    </div>
  )
}

export default AssistantMessageButtonRow
