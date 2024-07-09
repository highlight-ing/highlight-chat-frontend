'use client'

import * as React from 'react'
import { useState, useRef, useEffect, useCallback } from 'react'
import { AddIcon, AssistantIcon } from './icons/icons'
import { TopBarProps, Message as MessageType } from './types/types'
import { type HighlightContext } from '@highlight-ai/app-runtime'

import api from '@highlight-ai/app-runtime'
import { Message } from './components/Message'
import { AttachmentsButton } from './components/AttachmentsButton'
import { Attachment } from './components/Attachment'

const debounce = (func: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout
  return (...args: any[]) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

const TopBar: React.FC<TopBarProps> = ({ mode, setMode, onNewConversation }) => {
  return (
    <header className="absolute top-0 left-0 right-0 border-b border-[rgba(255,255,255,0.05)]">
      <div className="flex w-[1122px] h-[64px] p-[12px] justify-end items-center mx-auto">
        <button className="flex w-[24px] h-[24px] justify-center items-center" onClick={onNewConversation}>
          <AddIcon />
        </button>
      </div>
    </header>
  )
}

const PLACEHOLDER_TEXT = 'Ask Highlight anything...'

const HighlightChat = () => {
  const [messages, setMessages] = useState<MessageType[]>([])
  const [input, setInput] = useState('')
  const [isWorking, setIsWorking] = useState(false)
  const [mode, setMode] = useState<'assistant' | 'compare'>('assistant')
  const [attachment, setAttachment] = useState<File | undefined>(undefined)
  const [attachmentType, setAttachmentType] = useState<'image' | 'pdf' | undefined>(undefined)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [highlightContext, setHighlightContext] = useState<HighlightContext | undefined>(undefined)
  const highlightContextRef = useRef<HighlightContext | null>(null)
  const inputRef = useRef<HTMLDivElement>(null)
  const [isPlaceholderVisible, setIsPlaceholderVisible] = useState(true)

  useEffect(() => {
    if (inputRef.current && isPlaceholderVisible) {
      inputRef.current.textContent = PLACEHOLDER_TEXT
    }
  }, [isPlaceholderVisible])

  const onFocusInput = () => {
    if (isPlaceholderVisible && inputRef.current) {
      inputRef.current.textContent = ''
      setIsPlaceholderVisible(false)
    }
  }

  const onBlurInput = () => {
    if (input.length === 0 && inputRef.current) {
      inputRef.current.textContent = PLACEHOLDER_TEXT
      setIsPlaceholderVisible(true)
    }
  }

  const onInput = (e: React.FormEvent<HTMLDivElement>) => {
    const content = e.currentTarget.innerText
    setInput(content ?? '')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
      setIsPlaceholderVisible(true)
    }
  }

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

  const handleAttachmentClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
      setAttachment(file)
      setAttachmentType(file.type.startsWith('image/') ? 'image' : 'pdf')
    } else {
      alert('Please select a valid image or PDF file.')
    }
  }

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

    if (query || attachment || clipboardText || ocrScreenContents || screenshotUrl || rawContents) {
      addNewMessage({
        type: 'user',
        content: query,
        file: attachment ? URL.createObjectURL(attachment) : undefined,
        clipboardText,
        screenshot: screenshotUrl,
        audio
      })

      setInput('')
      setAttachment(undefined) // Clear the attachment immediately

      const formData = new FormData()
      formData.append('prompt', query)

      if (attachment) {
        if (attachmentType === 'image') {
          console.log('appending image attachment')
          formData.append('image', attachment)
        } else if (attachmentType === 'pdf') {
          console.log('appending pdf attachment')
          formData.append('pdf', attachment)
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
    <div className="fixed inset-0 bg-[rgba(255,255,255,0.05)] text-white overflow-hidden flex flex-col">
      <TopBar mode={mode} setMode={setMode} onNewConversation={startNewConversation} />
      <main className="flex-1 overflow-auto pt-14 pb-20">
        <div className="max-w-3xl mx-auto h-full">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-8">Highlight Chat</h1>
                <p className="text-light-60 text-base font-normal leading-[150%]">
                  Ask Highlight anything to get started.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col justify-end h-full">
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
      </main>
      <footer className="fixed bottom-0 left-0 right-0 p-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col gap-4 items-space-between bg-[#161617] rounded-lg border border-light-10 px-4 py-3">
            {attachment && (
              <div className="mb-2">
                {attachmentType === 'image' ? (
                  <Attachment type="image" value={URL.createObjectURL(attachment)} />
                ) : (
                  <Attachment type="pdf" value={attachment.name} />
                )}
              </div>
            )}
            <div className="flex gap-3">
              <AttachmentsButton onClick={handleAttachmentClick} />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,application/pdf"
                className="hidden"
              />
              <div
                contentEditable
                className={`flex-1 outline-none text-base bg-transparent overflow-auto max-h-40 min-h-6 resize ${
                  !input ? 'text-light-60' : 'text-light'
                }`}
                ref={inputRef}
                onInput={onInput}
                onFocus={onFocusInput}
                onBlur={onBlurInput}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HighlightChat
