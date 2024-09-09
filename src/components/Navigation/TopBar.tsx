'use client'

import * as React from 'react'
import { ChatHistoryItem, TopBarProps } from '@/types'
import { Add, Clock, ExportCurve, MessageText, Send2 } from 'iconsax-react'
import CircleButton from '@/components/CircleButton/CircleButton'
import Tooltip from '@/components/Tooltip/Tooltip'
import { useStore } from '@/providers/store-provider'
import { useRouter } from 'next/navigation'
import { useShallow } from 'zustand/react/shallow'
import TopTab from '@/components/Navigation/TopTab'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import styles from './top-bar.module.scss'
import variables from '@/variables.module.scss'
import { useOpenConverationsPersistence } from '@/hooks/useOpenConverationsPersistence'
import { useMemo, useState } from 'react'
import ShareModal from '@/components/ShareModal/ShareModal'
import { useShareConversation, useDeleteConversation } from '@/hooks/useShareConversation'
import { trackEvent } from '@/utils/amplitude'
import { useTabHotkeys } from '@/hooks/useTabHotkeys'
import Hotkey from '@/components/Hotkey/Hotkey'
import Button from '@/components/Button/Button'
import PromptAppIcon from '@/components/PromptAppIcon/PromptAppIcon'
import globalStyles from '@/global.module.scss'

const TopBar: React.FC<TopBarProps> = ({ showHistory, setShowHistory }) => {
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
    history,
    setShareId,
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
      history: state.history,
      setShareId: state.setShareId,
    })),
  )

  const [isShareModalVisible, setIsShareModalVisible] = useState(false)

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
    setConversationId(chat.id)
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
  }

  const onToggleShareModal = () => {
    setIsShareModalVisible(!isShareModalVisible)
  }

  const onCloseShareModal = () => {
    setIsShareModalVisible(false)
  }

  useOpenConverationsPersistence()
  useTabHotkeys()

  // Find the current conversation in history
  const currentConversation = useMemo(() => {
    return history.find((chat) => chat.id === conversationId)
  }, [conversationId, history])

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
                          <TopTab
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
                  <a
                    href={`https://chat.hl.ing/share/${currentConversation.shared_conversations[0].id}`}
                    target={'_blank'}
                  >
                    {currentConversation.shared_conversations[0].title}
                  </a>
                )}
              {promptApp ? (
                <a href={`https://chat.hl.ing/prompts/${promptApp.slug}`} target={'_blank'}>
                  chat.hl.ing/prompts/{promptApp.slug}
                </a>
              ) : currentConversation?.shared_conversations && currentConversation.shared_conversations.length > 0 ? (
                <a
                  href={`https://chat.hl.ing/share/${currentConversation.shared_conversations[0].id}`}
                  target={'_blank'}
                >
                  chat.hl.ing/share/{currentConversation.shared_conversations[0].id}
                </a>
              ) : (
                <a href={`https://chat.hl.ing`}>chat.hl.ing</a>
              )}
            </div>
          </div>
          {conversationId && (
            <div>
              <Button size={'small'} variant={'primary-outline'} onClick={onToggleShareModal}>
                Share
                <Send2 size={20} variant={'Bold'} />
              </Button>
            </div>
          )}
        </div>
      )}

      <ShareModal
        isVisible={isShareModalVisible}
        conversation={currentConversation || null}
        onClose={onCloseShareModal}
        setShareId={setShareId}
      />
    </div>
  )
}

export default TopBar
