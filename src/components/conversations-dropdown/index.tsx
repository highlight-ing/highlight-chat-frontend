import { RefObject, useState } from 'react'
import { useStore } from '@/providers/store-provider'
import { useShallow } from 'zustand/react/shallow'
import styles from './index.module.scss'
import Tooltip from '@/components/Tooltip/Tooltip'
import { MAX_NUMBER_OF_ATTACHMENTS } from '@/stores/chat-attachments'
import { useConversations } from '@/context/ConversationContext'
import AnimatedVoiceSquare from '../Conversations/AnimatedVoiceSquare'
import ConversationToggle from './conversations-toggle'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ConversationAttachments } from './conversations-attachments'

interface ConversationsDropdownProps {
  inputRef: RefObject<HTMLTextAreaElement>
  isInputFocused: boolean
}

export const ConversationsDropdown = ({ inputRef, isInputFocused }: ConversationsDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const { isAudioTranscripEnabled } = useConversations()
  const { attachments } = useStore(
    useShallow((state) => ({
      attachments: state.attachments,
      addAttachment: state.addAttachment,
      setFileInputRef: state.setFileInputRef,
    })),
  )

  const isDisabled = attachments.length >= MAX_NUMBER_OF_ATTACHMENTS

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <Tooltip
        tooltip={isDisabled ? 'Max number of attahments added' : isOpen ? '' : 'Attach a conversation'}
        position={'top'}
      >
        <DropdownMenuTrigger className={`${styles.button} ${isDisabled ? styles.disabledButton : ''}`}>
          {isAudioTranscripEnabled ? (
            <div>
              <AnimatedVoiceSquare
                width={24}
                height={24}
                backgroundColor="transparent"
                lineColor="rgba(76, 237, 160, 1.0)"
                shouldAnimate={true}
                transitionDuration={2500}
              />
            </div>
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
        onCloseAutoFocus={(e) => {
          e.preventDefault()
          if (inputRef && isInputFocused) inputRef.current?.focus()
        }}
        sideOffset={18}
        align="end"
        alignOffset={-10}
        className="space-y-2"
      >
        <ConversationToggle />
        <ConversationAttachments onClose={() => setIsOpen(false)} />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
