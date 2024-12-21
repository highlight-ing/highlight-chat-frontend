import * as React from 'react'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import globalStyles from '@/global.module.scss'
import { ChatHistoryItem } from '@/types'
import variables from '@/variables.module.scss'
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd'
import { Add, Clock, MessageText } from 'iconsax-react'
import { useShallow } from 'zustand/react/shallow'

import { trackEvent } from '@/utils/amplitude'
import { useHistoryByChatId } from '@/hooks/chat-history'
import { useOpenConverationsPersistence } from '@/hooks/useOpenConverationsPersistence'
import { usePromptApp } from '@/hooks/usePromptApp'
import { useTabHotkeys } from '@/hooks/useTabHotkeys'
import CircleButton from '@/components/CircleButton/CircleButton'
import ContextMenu, { MenuItemType } from '@/components/ContextMenu/ContextMenu'
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner'
import PromptAppIcon from '@/components/PromptAppIcon/PromptAppIcon'
import { useStore } from '@/components/providers/store-provider'
import Tooltip from '@/components/Tooltip/Tooltip'
import TypedText from '@/components/TypedText/TypedText'

import { ShareLink } from '../share-link'
import styles from './top-bar.module.scss'

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

type TopTabProps = {
  isActive?: boolean
  isDragging?: boolean
  conversation: ChatHistoryItem
  onOpen: (conversation: ChatHistoryItem) => void
  onClose: (conversation: ChatHistoryItem) => void
  style?: React.CSSProperties
}

export const NavigationTopBarTab = React.forwardRef<HTMLDivElement, TopTabProps>(
  ({ isActive, isDragging, conversation, onOpen, onClose, ...props }, ref) => {
    const filteredTitle =
      conversation.title.charAt(0) === '"' && conversation.title.charAt(conversation.title.length - 1) === '"'
        ? conversation.title.substring(1, conversation.title.length - 1)
        : conversation.title
    const initialTitleRef = React.useRef(filteredTitle)
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

    React.useEffect(() => {
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
NavigationTopBarTab.displayName = 'NavigationTopBarTab'

type TopBarProps = {
  showHistory: boolean
  setShowHistory: React.Dispatch<React.SetStateAction<boolean>>
}

export function NavigationTopBar({ showHistory, setShowHistory }: TopBarProps) {
  const router = useRouter()

  const {
    startNewConversation,
    promptApp,
    clearPrompt,
    conversationId,
    openConversations,
    setConversationId,
    setOpenConversations,
    removeOpenConversation,
  } = useStore(
    useShallow((state) => ({
      startNewConversation: state.startNewConversation,
      promptApp: state.promptApp,
      clearPrompt: state.clearPrompt,
      conversationId: state.conversationId,
      openConversations: state.openConversations,
      setConversationId: state.setConversationId,
      setOpenConversations: state.setOpenConversations,
      removeOpenConversation: state.removeOpenConversation,
      setShareId: state.setShareId,
    })),
  )
  const { data: currentConversation } = useHistoryByChatId(conversationId)

  const onNewChatClick = () => {
    startNewConversation()

    clearPrompt()

    router.push('/')
    trackEvent('HL Chat New Conversation Started', {})
  }

  const onShowHistoryClick = () => {
    setShowHistory(!showHistory)
    trackEvent('HL Chat History Toggled', { newState: !showHistory })
    router.push('/')
  }

  const onSelectChat = async (chat: ChatHistoryItem) => {
    setConversationId(chat?.id)
    trackEvent('HL Chat Tab', { action: 'Select' })
  }

  const onDragTabEnd = (result: any) => {
    if (!result.destination) {
      return
    }
    const updated = openConversations.slice()
    const [removed] = updated.splice(result.source.index, 1)
    updated.splice(result.destination.index, 0, removed)
    setOpenConversations(updated)
  }

  const onCloseTab = (conversation: ChatHistoryItem) => {
    removeOpenConversation(conversation.id)
    startNewConversation()
    clearPrompt()
    trackEvent('HL Chat Tab', { action: 'Close' })
  }

  useOpenConverationsPersistence()
  useTabHotkeys()

  return (
    <div className={styles.topBar}>
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-1">
          <Tooltip
            tooltip="View chat history"
            position="bottom"
            wrapperStyle={
              showHistory || !setShowHistory
                ? {
                    visibility: 'hidden',
                    paddingInlineStart: `calc(${variables.chatHistoryWidth} - 36px)`,
                    transition: 'padding 250ms ease',
                  }
                : { transition: 'padding 250ms ease' }
            }
          >
            <CircleButton onClick={onShowHistoryClick}>
              <Clock size={20} variant={'Bold'} />
            </CircleButton>
          </Tooltip>
        </div>

        <div className="flex flex-grow items-center overflow-hidden">
          <DragDropContext onDragEnd={onDragTabEnd}>
            <Droppable droppableId="droppable" direction={'horizontal'}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`${styles.tabsContainer} flex items-center`}
                >
                  {openConversations.map((conversation, index) => {
                    return (
                      <Draggable key={conversation.id} draggableId={conversation.id} index={index}>
                        {(provided, snapshot) => (
                          <NavigationTopBarTab
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            conversation={conversation}
                            onOpen={(_) => onSelectChat(conversation)}
                            onClose={(_) => onCloseTab(conversation)}
                            isActive={conversation.id === conversationId}
                            isDragging={snapshot.isDragging}
                            style={{
                              ...provided.draggableProps.style,
                              transition: snapshot.isDropAnimating
                                ? 'all 200ms ease-out'
                                : provided.draggableProps.style?.transition,
                              cursor: 'pointer',
                            }}
                          />
                        )}
                      </Draggable>
                    )
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          <Tooltip tooltip="Start new chat" position="bottom">
            <CircleButton onClick={onNewChatClick}>
              <Add variant={'Linear'} size={20} />
            </CircleButton>
          </Tooltip>
        </div>
      </div>

      {conversationId && (
        <div className={`${styles.topHeader} ${showHistory ? styles.offset : ''}`}>
          <div className={'flex gap-3'}>
            {promptApp ? (
              <>
                {promptApp.image && promptApp.user_images?.file_extension ? (
                  <PromptAppIcon
                    width={36}
                    height={36}
                    imageId={promptApp.image}
                    imageExtension={promptApp.user_images.file_extension}
                  />
                ) : (
                  <div
                    className={`${globalStyles.promptIcon} ${globalStyles.self}`}
                    style={{ '--size': '36px' } as React.CSSProperties}
                  >
                    <MessageText variant={'Bold'} size={17} />
                  </div>
                )}
              </>
            ) : (
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M6 10.4625C6 9.07484 7.11929 7.94995 8.5 7.94995C9.88071 7.94995 11 9.07484 11 10.4625V25.5374C11 26.9251 9.88071 28.0499 8.5 28.0499C7.11929 28.0499 6 26.9251 6 25.5374V10.4625Z"
                  fill="white"
                />
                <path
                  d="M25 10.4625C25 9.07484 26.1193 7.94995 27.5 7.94995C28.8807 7.94995 30 9.07484 30 10.4625V25.5374C30 26.9251 28.8807 28.0499 27.5 28.0499C26.1193 28.0499 25 26.9251 25 25.5374V10.4625Z"
                  fill="white"
                />
                <path
                  d="M24 17.9999C24 21.3302 21.3137 24.0299 18 24.0299C14.6863 24.0299 12 21.3302 12 17.9999C12 14.6697 14.6863 11.97 18 11.97C21.3137 11.97 24 14.6697 24 17.9999Z"
                  fill="white"
                />
              </svg>
            )}
            <div className={styles.topHeaderLeft}>
              {promptApp ? promptApp.name : 'Highlight'}
              {!promptApp &&
                currentConversation?.shared_conversations &&
                currentConversation.shared_conversations.length > 0 && (
                  <span>{currentConversation.shared_conversations[0].title}</span>
                )}
            </div>
          </div>
          {conversationId && <ShareLink conversation={currentConversation || null} />}
        </div>
      )}
    </div>
  )
}
