import { useEffect } from 'react'
import { AssistantMessage, BaseMessage, UserMessage } from '@/types'
import { useStore } from '@/providers/store-provider'
import { useApi } from '@/hooks/useApi'

export default function useHandleConversationLoad() {
  const { get } = useApi()
  const conversationId = useStore((state) => state.conversationId)
  const loadConversation = useStore((state) => state.loadConversation)

  useEffect(() => {
    const loadConversationMessages = async () => {
      if (!conversationId) {
        return
      }
      const response = await get(`history/${conversationId}/messages`)
      if (!response.ok) {
        // @TODO Error handling
        console.error('Failed to select chat')
        return
      }
      const { messages } = await response.json()
      loadConversation(
        conversationId,
        messages.map((message: any) => {
          const baseMessage: BaseMessage = {
            role: message.role,
            content: message.content,
          }

          if (message.role === 'user') {
            return {
              ...baseMessage,
              context: message.context,
              ocr_text: message.ocr_text,
              clipboard_text: message.clipboard_text,
              image_url: message.image_url,
            } as UserMessage
          } else {
            return baseMessage as AssistantMessage
          }
        }),
      )
    }
    loadConversationMessages()
  }, [conversationId])
}
