'use client'

import * as React from 'react'
import { useState, useRef, useEffect, useCallback } from 'react'
import { AddIcon, AssistantIcon } from './icons/icons'
import { TopBarProps, Message as MessageType } from './types/types'
import { type HighlightContext } from '@highlight-ai/app-runtime'

import api from '@highlight-ai/app-runtime'
import { Message } from './components/Message'
import { useInputContext } from './context/InputContext'
import { Input } from './components/Input'

const debounce = (func: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout
  return (...args: any[]) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

const TopBar: React.FC<TopBarProps> = ({ mode, setMode, onNewConversation }) => {
  return (
    <div className="flex h-16 w-fill justify-end items-center border-b border-[rgba(255,255,255,0.05)] px-3">
      <button className="flex w-[24px] h-[24px] justify-center items-center" onClick={onNewConversation}>
        <AddIcon />
      </button>
    </div>
  )
}

const HighlightChat = () => {
  const [messages, setMessages] = useState<MessageType[]>([])
  const [isWorking, setIsWorking] = useState(false)
  const [mode, setMode] = useState<'assistant' | 'compare'>('assistant')
  const [highlightContext, setHighlightContext] = useState<HighlightContext | undefined>(undefined)
  const highlightContextRef = useRef<HighlightContext | null>(null)

  const { attachment, setAttachment, input, setInput } = useInputContext()

  const debouncedHandleSubmit = useCallback(
    debounce((context: HighlightContext) => {
      setInput(context.suggestion || '')
      handleSubmit(context)
    }, 300),
    []
  )

  useEffect(() => {
    api.addEventListener('onContext', (context: HighlightContext) => {
      console.log('Highlight context event listener called:', context)
      setHighlightContext(context)
      highlightContextRef.current = context
      // Handle context with debounce
      debouncedHandleSubmit(context)
    })
  }, [debouncedHandleSubmit])

  const addNewMessage = (message: MessageType) => {
    setMessages((prevMessages) => [...prevMessages, message])
  }

  const fetchResponse = async (formData: FormData) => {
    setIsWorking(true)

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://0.0.0.0:8080/'
      const response = await fetch(backendUrl, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No reader available')
      }

      let accumulatedResponse = ''
      setMessages((prevMessages) => [...prevMessages, { type: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = new TextDecoder().decode(value)

        // Split the chunk into individual JSON objects
        const jsonObjects = chunk.match(/\{[^\}]+\}/g) || []

        for (const jsonObject of jsonObjects) {
          try {
            const parsedChunk = JSON.parse(jsonObject)
            accumulatedResponse += parsedChunk.response

            // Update the UI with the accumulated response
            setMessages((prevMessages) => {
              const newMessages = [...prevMessages]
              newMessages[newMessages.length - 1] = { type: 'assistant', content: accumulatedResponse }
              return newMessages
            })
          } catch (e) {
            console.error('Error parsing chunk:', e)
            console.error('Problematic JSON object:', jsonObject)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching response:', error)
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: 'assistant', content: 'Sorry, there was an error processing your request.' }
      ])
    } finally {
      setIsWorking(false)
    }
  }

  const handleSubmit = async (context?: HighlightContext) => {
    let query = ''
    let screenshotUrl = ''
    let clipboardText = ''
    let ocrScreenContents = ''
    let rawContents = ''
    let audio = ''
    let pdfTitle = ''

    if (context) {
      query = context.suggestion || ''
      screenshotUrl = context.attachments?.find((a) => a.type === 'screenshot')?.value ?? ''
      clipboardText = context.attachments?.find((a) => a.type === 'clipboard')?.value ?? ''
      ocrScreenContents = context.environment.ocrScreenContents ?? ''
      rawContents = context.application.focusedWindow.rawContents
      audio = context.attachments?.find((a) => a.type === 'audio')?.value ?? ''
    } else {
      query = input.trim()
    }

    if (attachment && attachment.value) {
      if (attachment.type === 'image') {
        screenshotUrl = URL.createObjectURL(attachment.value)
      } else if (attachment.type === 'pdf') {
        pdfTitle = attachment.value.name
      }
    }

    if (query || attachment || clipboardText || ocrScreenContents || screenshotUrl || rawContents) {
      addNewMessage({
        type: 'user',
        content: query,
        clipboardText,
        screenshot: screenshotUrl,
        audio,
        fileTitle: pdfTitle
      })

      setInput('')
      setAttachment(undefined) // Clear the attachment immediately

      const formData = new FormData()
      formData.append('prompt', query)

      if (attachment && attachment.value) {
        if (attachment.type === 'image') {
          console.log('appending image attachment')
          formData.append('image', attachment.value)
        } else if (attachment.type === 'pdf') {
          console.log('appending pdf attachment')
          formData.append('pdf', attachment.value)
        }
      } else if (screenshotUrl) {
        console.log('appending screenshot url')
        formData.append('imageUrl', screenshotUrl)
      } else {
        console.log('no attachments to append')
      }

      // Create context from conversation history
      const conversationHistory = messages.map((msg) => `${msg.type}: ${msg.content}`).join('\n')
      let contextString = conversationHistory ?? 'This is a new conversation with Highlight Chat.'

      // Add Highlight context if available
      if (highlightContextRef.current) {
        contextString += '\n\nHighlight Context:\n' + JSON.stringify(highlightContextRef.current, null, 2)
      }

      console.log('contextString:', contextString)
      formData.append('context', contextString)

      fetchResponse(formData)
    }
  }

  const startNewConversation = () => {
    setMessages([])
    setInput('')
    setIsWorking(false)
  }

  return (
    <div className="text-white overflow-scroll flex flex-1 flex-col w-fill h-fill max-w-6xl max-h-full">
      <TopBar mode={mode} setMode={setMode} onNewConversation={startNewConversation} />
      <div className="flex flex-1 px-[12%] flex-col overflow-autopt-14 pb-4">
        <div className="flex flex-1 w-full mx-auto">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full w-full">
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-8">Highlight Chat</h1>
              </div>
            </div>
          ) : (
            <div className="flex flex-col w-full justify-end">
              {messages.map((message, index) => (
                <Message key={index} message={message} />
              ))}
            </div>
          )}
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
        <Input onSubmit={handleSubmit} />
      </div>
    </div>
  )
}

export default HighlightChat
