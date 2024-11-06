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
  refreshChatItem: (conversationId: string, addOpenConversation?: boolean) => Promise<ChatHistoryItem | null>
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
      const response = await get('history/', { version: 'v4' })
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
      console.log('history:', data.conversations)
      return data.conversations
    } catch (error) {
      console.error('Error fetching response:', error)
      if (history.length > 0) {
        setHistory([])
      }
      return []
    }
  }

  const fetchConversation = async (
    conversationId: string,
    addOpenConversation?: boolean,
  ): Promise<ChatHistoryItem | null> => {
    try {
      let currentHistory = history
      if (!currentHistory || currentHistory.length === 0) {
        console.log('FETCHING HISTORY')
        currentHistory = await fetchResponse()
        setHistory(currentHistory)
      }

      const response = await get(`history/${conversationId}`, { version: 'v4' })
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const data = await response.json()

      if (
        equal(
          currentHistory.find((item) => item.id === conversationId),
          data.conversation,
        )
      ) {
        return data.conversation
      }
      let newHistory = [...currentHistory]
      const existingIndex = newHistory.findIndex((chat) => chat.id === conversationId)
      if (existingIndex !== -1) {
        newHistory[existingIndex] = data.conversation
      } else {
        newHistory = [data.conversation, ...currentHistory]
      }
      setHistory(newHistory)
      if (openConversations.some((chat) => chat.id === conversationId) || addOpenConversation) {
        addOrUpdateOpenConversation(data.conversation)
      }
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
