import React, { createContext, useContext, useState } from 'react'
import { Message } from '../types/types'

interface MessagesContextProps {
  messages: Message[]
  addMessage: (message: Message) => void
  updateLastMessage: (message: Message) => void
  clearMessages: () => void
}

export const MessagesContext = createContext<MessagesContextProps>({
  messages: [],
  addMessage: () => {},
  updateLastMessage: () => {},
  clearMessages: () => {}
})

export const MessagesContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>([])

  const addMessage = (message: Message) => {
    setMessages((messages) => [...messages, message])
  }

  const updateLastMessage = (message: Message) => {
    setMessages((messages) => [...messages.slice(0, -1), message])
  }

  const clearMessages = () => {
    setMessages([])
  }

  return (
    <MessagesContext.Provider value={{ messages, addMessage, updateLastMessage, clearMessages }}>
      {children}
    </MessagesContext.Provider>
  )
}

export const useMessagesContext = () => {
  return useContext(MessagesContext)
}
