import React from 'react'
import styles from './message.module.scss'
import { Copy, Send2, ExportCircle, LikeDislike } from 'iconsax-react'
import { AssistantMessageButtonType, AssistantMessageButtonStatus } from '@/types'

interface AssistantMessageButtonProps {
  type: AssistantMessageButtonType
  onClick: (e: any) => void
  status: AssistantMessageButtonStatus
}

const AssistantMessageButton: React.FC<AssistantMessageButtonProps> = ({ type, onClick, status }) => {
  const getIcon = () => {
    switch (type) {
      case 'Copy':
        return <Copy variant="Bold" size={20} />
      case 'LikeDislike':
        return <LikeDislike variant="Bold" size={20} />
      case 'Share':
        return <Send2 variant="Bold" size={20} />
      case 'Open':
        return <ExportCircle variant="Bold" size={20} />
    }
  }

  const getDisplayText = (buttonType: AssistantMessageButtonType) => {
    switch (buttonType) {
      case 'Copy':
        return 'Copy'
      case 'LikeDislike':
        return 'Give Feedback'
      case 'Share':
        return 'Share'
      case 'Open':
        return 'Open in Highlight Chat'
    }
  }

  const getText = () => {
    if (status === 'success') {
      switch (type) {
        case 'Copy':
          return 'Copied!'
        case 'LikeDislike':
          return 'Feedback Submitted'
        case 'Share':
          return 'Shared!'
        case 'Open':
          return 'Opened!'
      }
    }
    return getDisplayText(type)
  }

  return (
    <button className={styles.assistantMessageButton} onClick={onClick}>
      <div className={styles.iconWrapper}>{getIcon()}</div>
      <div className={styles.buttonText}>{getText()}</div>
    </button>
  )
}

export default AssistantMessageButton
