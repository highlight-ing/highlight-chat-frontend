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
import useHandleConversationLoad from '@/hooks/useHandleConversationLoad'
import MessagesPlaceholder from '@/components/Messages/MessagesPlaceholder'

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
            if (file.type.startsWith('image/')) {
              console.log('Pasted image')
              console.log('Image data URL:', URL.createObjectURL(file))
              addAttachment({
                type: 'image',
                value: URL.createObjectURL(file),
                file: file,
              })
            } else if (file.type === 'application/pdf') {
              console.log('Pasted PDF')
              addAttachment({
                type: 'pdf',
                value: file,
              })
            }
          }
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
  const { messages, inputIsDisabled, promptName, isConversationLoading } = useStore(
    useShallow((state) => ({
      messages: state.messages,
      inputIsDisabled: state.inputIsDisabled,
      promptName: state.promptName,
      isConversationLoading: state.isConversationLoading,
    })),
  )

  const [showHistory, setShowHistory] = useState(false)

  const isChatting = useMemo(() => {
    return inputIsDisabled || messages.length > 0
  }, [inputIsDisabled, messages])

  // HOOKS
  useHandleClipboardPaste()
  useHandleConversationLoad()

  return (
    <div className={styles.page}>
      <History showHistory={showHistory} setShowHistory={setShowHistory} />
      <TopBar showHistory={showHistory} setShowHistory={setShowHistory} />
      <div className={`${styles.contents} ${showHistory ? styles.partial : styles.full}`}>
        <ChatHeader isShowing={!!promptName && messages.length === 0} />
        {(isChatting || (isConversationLoading && messages.length > 0)) && <Messages />}
        {isConversationLoading && messages.length === 0 && <MessagesPlaceholder />}
        {(isChatting || promptName) && <Input sticky={true} />}
        <ChatHome isShowing={!isChatting && !promptName && !isConversationLoading} />
      </div>
    </div>
  )
}

export default HighlightChat
