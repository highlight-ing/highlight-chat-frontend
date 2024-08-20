import { useEffect, useRef } from 'react'
import equal from 'fast-deep-equal'
import Highlight from '@highlight-ai/app-runtime'
import { ChatHistoryItem } from '@/types'
import { useStore } from '@/providers/store-provider'

export const useOpenConverationsPersistence = () => {
  const openConversations = useStore((state) => state.openConversations)
  const setOpenConversations = useStore((state) => state.setOpenConversations)
  const openConversationsRef = useRef<ChatHistoryItem[]>(openConversations)

  useEffect(() => {
    if (!equal(openConversations, openConversationsRef.current)) {
      Highlight.appStorage.set('openConversations', openConversations)
    }
  }, [openConversations])

  useEffect(() => {
    Highlight.appStorage.whenHydrated().then(() => {
      const conversations = Highlight.appStorage.get('openConversations') ?? []
      openConversationsRef.current = conversations
      setOpenConversations(conversations)
    })
  }, [])
}
