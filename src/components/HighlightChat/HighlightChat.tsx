'use client'

import * as React from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Input } from '@/components/Input/Input'
import styles from '@/main.module.scss'
import TopBar from '@/components/Navigation/TopBar'
import Messages from '@/components/Messages/Messages'
import History from '@/components/History/History'
import { useStore } from '@/providers/store-provider'
import ChatHome from '@/components/ChatHome/ChatHome'
import ChatHeader from '@/components/ChatHeader/ChatHeader'
import { useShallow } from 'zustand/react/shallow'
import MessagesPlaceholder from '@/components/Messages/MessagesPlaceholder'
import { trackEvent } from '@/utils/amplitude'
import { useCurrentChatMessages } from '@/hooks/useCurrentChatMessages'
import useHandleConversationLoad from '@/hooks/useHandleConversationLoad'
import { useOnAppOpen } from '@/hooks/useOnAppOpen'
import { useOnPromptChange } from '@/hooks/useOnPromptChange'
import useOnExternalMessage from '@/hooks/useOnExternalMessage'
import { InputFocusProvider } from '@/context/InputFocusProvider'

/**
 * Hook that handles pasting from the clipboard.
 */
function useHandleClipboardPaste() {
  const addAttachment = useStore((state) => state.addAttachment)

  useEffect(() => {
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
            trackEvent('HL Chat Paste', { type: pasteType, fileType: file.type })
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
    })),
  )
  const messages = useCurrentChatMessages()

  const [showHistory, setShowHistory] = useState(false)

  const isChatting = useMemo(() => {
    return inputIsDisabled || messages.length > 0
  }, [inputIsDisabled, messages])

  // HOOKS
  useHandleClipboardPaste()
  useHandleConversationLoad()
  useOnAppOpen()
  useOnPromptChange()
  useOnExternalMessage()

  return (
    <div className={styles.page}>
      <History showHistory={showHistory} setShowHistory={setShowHistory} />
      <TopBar showHistory={showHistory} setShowHistory={setShowHistory} />
      <div
        className={`${styles.contents} ${showHistory ? styles.partial : styles.full} ${messages.length > 0 || inputIsDisabled || !!promptApp ? styles.justifyEnd : ''}`}
      >
        <ChatHeader isShowing={!isConversationLoading && !!promptApp && messages.length === 0} />
        {(isChatting || (isConversationLoading && messages.length > 0)) && <Messages />}
        {isConversationLoading && messages.length === 0 && !inputIsDisabled && <MessagesPlaceholder />}
        <ChatHome isShowing={!isChatting && !promptApp && !isConversationLoading} />
        {(isChatting || promptApp) && <Input isActiveChat={true} />}
      </div>
    </div>
  )
}

export default HighlightChat
