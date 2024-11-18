import { useEffect } from 'react'

import { useStore } from '@/components/providers/store-provider'

export const useTabHotkeys = () => {
  const conversationId = useStore((state) => state.conversationId)
  const setConversationId = useStore((state) => state.setConversationId)
  const openConversations = useStore((state) => state.openConversations)
  const startNewConversation = useStore((state) => state.startNewConversation)
  const removeOpenConversation = useStore((state) => state.removeOpenConversation)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrMeta = e.ctrlKey || e.metaKey
      // console.log('key:', e.key, e.altKey, e.metaKey, e.shiftKey, e.ctrlKey)

      if ((e.key === 'n' || e.key === 't') && isCtrlOrMeta) {
        startNewConversation()
      } else if ((e.key === '[' || (e.key === 'Tab' && e.shiftKey)) && isCtrlOrMeta && openConversations.length > 0) {
        const currentTabIndex = openConversations.findIndex((chat) => chat.id === conversationId)
        if (currentTabIndex <= 0) {
          setConversationId(openConversations[openConversations.length - 1].id)
        } else {
          setConversationId(openConversations[currentTabIndex - 1].id)
        }
      } else if ((e.key === ']' || e.key === 'Tab') && isCtrlOrMeta && openConversations.length > 0) {
        const currentTabIndex = openConversations.findIndex((chat) => chat.id === conversationId)
        if (currentTabIndex === openConversations.length - 1) {
          setConversationId(openConversations[0].id)
        } else {
          setConversationId(openConversations[currentTabIndex + 1].id)
        }
      } else if (e.key === 'w' && isCtrlOrMeta && conversationId) {
        removeOpenConversation(conversationId)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [conversationId, openConversations])
}
