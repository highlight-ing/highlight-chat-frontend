import React from 'react'
import styles from './message.module.scss'
import { Copy, Send2, ExportCircle, LikeDislike, Like1, Dislike } from 'iconsax-react'
import { AssistantMessageButtonType, AssistantMessageButtonStatus } from '@/types'
import { LinearIcon, NotionIcon } from '@/icons/icons'

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
      case 'Notion':
        return <NotionIcon size={20} />
      case 'Linear':
        return <LinearIcon size={20} />
      case 'Like':
        return <Like1 variant="Bold" size={20} />
      case 'Dislike':
        return <Dislike variant="Bold" size={20} />
      case 'LikeDislikeUpdate':
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
      case 'Notion':
        return 'Create Notion'
      case 'Linear':
        return 'Create Linear'
      case 'Like':
        return 'Give Feedback'
      case 'Dislike':
        return 'Give Feedback'
      case 'LikeDislikeUpdate':
        return 'Update Feedback'
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
        case 'Like':
          return 'Feedback Submitted'
        case 'Dislike':
          return 'Feedback Submitted'
        case 'LikeDislikeUpdate':
          return 'Feedback Updated'
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
      {type !== 'Like' && type !== 'Dislike' ? <div className={styles.buttonText}>{getText()}</div> : null}
    </button>
  )
}

export default AssistantMessageButton
