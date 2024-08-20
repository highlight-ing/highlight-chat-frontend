import { useEffect } from 'react'
import { AssistantMessage, BaseMessage, UserMessage } from '@/types'
import { useStore } from '@/providers/store-provider'
import { useApi } from '@/hooks/useApi'

export default function useHandleConversationLoad() {
  const { get } = useApi()
  const conversationId = useStore((state) => state.conversationId)
  const setMessages = useStore((state) => state.setMessages)
  const openConversationMessages = useStore((state) => state.openConversationMessages)
  const setOpenConversationMessages = useStore((state) => state.updateOpenConversationMessages)
  const setConversationLoading = useStore((state) => state.setConversationLoading)

  useEffect(() => {
    const abortController = new AbortController()

    const checkAbortSignal = () => {
      if (abortController.signal.aborted) {
        throw new Error('Load chat request aborted')
      }
    }

    const loadConversationMessages = async () => {
      if (!conversationId) {
        setConversationLoading(false)
        return
      }
      try {
        if (openConversationMessages[conversationId]?.length) {
          setMessages(openConversationMessages[conversationId])
        } else {
          setMessages([])
        }

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
        setMessages(mappedMessages)
        setOpenConversationMessages(conversationId, mappedMessages)
      } catch (err) {
        console.error(err)
      } finally {
        setConversationLoading(false)
      }
    }

    loadConversationMessages()

    return () => {
      abortController.abort('Conversation ID changed')
    }
  }, [conversationId])
}
