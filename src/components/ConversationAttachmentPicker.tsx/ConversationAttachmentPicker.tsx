import { useConversations } from '@/context/ConversationContext'
import { AttachmentPicker } from '../AttachmentPicker/AttachmentPicker'
import { getTimeAgo, getWordCount } from '@/utils/string'
import { getConversationDisplayTitle } from '@/utils/conversations'
import styles from './conversation-attachment-picker.module.scss'
import { VoiceSquare } from 'iconsax-react'

interface ConversationAttachmentPickerProps {
  onClose: () => void
  onBack: () => void
}

const MAX_NUM_CONVERSATION = 10

export const ConversationAttachmentPicker = ({ onClose, onBack }: ConversationAttachmentPickerProps) => {
  const { conversations, elapsedTime, currentConversation } = useConversations()

  const currentConversationTitle = 'Current Conversation'
  const currentConversationTimestamp = new Date(Date.now() - elapsedTime * 1000)

  const currentConversationOptions = {
    imageComponent: (
      <div />
      // <IconContainer>
      //   <VoiceSquare size={20} variant="Bold" />
      // </IconContainer>
    ),
    title: currentConversationTitle,
    description: `Started ${getTimeAgo(currentConversationTimestamp)} | ${getWordCount(currentConversation)} Words`,
    onClick: () => {
      // const attachment: ConversationAttachment = {
      //   type: 'conversation',
      //   value: currentTranscript,
      //   timestamp: currentConversationTimestamp,
      //   title: currentConversationTitle,
      // }

      // if (attachmentType === 'primary') {
      //   updatePrimaryAttachment(attachment)
      // } else {
      //   addAttachment(attachment)
      // }

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
      description: `${getWordCount(conversation.transcript)} Words`,
      onClick: () => {
        // const attachment: ConversationAttachment = {
        //   type: 'conversation',
        //   value: conversation.transcript,
        //   timestamp: conversation.timestamp,
        //   title: getConversationDisplayTitle(conversation),
        // }

        // if (attachmentType === 'primary') {
        //   updatePrimaryAttachment(attachment)
        // } else {
        //   addAttachment(attachment)
        // }

        onClose()
      },
    }))

  const enableAudioTranscriptOption = {
    imageComponent: <div />,
    // <IconContainer>
    //   <Setting2 size={20} variant="Bold" />
    // </IconContainer>
    title: 'Enable Audio Transcript',
    description: 'Allow Highlight to transcribe your audio',
    onClick: () => {
      // setAudioTranscriptPermission('attach')
      onClose()
    },
  }

  // const noConversationsOption = {
  //   imageComponent: <Placeholder />,
  //   title: formatMessage({ id: 'attachment-dropdown-no-conversations', defaultMessage: 'No conversations yet' }),
  //   description: formatMessage({
  //     id: 'attachment-dropdown-no-conversations-description',
  //     defaultMessage: 'Transcribing...',
  //   }),
  //   onClick: onClose,
  // }

  // const attachmentOptions = !microphoneAccess
  //   ? [enableMicrophoneOption]
  //   : !canDetectAudio
  //     ? [enableAudioTranscriptOption, ...options]
  //     : currentTranscript.length > 0
  //       ? [currentConversationOptions, ...options]
  //       : options.length > 0
  //         ? options
  //         : [noConversationsOption]

  return (
    <AttachmentPicker
      header="Attach Conversation"
      onBack={onBack}
      onClose={onClose}
      isVisible={true}
      attachmentOptions={options}
    />
  )
}
