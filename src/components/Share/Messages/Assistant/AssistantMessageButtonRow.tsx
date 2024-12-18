import React from 'react'
import { AssistantMessageButtonConfig } from '@/types'

import AssistantMessageButton from './AssistantMessageButton'

interface AssistantMessageButtonRowProps {
  buttons: AssistantMessageButtonConfig[]
}

const AssistantMessageButtonRow: React.FC<AssistantMessageButtonRowProps> = ({ buttons }) => {
  return (
    <div className="my-2 mt-4 flex space-x-6">
      {buttons.map((button) => (
        <AssistantMessageButton key={button.type} type={button.type} onClick={button.onClick} status={button.status} />
      ))}
    </div>
  )
}

export default AssistantMessageButtonRow
