'use client'

import * as React from 'react'
import { useEffect, useCallback } from 'react'
import { AddIcon, AssistantIcon } from './icons/icons'
import { TopBarProps, Message as MessageType } from './types/types'
import { type HighlightContext } from '@highlight-ai/app-runtime'
import { debounce } from 'throttle-debounce'

import api from '@highlight-ai/app-runtime'
import { Message } from './components/Message'
import { useInputContext } from './context/InputContext'
import { Input } from './components/Input'
import { useHighlightContextContext } from './context/HighlightContext'
import { useSubmitQuery } from './hooks/useSubmitQuery'
import { useMessagesContext } from './context/MessagesContext'

const TopBar: React.FC<TopBarProps> = ({ onNewConversation }) => {
  return (
    <div className="flex h-16 w-fill justify-end items-center border-b border-[rgba(255,255,255,0.05)] px-3 py-3">
      <button className="flex w-[36px] h-[36px] justify-center items-center" onClick={onNewConversation}>
        <AddIcon />
      </button>
    </div>
  )
}

const HighlightChat = () => {
  const { messages, clearMessages } = useMessagesContext()
  const { setInput } = useInputContext()
  const { setHighlightContext } = useHighlightContextContext()
  const { isWorking, handleIncomingContext, cancelRequest } = useSubmitQuery()

  const debouncedHandleSubmit = useCallback(
    debounce(300, async (context: HighlightContext) => {
      setInput(context.suggestion || '')
      handleIncomingContext(context)
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

  const startNewConversation = () => {
    clearMessages()
    setInput('')
    cancelRequest()
  }

  return (
    <div className="text-white flex flex-col w-full h-dvh max-h-dvh max-w-6x overflow-auto">
      <TopBar onNewConversation={startNewConversation} />
      <div className="flex px-[12%] flex-col pb-4 h-full">
        <div className="flex w-full mx-auto h-full">
          {messages.length === 0 ? (
            <div className="flex flex-1 items-center justify-center h-full w-full">
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-8">Highlight Chat</h1>
              </div>
            </div>
          ) : (
            <div className="flex flex-col w-full h-full justify-end">
              <div className={`flex flex-1 flex-col w-full max-h-[calc(100dvh-180px)] overflow-y-scroll mb-4`}>
                {messages.map((message, index) => (
                  <Message key={index} message={message} className={`${index === 0 && 'mt-auto'}`} />
                ))}
                {isWorking && (
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
            </div>
          )}
        </div>
        <Input />
      </div>
    </div>
  )
}

export default HighlightChat
