'use client'

import * as React from 'react'
import { TopBarProps } from '@/types'
import styles from './top-bar.module.scss'
import { AddCircle, ArrowDown2, Clock, MessageText } from 'iconsax-react'
import CircleButton from '@/components/CircleButton/CircleButton'
import Tooltip from '@/components/Tooltip'
import { useStore } from '@/providers/store-provider'
import { useRouter } from 'next/navigation'
import Button from '@/components/Button/Button'
import { HighlightIcon } from '@/icons/icons'
import variables from '@/variables.module.scss'
import { getPromptAppType } from '@/lib/promptapps'
import { useShallow } from 'zustand/react/shallow'
import { trackEvent } from '@/utils/amplitude'

const TopBar: React.FC<TopBarProps> = ({ showHistory, setShowHistory }) => {
  const router = useRouter()

  const { startNewConversation, promptName, openModal, messages, promptApp, promptUserId, clearPrompt } = useStore(
    useShallow((state) => ({
      startNewConversation: state.startNewConversation,
      promptName: state.promptName,
      openModal: state.openModal,
      messages: state.messages,
      promptApp: state.promptApp,
      promptUserId: state.promptUserId,
      clearPrompt: state.clearPrompt,
    })),
  )

  const promptAppName = useStore((state) => state.promptAppName)

  const onNewChatClick = () => {
    startNewConversation()

    // clearPrompt()

    router.push('/')
    trackEvent('HL Chat New Conversation Started', {})
  }

  const onShowHistoryClick = () => {
    setShowHistory(!showHistory)
    trackEvent('HL Chat History Toggled', { newState: !showHistory })
    router.push('/')
  }

  const onSwitchChatAppClick = () => {
    openModal('prompts-modal')
    trackEvent('HL Chat Switch App Modal Opened', {})
  }

  const promptType = promptApp ? getPromptAppType(promptUserId, promptApp) : undefined

  return (
    <div className={styles.topBar}>
      <Tooltip
        tooltip="Show chats"
        position="right"
        wrapperStyle={showHistory || !setShowHistory ? { visibility: 'hidden' } : undefined}
      >
        <Button size={'medium'} variant={'ghost-neutral'} onClick={onShowHistoryClick}>
          <Clock size={20} variant={'Bold'} />
          History
        </Button>
      </Tooltip>

      {(promptName || !!messages.length) && (
        <div className={styles.middle}>
          <Tooltip tooltip="Switch chat app" position="bottom">
            <CircleButton
              fitContents={true}
              className={`${styles.promptSwitch} ${promptType ? styles[!promptName || !messages.length ? 'default' : promptType] : ''}`}
              onClick={onSwitchChatAppClick}
            >
              {promptName ? (
                <MessageText variant={'Bold'} size={24} />
              ) : (
                <HighlightIcon size={20} color={variables.light40} />
              )}
              {promptName ?? 'Highlight'}
              <ArrowDown2 size={20} variant={'Bold'} />
            </CircleButton>
          </Tooltip>
        </div>
      )}

      {(promptName || messages.length > 0) && (
        <div className="flex gap-1">
          <Tooltip tooltip="Start new chat" position="left">
            <Button size={'medium'} variant={'ghost-neutral'} onClick={onNewChatClick}>
              New
              <AddCircle variant={'Bold'} size={20} />
            </Button>
          </Tooltip>
        </div>
      )}
    </div>
  )
}

export default TopBar
