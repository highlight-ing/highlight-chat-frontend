'use client'

import React from 'react'
import styles from '@/main.module.scss'
import { useShallow } from 'zustand/react/shallow'

import { useCurrentChatMessages } from '@/hooks/useCurrentChatMessages'
import { Input } from '@/components/Input/Input'
import Messages from '@/components/Messages/Messages'
import MessagesPlaceholder from '@/components/Messages/MessagesPlaceholder'
import { useStore } from '@/components/providers/store-provider'

import { ChatHeader } from '@/features/chat-header/chat-header'
import { ChatHome } from '@/features/chat-home/chat-home'
import { useClipboardPaste } from '@/features/highlight-chat/hooks/use-clipboard-paste'
import { useConversationLoad } from '@/features/highlight-chat/hooks/use-conversation-load'
import { useOnAppOpen } from '@/features/highlight-chat/hooks/use-on-app-open'
import { useOnExternalMessage } from '@/features/highlight-chat/hooks/use-on-external-message'
import { useOnPromptChange } from '@/features/highlight-chat/hooks/use-on-prompt-change'
import { useOnPromptLoad } from '@/features/highlight-chat/hooks/use-on-prompt-load'
import { HistorySidebar } from '@/features/history-sidebar/history-sidebar'
import { IntercomChat } from '@/features/intercom-chat/intercom-chat'
import { NavigationTopBar } from '@/features/nav-header/top-bar/top-bar'

export default function Home() {
  const [showHistory, setShowHistory] = React.useState(false)
  const { inputIsDisabled, promptApp, isConversationLoading } = useStore(
    useShallow((state) => ({
      inputIsDisabled: state.inputIsDisabled,
      promptApp: state.promptApp,
      isConversationLoading: state.isConversationLoading,
    })),
  )
  const messages = useCurrentChatMessages()

  const isChatting = React.useMemo(() => {
    return inputIsDisabled || messages.length > 0
  }, [inputIsDisabled, messages])

  // HOOKS
  useClipboardPaste()
  useConversationLoad()
  useOnAppOpen()
  useOnPromptChange()
  useOnPromptLoad()
  useOnExternalMessage()

  return (
    <div className={styles.page}>
      <HistorySidebar showHistory={showHistory} setShowHistory={setShowHistory} />
      <NavigationTopBar showHistory={showHistory} setShowHistory={setShowHistory} />
      <div
        className={`${styles.contents} ${showHistory ? styles.partial : styles.full} ${messages.length > 0 || inputIsDisabled || !!promptApp ? styles.justifyEnd : ''}`}
      >
        <ChatHeader isShowing={!isConversationLoading && !!promptApp && messages.length === 0} />
        {(isChatting || (isConversationLoading && messages.length > 0)) && <Messages />}
        {isConversationLoading && messages.length === 0 && !inputIsDisabled && <MessagesPlaceholder />}
        <ChatHome isShowing={!isChatting && !promptApp && !isConversationLoading} />
        {(isChatting || promptApp) && <Input isActiveChat={true} />}
        <IntercomChat />
      </div>
    </div>
  )
}
