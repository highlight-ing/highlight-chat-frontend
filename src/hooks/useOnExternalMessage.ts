'use client'

import Highlight from '@highlight-ai/app-runtime'
import { useEffect } from 'react'
import { useStore } from '@/providers/store-provider'
import { useChatHistory } from '@/hooks/useChatHistory'

const useOnExternalMessage = () => {
  const { setConversationId } = useStore((state) => ({
    setConversationId: state.setConversationId,
  }))
  const { refreshChatItem } = useChatHistory()

  useEffect(() => {
    const removeListener = Highlight.app.addListener('onExternalMessage', async (caller: string, message: any) => {
      console.log('Received external message from:', caller)
      console.log('Message content:', message)

      if (message.conversationId) {
        console.log('Opening conversation from external event:', message.conversationId)

        // Set the conversation ID
        const conversation = await refreshChatItem(message.conversationId, true)
        if (!conversation) {
          console.error('Failed to open conversation from external event:', message.conversationId)
          return
        }
        setConversationId(message.conversationId)
      }
    })

    // Clean up the listener when the component unmounts
    return () => {
      removeListener()
    }
  }, [setConversationId])
}

export default useOnExternalMessage
