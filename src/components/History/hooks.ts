import { useChatHistory } from '@/hooks/useChatHistory'
import { ChatHistoryItem } from '@/types'
import { useMutation, useQuery } from '@tanstack/react-query'

const RETRY_ATTEMPTS = 4
export const NEW_CONVERSATION_TITLE = 'New Conversation'

export function useHistory() {
  const { refreshChatHistory } = useChatHistory()

  return useQuery({
    queryKey: ['history'],
    queryFn: refreshChatHistory,
    staleTime: Infinity,
  })
}

export function useUpdateConversationTitle(chat: ChatHistoryItem) {
  const { history, refreshChatItem } = useChatHistory()

  return useQuery({
    queryKey: ['update-conversation', chat.id],
    queryFn: async () => {
      const updatedConversation = await refreshChatItem(chat.id)

      // If the title is still "New Conversation", consider it not ready
      if (!updatedConversation || updatedConversation.title === NEW_CONVERSATION_TITLE) {
        throw new Error('Conversation title not yet updated')
      }

      return updatedConversation
    },
    enabled: chat.id === history?.[0].id && chat.title === NEW_CONVERSATION_TITLE,
    retry: RETRY_ATTEMPTS,
    retryDelay: (attemptIndex) => {
      // Exponential backoff: 1s, 2s, 4s, 8s
      return Math.min(1000 * 2 ** attemptIndex, 16000)
    },
    staleTime: 60 * 1000,
  })
}

export function useAddNewChat(chatId: ChatHistoryItem['id'] | undefined) {
  const { refreshChatItem } = useChatHistory()

  return useMutation({
    mutationKey: ['add-chat', chatId],
    mutationFn: async () => {
      if (!chatId) throw new Error('No chat ID found')

      const newConversation = await refreshChatItem(chatId, true)

      if (!newConversation) throw new Error('Failed to pull new conversation')

      return newConversation
    },
    onSuccess: () => {
      console.log('Updated conversation:', chatId)
    },
    retry: RETRY_ATTEMPTS,
    retryDelay: (attemptIndex) => {
      // Exponential backoff: 1s, 2s, 4s, 8s
      return Math.min(1000 * 2 ** attemptIndex, 16000)
    },
  })
}
