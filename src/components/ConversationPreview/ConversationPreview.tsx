import { Copy, Flag, SaveAdd, Send2 } from 'iconsax-react'
import styles from './conversationpreview.module.scss'
import { useStore } from '@/providers/store-provider'
import { useShallow } from 'zustand/react/shallow'
import { CloseIcon } from '@/icons/icons'

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

const ConversationPreview = () => {
  const { selectedConversation, setSelectedConversation } = useStore(
    useShallow((state) => ({
      selectedConversation: state.selectedConversation,
      setSelectedConversation: state.setSelectedConversation,
    })),
  )

  const onClose = () => setSelectedConversation(undefined)

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <span className={styles.header}>Active Transcription</span>
        <div className={styles.conversation}>{selectedConversation}</div>
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
        <div className={styles.closeButton} onClick={onClose}>
          <CloseIcon size={24} />
        </div>
      </div>
    </div>
  )
}

export default ConversationPreview
