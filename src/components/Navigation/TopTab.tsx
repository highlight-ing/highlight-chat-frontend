import styles from '@/components/Navigation/top-bar.module.scss'
import variables from '@/variables.module.scss'
import { MessageText } from 'iconsax-react'
import * as React from 'react'
import { ChatHistoryItem } from '@/types'
import { CSSProperties, useEffect, useMemo, useRef, useState } from 'react'
import TypedText from '@/components/TypedText/TypedText'
import CircleButton from '@/components/CircleButton/CircleButton'
import ContextMenu, { MenuItemType } from '@/components/ContextMenu/ContextMenu'
import { useStore } from '@/providers/store-provider'
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner'

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

    const isConversationLoading = useStore((state) => state.isConversationLoading)
    const conversationId = useStore((state) => state.conversationId)
    const openConversations = useStore((state) => state.openConversations)
    const openConversationMessages = useStore((state) => state.conversationMessages)
    const setConversationId = useStore((state) => state.setConversationId)
    const setOpenConversations = useStore((state) => state.setOpenConversations)
    const clearAllConversationMessages = useStore((state) => state.clearAllConversationMessages)
    const clearAllOtherConversationMessages = useStore((state) => state.clearAllOtherConversationMessages)
    const startNewConversation = useStore((state) => state.startNewConversation)

    const menuOptions = useMemo<MenuItemType[]>(() => {
      return [
        {
          label: 'Open',
          onClick: () => onOpen(conversation),
        },
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
                },
              },
            ]
          : []),
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
          <div
            id={`tab-${conversation.id}`}
            className={`${styles.tab} ${isActive ? styles.active : ''} ${isAnimating && !isDragging ? styles.isAnimating : ''}`}
            onClick={() => onOpen(conversation)}
            onAnimationEnd={() => setIsAnimating(false)}
          >
            <MessageText size={17} variant={'Bold'} />
            {initialTitleRef.current === title ? (
              <span
                className={'max-w-full overflow-hidden overflow-ellipsis whitespace-nowrap'}
                style={{ lineHeight: 2 }}
              >
                {conversation.title.charAt(0) === '"' &&
                conversation.title.charAt(conversation.title.length - 1) === '"'
                  ? conversation.title.substring(1, conversation.title.length - 1)
                  : conversation.title}
              </span>
            ) : (
              <TypedText
                text={
                  conversation.title.charAt(0) === '"' &&
                  conversation.title.charAt(conversation.title.length - 1) === '"'
                    ? conversation.title.substring(1, conversation.title.length - 1)
                    : conversation.title
                }
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
