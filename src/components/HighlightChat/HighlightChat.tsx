'use client'

import React from 'react'
import styles from '@/main.module.scss'
import { trackEvent } from '@/utils/amplitude'
import { useShallow } from 'zustand/react/shallow'

import { useCurrentChatMessages } from '@/hooks/useCurrentChatMessages'
import useHandleConversationLoad from '@/hooks/useHandleConversationLoad'
import { useOnAppOpen } from '@/hooks/useOnAppOpen'
import useOnExternalMessage from '@/hooks/useOnExternalMessage'
import { useOnPromptChange } from '@/hooks/useOnPromptChange'
import { useOnPromptLoad } from '@/hooks/useOnPromptLoad'
import ChatHeader from '@/components/ChatHeader/ChatHeader'
import { ChatHome } from '@/components/ChatHome/ChatHome'
import { Input } from '@/components/Input/Input'
import Messages from '@/components/Messages/Messages'
import MessagesPlaceholder from '@/components/Messages/MessagesPlaceholder'
import TopBar from '@/components/Navigation/TopBar'
import { useStore } from '@/components/providers/store-provider'

import { HistorySidebar } from '@/features/history-sidebar/history-sidebar'

import IntercomChat from '../intercom-chat'

/**
 * Hook that handles pasting from the clipboard.
 */
function useHandleClipboardPaste() {
  const addAttachment = useStore((state) => state.addAttachment)

  React.useEffect(() => {
    const onClipboardPaste = (ev: ClipboardEvent) => {
      const clipboardItems = ev.clipboardData?.items
      if (!clipboardItems?.length) {
        return
      }
      for (let i = 0; i < clipboardItems.length; i++) {
        const item = clipboardItems[i]

        if (item.kind === 'file') {
          const file = item.getAsFile()
          if (file) {
            let pasteType = 'unsupported'
            if (file.type.startsWith('image/')) {
              console.log('Pasted image')
              console.log('Image data URL:', URL.createObjectURL(file))
              addAttachment({
                type: 'image',
                value: URL.createObjectURL(file),
                file: file,
              })
              pasteType = 'image'
            } else if (file.type === 'application/pdf') {
              console.log('Pasted PDF')

              addAttachment({
                type: 'pdf',
                value: file,
              })
              pasteType = 'pdf'
            }
            trackEvent('HL Chat Paste', {
              type: pasteType,
              fileType: file.type,
            })
          }
        } else if (item.kind === 'string') {
          trackEvent('HL Chat Paste', { type: 'text' })
        }
      }
    }

    document.addEventListener('paste', onClipboardPaste)

    return () => {
      document.removeEventListener('paste', onClipboardPaste)
    }
  }, [])
}

const HighlightChat = () => {
  // STATE
  const { inputIsDisabled, promptApp, isConversationLoading } = useStore(
    useShallow((state) => ({
      inputIsDisabled: state.inputIsDisabled,
      promptApp: state.promptApp,
      isConversationLoading: state.isConversationLoading,
    }))
  )
  const messages = useCurrentChatMessages()

  const [showHistory, setShowHistory] = React.useState(false)

  const isChatting = React.useMemo(() => {
    return inputIsDisabled || messages.length > 0
  }, [inputIsDisabled, messages])

  // HOOKS
  useHandleClipboardPaste()
  useHandleConversationLoad()
  useOnAppOpen()
  useOnPromptChange()
  useOnExternalMessage()
  useOnPromptLoad()

  return (
    <div className={styles.page}>
      <HistorySidebar showHistory={showHistory} setShowHistory={setShowHistory} />
      <TopBar showHistory={showHistory} setShowHistory={setShowHistory} />
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

export default HighlightChat
