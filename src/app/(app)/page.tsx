'use client'

import React from 'react'
import styles from '@/main.module.scss'
import { useShallow } from 'zustand/react/shallow'

import { useCurrentChatMessages } from '@/hooks/useCurrentChatMessages'
import { useSidebar } from '@/components/ui/sidebar'
import Button from '@/components/Button/Button'
import { Input } from '@/components/Input/Input'
import Messages from '@/components/Messages/Messages'
import MessagesPlaceholder from '@/components/Messages/MessagesPlaceholder'
import { useStore } from '@/components/providers/store-provider'

import { AppSidebar } from '@/features/app-sidebar/app-sidebar'
import { ConversationsFeed } from '@/features/conversations/conversations-feed'
import { ChatHeader } from '@/features/highlight-chat/components/chat-header/chat-header'
import { ChatHome } from '@/features/highlight-chat/components/chat-home'
import { IntercomChat } from '@/features/highlight-chat/components/intercom-chat'
import { useClipboardPaste } from '@/features/highlight-chat/hooks/use-clipboard-paste'
import { useConversationLoad } from '@/features/highlight-chat/hooks/use-conversation-load'
import { useOnAppOpen } from '@/features/highlight-chat/hooks/use-on-app-open'
import { useOnExternalMessage } from '@/features/highlight-chat/hooks/use-on-external-message'
import { useOnPromptChange } from '@/features/highlight-chat/hooks/use-on-prompt-change'
import { useOnPromptLoad } from '@/features/highlight-chat/hooks/use-on-prompt-load'
import { NavigationTopBar } from '@/features/nav-header/top-bar/top-bar'

export default function Home() {
  const { inputIsDisabled, promptApp, isConversationLoading } = useStore(
    useShallow((state) => ({
      inputIsDisabled: state.inputIsDisabled,
      promptApp: state.promptApp,
      isConversationLoading: state.isConversationLoading,
    })),
  )
  const messages = useCurrentChatMessages()
  const { showAttachments, setShowAttachments } = useSidebar()

  const isChatting = React.useMemo(() => {
    return inputIsDisabled || messages.length > 0
  }, [inputIsDisabled, messages])

  useClipboardPaste()
  useConversationLoad()
  useOnAppOpen()
  useOnPromptChange()
  useOnPromptLoad()
  useOnExternalMessage()

  return (
    <>
      <AppSidebar />
      <div className={styles.page}>
        <NavigationTopBar />
        <div
          className={`${styles.contents} ${messages.length > 0 || inputIsDisabled || !!promptApp ? styles.justifyEnd : ''}`}
        >
          <ChatHeader isShowing={!isConversationLoading && !!promptApp && messages.length === 0} />
          {(isChatting || (isConversationLoading && messages.length > 0)) && <Messages />}
          {isConversationLoading && messages.length === 0 && !inputIsDisabled && <MessagesPlaceholder />}
          <ChatHome isShowing={!isChatting && !promptApp && !isConversationLoading} />
          {/* <ConversationsFeed /> */}
          <Button
            variant="primary"
            size="medium"
            onClick={() => setShowAttachments(!showAttachments)}
            style={{ zIndex: 900 }}
          >
            TOGGLE
          </Button>
          {(isChatting || promptApp) && <Input isActiveChat={true} />}
          <IntercomChat />
        </div>
      </div>
    </>
  )
}
