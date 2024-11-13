import { useStore } from '@/providers/store-provider'
import { useShallow } from 'zustand/react/shallow'
import styles from './conversations-dropdown.module.scss'
import Tooltip from '@/components/Tooltip/Tooltip'
import { MAX_NUMBER_OF_ATTACHMENTS } from '@/stores/chat-attachments'
import { useConversations } from '@/context/ConversationContext'
import AnimatedVoiceSquare from '@/components/Conversations/AnimatedVoiceSquare'
import ConversationToggle from './conversations-toggle'
import { ConversationAttachments } from './conversations-attachments'
import { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export const ConversationsDropdown = () => {
  const { isAudioTranscripEnabled, micActivity } = useConversations()
  const { attachments } = useStore(
    useShallow((state) => ({
      attachments: state.attachments,
      addAttachment: state.addAttachment,
      setFileInputRef: state.setFileInputRef,
    })),
  )
  const [isOpen, setIsOpen] = useState(false)

  const isDisabled = attachments.length >= MAX_NUMBER_OF_ATTACHMENTS

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <Tooltip
        tooltip={isDisabled ? 'Max number of attahments added' : isOpen ? '' : 'Attach a conversation'}
        position={'top'}
      >
        <PopoverTrigger disabled={isDisabled} className={`${styles.button} ${isDisabled ? styles.disabledButton : ''}`}>
          {isAudioTranscripEnabled ? (
            <AnimatedVoiceSquare
              width={24}
              height={24}
              backgroundColor="transparent"
              lineColor="rgba(76, 237, 160, 1.0)"
              shouldAnimate={micActivity > 0}
              transitionDuration={2500}
            />
          ) : (
            <AnimatedVoiceSquare
              width={24}
              height={24}
              backgroundColor="transparent"
              lineColor="#6E6E6E"
              shouldAnimate={false}
              transitionDuration={0}
            />
          )}
        </PopoverTrigger>
      </Tooltip>
      <PopoverContent sideOffset={18} align="end" alignOffset={-10} className="w-64 space-y-2 p-2 pt-3">
        <ConversationToggle />
        <ConversationAttachments />
      </PopoverContent>
    </Popover>
  )
}
