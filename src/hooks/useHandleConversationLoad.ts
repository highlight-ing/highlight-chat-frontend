import { useEffect } from 'react'
import { AssistantMessage, BaseMessage, UserMessage } from '@/types'
import { useStore } from '@/providers/store-provider'
import { useApi } from '@/hooks/useApi'

export default function useHandleConversationLoad() {
  const { get } = useApi()
  const conversationId = useStore((state) => state.conversationId)
  const setMessages = useStore((state) => state.setMessages)

  useEffect(() => {
    const abortController = new AbortController()

    const checkAbortSignal = () => {
      if (abortController.signal.aborted) {
        throw new Error('Aborted chat request')
      }
    }

    const loadConversationMessages = async () => {
      if (!conversationId) {
        return
      }
      try {
        const response = await get(`history/${conversationId}/messages`, {
          signal: abortController.signal,
        })
        if (!response.ok) {
          // @TODO Error handling
          console.error('Failed to select chat')
          return
        }

        checkAbortSignal()

        const { messages } = await response.json()

        checkAbortSignal()

        setMessages(
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
      } catch (err) {
        console.error(err)
      }
    }

    loadConversationMessages()

    return () => {
      abortController.abort('Conversation ID changed')
    }
  }, [conversationId])
}
