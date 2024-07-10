'use client'

import * as React from 'react'
import { useEffect, useCallback, useRef, useState } from 'react'
import { AssistantIcon } from './icons/icons'
import { type HighlightContext } from '@highlight-ai/app-runtime'
import { debounce } from 'throttle-debounce'

import api from '@highlight-ai/app-runtime'
import { Message } from './components/Message/Message'
import { useInputContext } from './context/InputContext'
import { Input } from './components/Input'
import { useHighlightContextContext } from './context/HighlightContext'
import { useSubmitQuery } from './hooks/useSubmitQuery'
import { useMessagesContext } from './context/MessagesContext'

import styles from './main.module.scss'
import TopBar from "@/app/components/Navigation/TopBar";

const HighlightChat = () => {
  const { messages, clearMessages } = useMessagesContext()
  const { input, setInput, isDisabled } = useInputContext()
  const { setHighlightContext } = useHighlightContextContext()
  const { handleIncomingContext } = useSubmitQuery()
  const [isUserScrolling, setIsUserScrolling] = useState(false)

  const scrollContainerRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    if (!isUserScrolling && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight
    }
  }, [messages])

  // If the agent is not currently responding and the user types something, set isUserScrolling to false
  // so that the next time the agent responds, the chat will scroll to the bottom.
  useEffect(() => {
    if (!isDisabled && isUserScrolling) {
      setIsUserScrolling(false)
    }
  }, [input, isDisabled])

  const handleScroll = () => {
    if (!scrollContainerRef.current) return
    const scrollTop = scrollContainerRef.current.scrollTop
    const scrollHeight = scrollContainerRef.current.scrollHeight
    const clientHeight = scrollContainerRef.current.clientHeight
    const isScrolledToBottom = scrollTop + clientHeight >= scrollHeight - 10

    setIsUserScrolling(!isScrolledToBottom)
  }

  const startNewConversation = () => {
    clearMessages()
    setInput('')
  }

  return (
    <div className={styles.page}>
      <TopBar onNewConversation={startNewConversation} />
      <div className={styles.messages} onScroll={handleScroll} ref={scrollContainerRef}>
        {
          messages.length > 0 &&
          messages.map((message, index) => (
            <Message key={index} isFirst={index === 0} message={message} />
          ))
        }
        {isDisabled && (
          <div className="flex justify-start mb-4">
          <div className="flex items-center">
          <div className="flex w-[32px] h-[32px] p-[6px] justify-center items-center rounded-full bg-light-5 mr-2">
          <AssistantIcon className="text-[#FFFFFF66]" />
          </div>
          <span className="text-sm text-light-60">Working on it...</span>
          </div>
          </div>
        )}
      </div>
      <Input />
    </div>
  )
}

export default HighlightChat
