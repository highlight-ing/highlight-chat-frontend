'use client'

import Highlight from '@highlight-ai/app-runtime'
import { useEffect } from 'react'
import { useStore } from '@/providers/store-provider'

export const useOnAppOpen = () => {
  const startNewConversation = useStore((state) => state.startNewConversation)
  const clearPrompt = useStore((state) => state.clearPrompt)

  useEffect(() => {
    const onOpen = (isActiveApp: boolean) => {
      if (isActiveApp) {
        startNewConversation()
        clearPrompt()
      }
    }
    const unsub = Highlight.app.addListener('onOpen', onOpen)
    return () => {
      unsub()
    }
  }, [])
}
