import React, { useEffect, useState } from 'react'

export const useConversations = () => {
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
