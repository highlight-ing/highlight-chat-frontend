import { useStore } from '@/providers/store-provider'
import { useShallow } from 'zustand/react/shallow'
import styles from './conversations-dropdown.module.scss'
import Tooltip from '@/components/Tooltip/Tooltip'
import { MAX_NUMBER_OF_ATTACHMENTS } from '@/stores/chat-attachments'
import { useConversations } from '@/context/ConversationContext'
import AnimatedVoiceSquare from '@/components/Conversations/AnimatedVoiceSquare'
import ConversationToggle from './conversations-toggle'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ConversationAttachments } from './conversations-attachments'
import { useContext, useEffect, useState } from 'react'
import { AttachmentDropdownsContext } from '../attachment-dropdowns'

interface ConversationsDropdownProps {
  onCloseAutoFocus: (e: Event) => void
}

export const ConversationsDropdown = ({ onCloseAutoFocus }: ConversationsDropdownProps) => {
  const { isAudioTranscripEnabled, micActivity } = useConversations()
  const { attachments } = useStore(
    useShallow((state) => ({
      attachments: state.attachments,
      addAttachment: state.addAttachment,
      setFileInputRef: state.setFileInputRef,
    })),
  )
  const { activeDropdown, setActiveDropdown } = useContext(AttachmentDropdownsContext)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownId = 'conversations'

  useEffect(() => {
    if (isOpen) setActiveDropdown(dropdownId)
  }, [isOpen])

  useEffect(() => {
    if (activeDropdown !== dropdownId) setIsOpen(false)
  }, [activeDropdown, setIsOpen])

  const isDisabled = attachments.length >= MAX_NUMBER_OF_ATTACHMENTS

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <Tooltip
        tooltip={isDisabled ? 'Max number of attahments added' : isOpen ? '' : 'Attach a conversation'}
        position={'top'}
      >
        <DropdownMenuTrigger
          disabled={isDisabled}
          className={`${styles.button} ${isDisabled ? styles.disabledButton : ''}`}
        >
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
        </DropdownMenuTrigger>
      </Tooltip>
      <DropdownMenuContent
        onCloseAutoFocus={onCloseAutoFocus}
        sideOffset={18}
        align="end"
        alignOffset={-10}
        className="w-64 space-y-2"
      >
        <ConversationToggle />
        <ConversationAttachments />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
