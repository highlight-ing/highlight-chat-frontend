import { useConversations } from '@/context/ConversationContext'
import { AttachmentPicker } from '../AttachmentPicker/AttachmentPicker'
import { getTimeAgo, getWordCountFormatted } from '@/utils/string'
import { getConversationDisplayTitle, getConversationSubtitle, isDefaultTitle } from '@/utils/conversations'
import styles from './conversation-attachment-picker.module.scss'
import { Setting2, VoiceSquare } from 'iconsax-react'
import { useStore } from '@/providers/store-provider'
import { useShallow } from 'zustand/react/shallow'
import { useEffect } from 'react'
import { trackEvent } from '@/utils/amplitude'

interface ConversationAttachmentPickerProps {
  isVisible: boolean
  onClose: () => void
  onBack: () => void
}

const MAX_NUM_CONVERSATION = 20

export const ConversationAttachmentPicker = ({ onClose, onBack, isVisible }: ConversationAttachmentPickerProps) => {
  const { conversations, elapsedTime, currentConversation, isAudioTranscripEnabled, setIsAudioTranscriptEnabled } =
    useConversations()
  const currentConversationTitle = 'Current Conversation'
  const currentConversationTimestamp = new Date(Date.now() - elapsedTime * 1000)

  const { addAttachment } = useStore(
    useShallow((state) => ({
      addAttachment: state.addAttachment,
    })),
  )

  useEffect(() => {
    if (isVisible) {
      trackEvent('HL Chat Conversation Picker Opened', {})
    }
  }, [isVisible])

  const handleClose = () => {
    trackEvent('HL Chat Conversation Picker Closed', {})
    onClose()
  }

  const handleBack = () => {
    onClose()
    onBack()
  }

  const currentConversationOptions = {
    imageComponent: (
      <div className={styles.iconContainer}>
        <VoiceSquare size={20} variant="Bold" />
      </div>
    ),
    title: currentConversationTitle,
    description: `Started ${getTimeAgo(currentConversationTimestamp)} | ${getWordCountFormatted(currentConversation)} Words`,
    onClick: () => {
      addAttachment({ type: 'conversation', value: currentConversation })
      onClose()
    },
  }

  const options = conversations
    .filter((conversation) => conversation.transcript.length > 0)
    .slice(0, MAX_NUM_CONVERSATION)
    .map((conversation) => ({
      imageComponent: (
        <div className={styles.iconContainer}>
          <VoiceSquare size={20} variant="Bold" />
        </div>
      ),
      title: getConversationDisplayTitle(conversation),
      description: getConversationSubtitle(conversation),
      onClick: () => {
        addAttachment({
          type: 'conversation',
          value: conversation.transcript,
        })
        onClose()
      },
    }))

  const enableAudioTranscriptOption = {
    imageComponent: (
      <div className={styles.iconContainer}>
        <Setting2 size={20} variant="Bold" />
      </div>
    ),
    title: 'Enable Audio Transcript',
    description: 'Allow Highlight to transcribe your audio',
    onClick: () => {
      setIsAudioTranscriptEnabled(true)
      onClose()
    },
  }

  const noConversationsOption = {
    imageComponent: <div className={styles.placeholder} />,
    title: 'No conversations yet',
    description: 'Transcribing...',
    onClick: onClose,
  }

  const attachmentOptions = !isAudioTranscripEnabled
    ? [enableAudioTranscriptOption, ...options]
    : currentConversation.length > 0
      ? [currentConversationOptions, ...options]
      : options.length > 0
        ? options
        : [noConversationsOption]

  return (
    <AttachmentPicker
      header="Attach Conversation"
      onBack={handleBack}
      onClose={handleClose}
      isVisible={isVisible}
      attachmentOptions={attachmentOptions}
    />
  )
}
