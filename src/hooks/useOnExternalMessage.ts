'use client'

import Highlight from '@highlight-ai/app-runtime'
import { useEffect } from 'react'
import { useStore } from '@/providers/store-provider'
import { useRouter } from 'next/navigation'
import { useApi } from '@/hooks/useApi'
import usePromptApps from '@/hooks/usePromptApps'

const useOnExternalMessage = () => {
  const router = useRouter()
  const { get } = useApi()
  const { startNewConversation, setConversationId, addConversationMessage } = useStore((state) => ({
    startNewConversation: state.startNewConversation,
    setConversationId: state.setConversationId,
    addConversationMessage: state.addConversationMessage,
  }))
  const { clearPrompt } = usePromptApps()

  useEffect(() => {
    const removeListener = Highlight.app.addListener('onExternalMessage', async (caller: string, message: any) => {
      console.log('Received external message from:', caller)
      console.log('Message content:', message)

      if (message.conversationId) {
        console.log('Conversation ID:', message.conversationId)

        // Start a new conversation
        startNewConversation()
        //clearPrompt()

        // Set the conversation ID
        setConversationId(message.conversationId)

        try {
          // Fetch the conversation from the backend
          const response = await get(`history/${message.conversationId}`, { version: 'v3' })

          if (!response.ok) {
            throw new Error('Failed to fetch conversation')
          }

          const conversation = await response.json()

          // Add the fetched messages to the conversation
          conversation.messages.forEach((msg: any) => {
            addConversationMessage(message.conversationId, msg)
          })
          console.log('Conversation:', conversation)
          // Navigate to the chat view
          router.push('/chat')
        } catch (error) {
          console.error('Error fetching conversation:', error)
          // Handle error (e.g., show an error message to the user)
        }
      }
    })

    // Clean up the listener when the component unmounts
    return () => {
      removeListener()
    }
  }, [router, get, startNewConversation, setConversationId, addConversationMessage, clearPrompt])
}

export default useOnExternalMessage
