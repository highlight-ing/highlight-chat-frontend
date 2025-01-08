'use client'

import React from 'react'
import styles from '@/main.module.scss'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useShallow } from 'zustand/react/shallow'

import { cn } from '@/lib/utils'
import { showHistoryAtom } from '@/atoms/history'
import { isOnHomeAtom, showBackButtonAtom, showSidePanelAtom, sidePanelOpenAtom } from '@/atoms/side-panel'
import { useCurrentChatMessages } from '@/hooks/useCurrentChatMessages'
import { Input } from '@/components/Input/Input'
import Messages from '@/components/Messages/Messages'
import MessagesPlaceholder from '@/components/Messages/MessagesPlaceholder'
import { useStore } from '@/components/providers/store-provider'

import { ChatHeader } from '@/features/chat/chat-header/chat-header'
import { HistorySidebar } from '@/features/history-sidebar/history-sidebar'
import { ChatHome } from '@/features/home/_components/home'
import { IntercomChat } from '@/features/home/_components/intercom-chat'
import { useClipboardPaste } from '@/features/home/_hooks/use-clipboard-paste'
import { useConversationLoad } from '@/features/home/_hooks/use-conversation-load'
import { useOnAppOpen } from '@/features/home/_hooks/use-on-app-open'
import { useOnExternalMessage } from '@/features/home/_hooks/use-on-external-message'
import { useOnPromptChange } from '@/features/home/_hooks/use-on-prompt-change'
import { useOnPromptLoad } from '@/features/home/_hooks/use-on-prompt-load'
import { NavigationTopBar } from '@/features/nav-header/top-bar/top-bar'
import { ShortcutsManager } from '@/features/shortcuts/_components/shortcuts-manager/shortcuts-manager'
import { HighlightSidePanel } from '@/features/side-panel/components/highlight-side-panel'

export default function Home() {
  const [showHistory, setShowHistory] = useAtom(showHistoryAtom)
  const setSidePanelOpen = useSetAtom(sidePanelOpenAtom)
  const showSidePanel = useAtomValue(showSidePanelAtom)
  const setShowBackButton = useSetAtom(showBackButtonAtom)
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
    setIsOnHome(!isChatting && !isConversationLoading)

    if (isChatting || isConversationLoading || promptApp) {
      setSidePanelOpen(false)
      setShowBackButton(false)
    }
  }, [isChatting, setShowBackButton, promptApp, setIsOnHome, setSidePanelOpen, isConversationLoading])

  useClipboardPaste()
  useConversationLoad()
  useOnAppOpen()
  useOnPromptChange()
  useOnPromptLoad()
  useOnExternalMessage()

  return (
    <div className={styles.page}>
      <HistorySidebar />
      <NavigationTopBar showHistory={showHistory} setShowHistory={setShowHistory} />
      {/* <div
        className={cn(
          `${styles.contents} ${showHistory ? styles.partial : styles.full} ${messages.length > 0 || inputIsDisabled || !!promptApp ? styles.justifyEnd : ''}`,
          'grid grid-cols-3 overflow-x-hidden transition duration-700',
          isChatting && styles.isChatting,
        )}
      >
        <div
          className={cn(
            'col-span-3 flex w-full flex-col items-center justify-end transition delay-100',
            styles.contents,
            showSidePanel && 'lg:col-span-2',
          )}
        > */}
      <div className="flex w-full overflow-x-hidden transition duration-700">
        <div className="flex w-full flex-col items-center justify-end transition delay-100">
          <ChatHeader isShowing={!isConversationLoading && !!promptApp && messages.length === 0} />
          {(isChatting || (isConversationLoading && messages.length > 0)) && <Messages />}
          {isConversationLoading && messages.length === 0 && !inputIsDisabled && <MessagesPlaceholder />}
          {/* {!isChatting && !promptApp && !isConversationLoading && <ChatHome />} */}
          {!isChatting && !promptApp && !isConversationLoading && <ShortcutsManager />}
          {(isChatting || promptApp) && <Input isActiveChat={true} />}
          <IntercomChat />
        </div>
        {isChatting && <HighlightSidePanel />} {/* Temporarily hide side panel */}
      </div>
    </div>
  )
}
