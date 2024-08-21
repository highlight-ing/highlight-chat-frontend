import { useEffect } from 'react'
import { AssistantMessage, BaseMessage, UserMessage } from '@/types'
import { useStore } from '@/providers/store-provider'
import { useApi } from '@/hooks/useApi'

export default function useHandleConversationLoad() {
  const { get } = useApi()
  const conversationId = useStore((state) => state.conversationId)
  const conversationMessages = useStore((state) => state.conversationMessages)
  const updateConversationMessages = useStore((state) => state.updateConversationMessages)
  const setConversationLoading = useStore((state) => state.setConversationLoading)

  useEffect(() => {
    if (!conversationId) {
      setConversationLoading(false)
      return
    }

    const abortController = new AbortController()

    const checkAbortSignal = () => {
      if (abortController.signal.aborted) {
        throw new Error('Load chat request aborted')
      }
    }

    const loadConversationMessages = async () => {
      try {
        setConversationLoading(true)
        const response = await get(`history/${conversationId}/messages`, {
          signal: abortController.signal,
        })
        if (!response.ok) {
          // @TODO Error handling
          console.error(`Failed to load chat: ${conversationId}`, response.status, response.statusText)
          return
        }

        checkAbortSignal()

        const { messages } = await response.json()

        checkAbortSignal()

        const mappedMessages = messages.map((message: any) => {
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
        })

        const lastExistingMessage =
          conversationMessages[conversationId]?.[conversationMessages[conversationId]?.length - 1]
        const lastNewMessage = mappedMessages[mappedMessages.length - 1]
        if (lastExistingMessage?.role === 'assistant' && lastNewMessage?.role === 'user') {
          updateConversationMessages(conversationId, [...mappedMessages, lastExistingMessage])
        } else if (lastExistingMessage && lastNewMessage === undefined) {
          updateConversationMessages(conversationId, [lastExistingMessage, ...mappedMessages])
        } else {
          updateConversationMessages(conversationId, mappedMessages)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setConversationLoading(false)
      }
    }

    if (!conversationMessages[conversationId]?.length) {
      loadConversationMessages()
    }

    return () => {
      // abortController.abort('Conversation ID changed')
    }
  }, [conversationId, conversationMessages])
}
