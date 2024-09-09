import { useEffect, useState } from 'react'

interface ConversationData {
  id: string // UUID
  title: string
  summary: string
  timestamp: Date
  topic: string
  transcript: string
  summarized: boolean
  shareLink: string
  userId: string
}

declare global {
  interface Window {
    highlight: {
      internal: {
        getConversations: () => Promise<ConversationData[]>
        createConversationsStorageListener: (callback: () => void) => () => void
      }
    }
  }
}

export const useGetConversationTest = () => {
  const [conversations, setConversations] = useState<ConversationData[]>([])

  useEffect(() => {
    const fetchConversations = async () => {
      if (typeof window !== 'undefined' && window.highlight?.internal?.getConversations) {
        try {
          const fetchedConversations = await window.highlight.internal.getConversations()
          setConversations(fetchedConversations)
          console.log(fetchedConversations)
        } catch (error) {
          console.error('Error fetching conversations:', error)
        }
      }
    }

    fetchConversations()

    // Set up the listener
    let removeListener: (() => void) | undefined

    if (window.highlight?.internal?.createConversationsStorageListener) {
      removeListener = window.highlight.internal.createConversationsStorageListener(() => {
        console.log('Conversations updated')
        fetchConversations() // Fetch updated conversations when the event is triggered
      })
    }

    // Clean up the listener when the component unmounts
    return () => {
      if (removeListener) {
        removeListener()
      }
    }
  }, [])

  return conversations
}
