import { ChatHistoryItem } from '@/types'
import { useMutation } from '@tanstack/react-query'

import { useChatHistoryStore } from '@/hooks/chat-history'
import { useChatHistory } from '@/hooks/useChatHistory'

const RETRY_ATTEMPTS = 4
export const NEW_CONVERSATION_TITLE = 'New Conversation'

export function useUpdateConversationTitle() {
  const { refreshChatItem } = useChatHistory()
  const { addOrUpdateChat } = useChatHistoryStore()

  return useMutation({
    mutationKey: ['update-conversation-title'],
    mutationFn: async (chatId: string) => {
      const updatedConversation = await refreshChatItem(chatId)

      // If the title is still "New Conversation", consider it not ready
      if (!updatedConversation || updatedConversation.title === NEW_CONVERSATION_TITLE) {
        throw new Error('Conversation title not yet updated')
      }

      return updatedConversation
    },
    onSuccess: (chat) => {
      addOrUpdateChat(chat)
    },
    retry: RETRY_ATTEMPTS,
    retryDelay: (attemptIndex) => {
      // Exponential backoff: 5s, 10s, 20s, 20s
      return Math.min(5000 * 2 ** attemptIndex, 20000)
    },
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
      console.log('Added new conversation:', chatId)
    },
    retry: RETRY_ATTEMPTS,
    retryDelay: (attemptIndex) => {
      // Exponential backoff: 1s, 2s, 4s, 8s
      return Math.min(1000 * 2 ** attemptIndex, 8000)
    },
  })
}
