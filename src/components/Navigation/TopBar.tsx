'use client'

import * as React from 'react'
import { ChatHistoryItem, TopBarProps } from '@/types'
import { Add, Clock } from 'iconsax-react'
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
import { trackEvent } from '@/utils/amplitude'

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
  } = useStore(
    useShallow((state) => ({
      startNewConversation: state.startNewConversation,
      promptName: state.promptName,
      openModal: state.openModal,
      promptApp: state.promptApp,
      promptUserId: state.promptUserId,
      clearPrompt: state.clearPrompt,
      conversationId: state.conversationId,
      setConversationId: state.setConversationId,
      openConversations: state.openConversations,
      setOpenConversations: state.setOpenConversations,
      removeOpenConversation: state.removeOpenConversation,
    })),
  )

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

  useOpenConverationsPersistence()

  // const promptType = promptApp ? getPromptAppType(promptUserId, promptApp) : undefined

  return (
    <div className={styles.topBar}>
      <div className={'flex max-w-full items-center gap-1'}>
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
        <DragDropContext onDragEnd={onDragTabEnd}>
          <Droppable droppableId="droppable" direction={'horizontal'}>
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`${styles.tabsContainer} ${showHistory ? styles.offset : ''}`}
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
        {
          // (promptName || !!messages.length) &&
          <Tooltip tooltip="Start new chat" position="bottom">
            <CircleButton onClick={onNewChatClick}>
              <Add variant={'Linear'} size={20} />
            </CircleButton>
          </Tooltip>
        }
      </div>

      {/*{*/}
      {/*  (promptName || !!messages.length) &&*/}
      {/*  <div className={styles.middle}>*/}
      {/*    <Tooltip tooltip="Switch chat app" position="bottom">*/}
      {/*      <CircleButton*/}
      {/*        fitContents={true}*/}
      {/*        className={`${styles.promptSwitch} ${promptType ? styles[(!promptName || !messages.length) ? 'default' : promptType] : ''}`}*/}
      {/*        onClick={() => openModal('prompts-modal')}*/}
      {/*      >*/}
      {/*        {*/}
      {/*          promptName*/}
      {/*            ? <MessageText variant={"Bold"} size={24}/>*/}
      {/*            : <HighlightIcon size={20} color={variables.light40}/>*/}
      {/*        }*/}
      {/*        {promptName ?? 'Highlight'}*/}
      {/*        <ArrowDown2 size={20} variant={'Bold'}/>*/}
      {/*      </CircleButton>*/}
      {/*    </Tooltip>*/}
      {/*  </div>*/}
      {/*}*/}

      {/*{*/}
      {/*  (promptName || messages.length > 0) &&*/}
      {/*  <div className="flex gap-1">*/}
      {/*    <Tooltip tooltip="Start new chat" position="left">*/}
      {/*      <Button size={'medium'} variant={'ghost-neutral'} onClick={onNewChatClick}>*/}
      {/*        New*/}
      {/*        <AddCircle variant={"Bold"} size={20} />*/}
      {/*      </Button>*/}
      {/*    </Tooltip>*/}
      {/*  </div>*/}
      {/*}*/}
    </div>
  )
}

export default TopBar
