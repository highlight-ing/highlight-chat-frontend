import { Copy, Flag, SaveAdd, Send2 } from 'iconsax-react'
import styles from './conversationpreview.module.scss'
import { ChatHistoryItem } from '@/types'

interface ActionButton {
  actionType: 'copy' | 'share' | 'save' | 'feedback'
}

const ActionButton = ({ actionType }: ActionButton) => {
  let icon, text
  switch (actionType) {
    case 'copy':
      icon = <Copy variant="Bold" size={16} />
      text = 'Copy'
      break
    case 'share':
      icon = <Send2 variant="Bold" size={16} />
      text = 'Share'
      break
    case 'save':
      icon = <SaveAdd variant="Bold" size={16} />
      text = 'Save'
      break
    case 'feedback':
      icon = <Flag variant="Bold" size={16} />
      text = 'Feedback'
      break
  }

  return (
    <div className={styles.button}>
      {actionType !== 'feedback' && icon}
      <span className={styles.buttonText}>{text}</span>
      {actionType === 'feedback' && icon}
    </div>
  )
}

interface ConversationPreviewProps {
  // conversation: ChatHistoryItem
  // onClick: () => void
}

const CONVERSATION_EXAMPLE = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 
Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`

const ConversationPreview = ({}: ConversationPreviewProps) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <span className={styles.header}>Active Transcription</span>
        <div className={styles.conversation}>{CONVERSATION_EXAMPLE}</div>
        <div className={styles.actionRow}>
          <div className={styles.buttonsContainer}>
            <ActionButton actionType="copy" />
            <ActionButton actionType="share" />
            <ActionButton actionType="save" />
          </div>
          <div className={styles.feedbackContainer}>
            <ActionButton actionType="feedback" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConversationPreview
