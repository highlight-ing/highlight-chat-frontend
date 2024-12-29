import { AssistantMessage, BaseMessage, ChatHistoryItem, Message, UserMessage } from '@/types'
import { useQuery } from '@tanstack/react-query'

import { useApi } from '@/hooks/useApi'

const RETRY_ATTEMPTS = 4

export function useMessages(chatId: ChatHistoryItem['id'] | undefined) {
  const { get } = useApi()

  return useQuery({
    queryKey: ['chat-messages', chatId],
    queryFn: async ({ signal }) => {
      if (!chatId) return
      const response = await get(`history/${chatId}/messages`, {
        signal,
        version: 'v4',
      })

      if (!response.ok) {
        console.error(`Failed to load chat: ${chatId}`, response.status, response.statusText)
        return
      }

      const { version, messages } = await response.json()

      const mappedMessages = messages.map((message: any) => {
        const baseMessage: BaseMessage = {
          id: message.id,
          role: message.role,
          content: message.content,
          version,
          conversation_id: chatId,
          given_feedback: message.given_feedback,
        }
        if (message.role === 'user') {
          return {
            ...baseMessage,
            context: message.context,
            ocr_text: message.ocr_text,
            clipboard_text: message.clipboard_text,
            image_url: message.image_url,
            window_context: message.window_context,
            audio: message.audio,
            attached_context: message.attached_context,
          } as UserMessage
        } else {
          return {
            ...baseMessage,
            id: message.id,
            role: message.role,
            content: message.content,
            version,
            conversation_id: chatId,
            given_feedback: message.given_feedback,
            visualization: message?.visualization,
          } as AssistantMessage
        }
      })

      return mappedMessages as Array<Message>
    },
    enabled: !!chatId,
    staleTime: 5 * 60 * 1000,
    retry: RETRY_ATTEMPTS,
    retryDelay: (attemptIndex) => {
      // Exponential backoff: 5s, 10s, 20s, 20s
      return Math.min(5000 * 2 ** attemptIndex, 20000)
    },
  })
}
