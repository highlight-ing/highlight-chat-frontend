import { useState } from 'react'
import { VoiceSquare } from 'iconsax-react'
import ContextMenu, { MenuItemType } from '../ContextMenu/ContextMenu'
import { useStore } from '@/providers/store-provider'
import { useShallow } from 'zustand/react/shallow'
import styles from './attachment-menus.module.scss'
import Tooltip from '@/components/Tooltip/Tooltip'
import { ConversationAttachmentPicker } from '../ConversationAttachmentPicker.tsx/ConversationAttachmentPicker'
import { useCurrentChatMessages } from '@/hooks/useCurrentChatMessages'
import { MAX_NUMBER_OF_ATTACHMENTS } from '@/stores/chat-attachments'
import { useConversations } from '@/context/ConversationContext'
import AnimatedVoiceSquare from '../Conversations/AnimatedVoiceSquare'
import ConversationToggle from './ConversationToggle'

export const ConversationsMenu = () => {
  const [conversationPickerVisible, setConversationPickerVisible] = useState(false)
  const messages = useCurrentChatMessages()
  const { isAudioTranscripEnabled } = useConversations()

  const { attachments } = useStore(
    useShallow((state) => ({
      attachments: state.attachments,
      addAttachment: state.addAttachment,
      setFileInputRef: state.setFileInputRef,
    })),
  )

  const menuItems = [
    {
      label: (
        <div className={styles.menuItem}>
          <div className={styles.audioMenuItem}>
            <VoiceSquare variant="Bold" size={20} />
          </div>
          Conversation
        </div>
      ),
      onClick: () => {
        setConversationPickerVisible(true)
      },
    },
    {
      label: <ConversationToggle />,
      onClick: () => null,
    },
  ].filter(Boolean) as MenuItemType[]

  const openMenu = () => {
    const element = document.getElementById('conversations-menu')
    if (element) {
      setTimeout(() => {
        element.click()
      }, 50)
    }
  }

  const isDisabled = attachments.length >= MAX_NUMBER_OF_ATTACHMENTS

  return (
    <>
      <ContextMenu
        position={messages.length > 0 ? 'top' : 'bottom'}
        triggerId="conversations-menu"
        leftClick={true}
        items={menuItems}
        menuStyle={{ background: '#191919', borderColor: '#222222' }}
        disabled={isDisabled}
      >
        {
          // @ts-ignore
          ({ isOpen }) => (
            <Tooltip
              tooltip={
                isDisabled
                  ? 'Max number of attahments added'
                  : isOpen || conversationPickerVisible
                    ? ''
                    : 'Attach a conversation'
              }
              position={'top'}
            >
              <button
                type="button"
                className={`${styles.button} ${isDisabled ? styles.disabledButton : ''}`}
                id="conversations-menu"
              >
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
                    lineColor="rgba(76, 237, 160, 1.0)"
                    shouldAnimate={false}
                    transitionDuration={0}
                  />
                )}

                <ConversationAttachmentPicker
                  isVisible={conversationPickerVisible}
                  onClose={() => setConversationPickerVisible(false)}
                  onBack={() => {
                    setConversationPickerVisible(false)
                    openMenu()
                  }}
                />
              </button>
            </Tooltip>
          )
        }
      </ContextMenu>
    </>
  )
}
