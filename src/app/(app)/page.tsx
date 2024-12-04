'use client'

import React from 'react'
import styles from '@/main.module.scss'
import { useAtom, useSetAtom } from 'jotai'
import { useShallow } from 'zustand/react/shallow'

import { cn } from '@/lib/utils'
import { isOnHomeAtom, transcriptOpenAtom } from '@/atoms/transcript-viewer'
import { useCurrentChatMessages } from '@/hooks/useCurrentChatMessages'
import { Input } from '@/components/Input/Input'
import Messages from '@/components/Messages/Messages'
import MessagesPlaceholder from '@/components/Messages/MessagesPlaceholder'
import { useStore } from '@/components/providers/store-provider'

import { ChatHeader } from '@/features/highlight-chat/components/chat-header/chat-header'
import { ChatHome } from '@/features/highlight-chat/components/chat-home'
import { IntercomChat } from '@/features/highlight-chat/components/intercom-chat'
import { useClipboardPaste } from '@/features/highlight-chat/hooks/use-clipboard-paste'
import { useConversationLoad } from '@/features/highlight-chat/hooks/use-conversation-load'
import { useOnAppOpen } from '@/features/highlight-chat/hooks/use-on-app-open'
import { useOnExternalMessage } from '@/features/highlight-chat/hooks/use-on-external-message'
import { useOnPromptChange } from '@/features/highlight-chat/hooks/use-on-prompt-change'
import { useOnPromptLoad } from '@/features/highlight-chat/hooks/use-on-prompt-load'
import { HistorySidebar } from '@/features/history-sidebar/history-sidebar'
import { AudioNotesFeed } from '@/features/home-feed/audio-notes-feed'
import { NavigationTopBar } from '@/features/nav-header/top-bar/top-bar'
import { TranscriptViewer } from '@/features/transcript-viewer/transcript-viewer'

export default function Home() {
  const [showHistory, setShowHistory] = React.useState(false)
  const [transcriptOpen, setTransactionOpen] = useAtom(transcriptOpenAtom)
  const setIsOnHome = useSetAtom(isOnHomeAtom)
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

  React.useEffect(() => {
    setIsOnHome(!isChatting)
    setTransactionOpen(false)
  }, [isChatting, setIsOnHome, setTransactionOpen])

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
        className={cn(
          `${styles.contents} ${showHistory ? styles.partial : styles.full} ${messages.length > 0 || inputIsDisabled || !!promptApp ? styles.justifyEnd : ''}`,
          'grid grid-cols-3 transition duration-700',
        )}
      >
        <TranscriptViewer />
        <div
          className={cn(
            'col-span-3 flex w-full flex-col items-center justify-end transition delay-100',
            styles.contents,
            transcriptOpen && 'col-span-2',
          )}
        >
          <ChatHeader isShowing={!isConversationLoading && !!promptApp && messages.length === 0} />
          {(isChatting || (isConversationLoading && messages.length > 0)) && <Messages />}
          {isConversationLoading && messages.length === 0 && !inputIsDisabled && <MessagesPlaceholder />}
          <ChatHome isShowing={!isChatting && !promptApp && !isConversationLoading} />
          {(isChatting || promptApp) && <Input isActiveChat={true} />}
          <AudioNotesFeed />
          <IntercomChat />
        </div>
      </div>
    </div>
  )
}
