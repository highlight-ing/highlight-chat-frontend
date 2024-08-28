'use client'

import * as React from 'react'
import { ChatHistoryItem, TopBarProps } from '@/types'
import { Add, Clock, ExportCurve } from 'iconsax-react'
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
import { useState } from 'react'
import ShareModal from '@/components/ShareModal/ShareModal'
import { useShareConversation, useDeleteConversation } from '@/hooks/useShareConversation'
import { trackEvent } from '@/utils/amplitude'
import { useTabHotkeys } from '@/hooks/useTabHotkeys'
import Hotkey from '@/components/Hotkey/Hotkey'

const TopBar: React.FC<TopBarProps> = ({ showHistory, setShowHistory }) => {
  const router = useRouter()

  const {
    startNewConversation,
    // promptName,
    // openModal,
    // promptApp,
    // promptUserId,
    clearPrompt,
    conversationId,
    openConversations,
    setConversationId,
    setOpenConversations,
    removeOpenConversation,
    clearConversationMessages,
    history,
    setShareId,
  } = useStore(
    useShallow((state) => ({
      startNewConversation: state.startNewConversation,
      promptName: state.promptName,
      openModal: state.openModal,
      promptApp: state.promptApp,
      promptUserId: state.promptUserId,
      clearPrompt: state.clearPrompt,
      conversationId: state.conversationId,
      openConversations: state.openConversations,
      setConversationId: state.setConversationId,
      setOpenConversations: state.setOpenConversations,
      removeOpenConversation: state.removeOpenConversation,
      clearConversationMessages: state.clearConversationMessages,
      history: state.history,
      setShareId: state.setShareId,
    })),
  )

  const promptAppName = useStore((state) => state.promptAppName)
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
  const currentConversation = history.find((chat) => chat.id === conversationId)

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

        <div className="flex-grow overflow-hidden">
          <DragDropContext onDragEnd={onDragTabEnd}>
            <Droppable droppableId="droppable" direction={'horizontal'}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`${styles.tabsContainer} ${showHistory ? styles.offset : ''} flex items-center`}
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
                  <Tooltip tooltip="Start new chat" position="bottom">
                    <CircleButton onClick={onNewChatClick}>
                      <Add variant={'Linear'} size={20} />
                    </CircleButton>
                  </Tooltip>
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        <div className="flex items-center gap-2">
          {conversationId && (
            <div className={styles.tabContainer}>
              <div className={`${styles.tab} cursor-pointer`} onClick={onToggleShareModal}>
                <span className="flex max-w-full items-center gap-2 overflow-hidden overflow-ellipsis whitespace-nowrap">
                  <span>Share</span>
                  <ExportCurve size={20} variant={'Linear'} />
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

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
