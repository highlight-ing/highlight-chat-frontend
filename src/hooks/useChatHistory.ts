import { useEffect, useRef } from 'react'
import { useApi } from '@/hooks/useApi'
import { useStore } from '@/providers/store-provider'
import { ChatHistoryItem } from '@/types'
import { useShallow } from 'zustand/react/shallow'
import equal from 'fast-deep-equal'

interface ChatHistoryResponse {
  conversations: ChatHistoryItem[]
}

export const useChatHistory = (): {
  history: ChatHistoryItem[]
  refreshChatHistory: () => Promise<ChatHistoryItem[]>
  refreshChatItem: (conversationId: string) => Promise<ChatHistoryItem | null>
} => {
  const { get } = useApi()
  const { history, setHistory, addOrUpdateOpenConversation, openConversations } = useStore(
    useShallow((state) => ({
      history: state.history,
      setHistory: state.setHistory,
      openConversations: state.openConversations,
      addOrUpdateOpenConversation: state.addOrUpdateOpenConversation,
    })),
  )

  const fetchResponse = async () => {
    try {
      const response = await get('history/')
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const data: ChatHistoryResponse = await response.json()
      setHistory(data.conversations)
      for (const chat of data.conversations) {
        if (openConversations.find((conv) => conv.id === chat.id)) {
          addOrUpdateOpenConversation(chat)
        }
      }
      return data.conversations
    } catch (error) {
      console.error('Error fetching response:', error)
      if (history.length > 0) {
        setHistory([])
      }
      return []
    }
  }

  const fetchConversation = async (conversationId: string): Promise<ChatHistoryItem | null> => {
    try {
      const response = await get(`history/${conversationId}`)
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const data = await response.json()
      if (
        equal(
          history.find((item) => item.id === conversationId),
          data.conversation,
        )
      ) {
        return data.conversation
      }
      let newHistory = [...history]
      const existingIndex = newHistory.findIndex((chat) => chat.id === conversationId)
      if (existingIndex !== -1) {
        newHistory[existingIndex] = data.conversation
      } else {
        newHistory = [data.conversation, ...history]
      }
      setHistory(newHistory)
      addOrUpdateOpenConversation(data.conversation)
      return data.conversation
    } catch (error) {
      console.error('Error fetching conversation:', error)
      return null
    }
  }

  return {
    history,
    refreshChatItem: fetchConversation,
    refreshChatHistory: fetchResponse,
  }
}
