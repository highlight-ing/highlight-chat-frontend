import { useEffect } from 'react'
import { AssistantMessage, BaseMessage, UserMessage } from '@/types'
import { useStore } from '@/providers/store-provider'
import { useApi } from '@/hooks/useApi'
import usePromptApps from '@/hooks/usePromptApps'

export default function useHandleConversationLoad() {
  const { get } = useApi()
  const history = useStore((state) => state.history)
  const promptApp = useStore((state) => state.promptApp)
  const clearPrompt = useStore((state) => state.clearPrompt)
  const conversationId = useStore((state) => state.conversationId)
  const conversationMessages = useStore((state) => state.conversationMessages)
  const updateConversationMessages = useStore((state) => state.updateConversationMessages)
  const setConversationLoading = useStore((state) => state.setConversationLoading)
  const { getPrompt, selectPrompt } = usePromptApps(false)

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
          version: 'v3',
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
              window_context: message.window_context,
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

  useEffect(() => {
    if (!conversationId) {
      return
    }

    const loadPrompt = async () => {
      const chat = history.find((c) => c.id === conversationId)

      if (!chat) {
        return
      }

      // @ts-ignore
      if (chat.app_id && chat.app_id != promptApp?.id) {
        console.log('Resolving prompt app for conversation')
        const prompt = await getPrompt(chat.app_id)
        if (prompt) {
          console.log('Setting prompt app for conversation')
          await selectPrompt(prompt, false, false)
        }
      } else if (!chat.app_id && promptApp?.id) {
        console.log('Clearing prompt app for conversation')
        clearPrompt()
      }
    }

    loadPrompt()
  }, [conversationId, history, promptApp])
}
