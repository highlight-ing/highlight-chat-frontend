import { useChatHistory } from '@/hooks/useChatHistory'
import { useMutation } from '@tanstack/react-query'

const RETRY_ATTEMPTS = 4
export const NEW_CONVERSATION_TITLE = 'New Conversation'

export function useUpdateConversationTitle() {
  const { refreshChatItem } = useChatHistory()

  return useMutation({
    mutationFn: async ({ chatId }: { chatId: string }) => {
      const updatedConversation = await refreshChatItem(chatId)

      // If the title is still "New Conversation", consider it not ready
      if (!updatedConversation || updatedConversation.title === NEW_CONVERSATION_TITLE) {
        throw new Error('Conversation title not yet updated')
      }

      return updatedConversation
    },
    onSuccess: (updatedConversation) => {
      console.log('Updated conversation:', updatedConversation.title)
    },
    retry: RETRY_ATTEMPTS,
    retryDelay: (attemptIndex) => {
      // Exponential backoff: 1s, 2s, 4s, 8s
      return Math.min(1000 * 2 ** attemptIndex, 16000)
    },
  })
}
