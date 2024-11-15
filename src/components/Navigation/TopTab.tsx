import * as React from 'react'
import { CSSProperties, useEffect, useMemo, useRef, useState } from 'react'
import { ChatHistoryItem } from '@/types'
import { trackEvent } from '@/utils/amplitude'
import variables from '@/variables.module.scss'
import { MessageText } from 'iconsax-react'
import { useShallow } from 'zustand/react/shallow'

import { usePromptApp } from '@/hooks/usePromptApp'
import CircleButton from '@/components/CircleButton/CircleButton'
import ContextMenu, { MenuItemType } from '@/components/ContextMenu/ContextMenu'
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner'
import styles from '@/components/Navigation/top-bar.module.scss'
import PromptAppIcon from '@/components/PromptAppIcon/PromptAppIcon'
import { useStore } from '@/components/providers/store-provider'
import Tooltip from '@/components/Tooltip/Tooltip'
import TypedText from '@/components/TypedText/TypedText'

interface TopTabProps {
  isActive?: boolean
  isDragging?: boolean
  conversation: ChatHistoryItem
  onOpen: (conversation: ChatHistoryItem) => void
  onClose: (conversation: ChatHistoryItem) => void
  style?: CSSProperties
}
const TopTab = React.forwardRef<HTMLDivElement, TopTabProps>(
  ({ isActive, isDragging, conversation, onOpen, onClose, ...props }, ref) => {
    const filteredTitle =
      conversation.title.charAt(0) === '"' && conversation.title.charAt(conversation.title.length - 1) === '"'
        ? conversation.title.substring(1, conversation.title.length - 1)
        : conversation.title
    const initialTitleRef = useRef(filteredTitle)
    const [title, setTitle] = useState(filteredTitle)
    const [isAnimating, setIsAnimating] = useState(true)

    const openModal = useStore((state) => state.openModal)
    const isConversationLoading = useStore((state) => state.isConversationLoading)
    const conversationId = useStore((state) => state.conversationId)
    const openConversations = useStore((state) => state.openConversations)
    const openConversationMessages = useStore((state) => state.conversationMessages)
    const setConversationId = useStore((state) => state.setConversationId)
    const setOpenConversations = useStore((state) => state.setOpenConversations)
    const clearConversationMessages = useStore((state) => state.clearConversationMessages)
    const clearAllConversationMessages = useStore((state) => state.clearAllConversationMessages)
    const clearAllOtherConversationMessages = useStore((state) => state.clearAllOtherConversationMessages)
    const startNewConversation = useStore((state) => state.startNewConversation)

    const conversationPrompt = usePromptApp(conversation.app_id)

    const menuOptions = useMemo<MenuItemType[]>(() => {
      return [
        ...(conversationId !== conversation.id
          ? [
              {
                label: 'Open',
                onClick: () => onOpen(conversation),
              },
            ]
          : []),
        ...(openConversationMessages[conversation.id]?.length > 0
          ? [
              {
                label: 'Reload',
                onClick: () => {
                  clearConversationMessages(conversation.id)
                  trackEvent('HL Chat Tab', { action: 'Reload' })
                },
              },
            ]
          : []),
        {
          divider: true,
        },
        {
          label: 'Close',
          onClick: () => onClose(conversation),
        },
        ...(openConversations.length > 1
          ? [
              {
                label: 'Close all others',
                onClick: () => {
                  if (conversationId !== conversation.id) {
                    setConversationId(conversation.id)
                  }
                  setOpenConversations([conversation])
                  clearAllOtherConversationMessages(conversation.id)
                  trackEvent('HL Chat Tab', { action: 'Close all others' })
                },
              },
              {
                label: 'Close all',
                onClick: () => {
                  setOpenConversations([])
                  clearAllConversationMessages()
                  if (conversationId) {
                    startNewConversation()
                  }
                  trackEvent('HL Chat Tab', { action: 'Close all' })
                },
              },
            ]
          : []),
        {
          divider: true,
        },
        {
          label: <span className={'text-red-400'}>Delete</span>,
          onClick: () => {
            openModal('delete-chat', conversation)
            trackEvent('HL Chat Delete Initiated', {
              chatId: conversation.id,
              source: 'history',
            })
          },
        },
      ]
    }, [openConversations, conversation, conversationId, openConversationMessages])

    useEffect(() => {
      const filteredTitle =
        conversation.title.charAt(0) === '"' && conversation.title.charAt(conversation.title.length - 1) === '"'
          ? conversation.title.substring(1, conversation.title.length - 1)
          : conversation.title
      if (filteredTitle !== title) {
        setTitle(filteredTitle)
      }
    }, [conversation.title, title])

    const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.button === 1) {
        event.preventDefault()
        onClose(conversation)
      }
    }

    return (
      <div
        ref={ref}
        {...props}
        className={`${styles.tabContainer} ${isConversationLoading && isActive ? styles.loading : ''}`}
      >
        <ContextMenu
          items={menuOptions}
          position={'bottom'}
          triggerId={`tab-${conversation.id}`}
          wrapperStyle={{
            position: 'relative',
            width: '100%',
          }}
        >
          {/* @ts-ignore */}
          {({ isOpen }) => (
            <Tooltip position={'bottom'} tooltip={isOpen ? undefined : title} offset={8}>
              <div
                id={`tab-${conversation.id}`}
                className={`${styles.tab} ${isActive ? styles.active : ''} ${isAnimating && !isDragging ? styles.isAnimating : ''}`}
                onClick={() => onOpen(conversation)}
                onMouseDown={handleMouseDown}
                onAnimationEnd={() => setIsAnimating(false)}
              >
                {conversationPrompt && conversationPrompt.image && conversationPrompt.user_images?.file_extension ? (
                  <PromptAppIcon
                    width={17}
                    height={17}
                    imageId={conversationPrompt.image}
                    imageExtension={conversationPrompt.user_images.file_extension}
                  />
                ) : (
                  <MessageText variant={'Bold'} size={17} />
                )}
                {initialTitleRef.current === title ? (
                  <span
                    className={'max-w-full overflow-hidden overflow-ellipsis whitespace-nowrap'}
                    style={{ lineHeight: 2 }}
                  >
                    {title}
                  </span>
                ) : (
                  <TypedText
                    text={title}
                    className={'max-w-full overflow-hidden overflow-ellipsis whitespace-nowrap'}
                  />
                )}
              </div>
              <div className={styles.tabActions}>
                {isConversationLoading && isActive ? (
                  <LoadingSpinner color={variables.light60} size={'16px'} />
                ) : (
                  <CircleButton onClick={() => onClose(conversation)} size={'20px'} className={styles.tabClose}>
                    <TabCloseIcon size={20.5} />
                  </CircleButton>
                )}
              </div>
            </Tooltip>
          )}
        </ContextMenu>
      </div>
    )
  },
)

export default TopTab

const TabCloseIcon = ({ size }: { size: number }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="7" y="16" width="13" height="2.5" rx="1.25" transform="rotate(-45 7 16)" fill="white" />
      <rect
        width="13"
        height="2.5"
        rx="1.25"
        transform="matrix(-0.707107 -0.707107 -0.707107 0.707107 18 16)"
        fill="white"
      />
    </svg>
  )
}
