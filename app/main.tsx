'use client'

import * as React from 'react'
import { useEffect, useCallback, useState } from 'react'
import { type HighlightContext } from '@highlight-ai/app-runtime'
import { debounce } from 'throttle-debounce'

import api from '@highlight-ai/app-runtime'
import { useInputContext } from './context/InputContext'
import { Input } from '@/app/components/Input/Input'
import { useHighlightContextContext } from './context/HighlightContext'
import { useSubmitQuery } from './hooks/useSubmitQuery'
import { useMessagesContext } from './context/MessagesContext'

import styles from './main.module.scss'
import TopBar from "@/app/components/Navigation/TopBar";
import Messages from "@/app/components/Messages/Messages";
import History from "@/app/components/History/History";

const HighlightChat = () => {
  const { clearMessages } = useMessagesContext()
  const { input, setInput, isDisabled } = useInputContext()
  const { setHighlightContext } = useHighlightContextContext()
  const { handleIncomingContext } = useSubmitQuery()
  const [isUserScrolling, setIsUserScrolling] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  const debouncedHandleSubmit = useCallback(
    debounce(300, async (context: HighlightContext) => {
      setInput(context.suggestion || '')
      await handleIncomingContext(context)
    }),
    []
  )

  useEffect(() => {
    api.addEventListener('onContext', (context: HighlightContext) => {
      setHighlightContext(context)
      // Handle context with debounce
      debouncedHandleSubmit(context)
    })
  }, [])

  // If the agent is not currently responding and the user types something, set isUserScrolling to false
  // so that the next time the agent responds, the chat will scroll to the bottom.
  useEffect(() => {
    if (!isDisabled && isUserScrolling) {
      setIsUserScrolling(false)
    }
  }, [input, isDisabled])

  const startNewConversation = () => {
    clearMessages()
    setInput('')
  }

  return (
    <div className={styles.page}>
      <History showHistory={showHistory}/>
      <div className={`${styles.contents} ${showHistory ? styles.partial : styles.full}`}>
        <TopBar
          onNewConversation={startNewConversation}
          showHistory={showHistory}
          setShowHistory={setShowHistory}
        />
        <Messages
          isUserScrolling={isUserScrolling}
          setIsUserScrolling={setIsUserScrolling}
        />
        <Input />
      </div>
    </div>
  )
}

export default HighlightChat
