'use client'

import React from 'react'
import Highlight from '@highlight-ai/app-runtime'

import useAuth from '@/hooks/useAuth'
import { useChatHistory } from '@/hooks/useChatHistory'
import usePromptApps from '@/hooks/usePromptApps'

/**
 * Hook that watches for auth changes and updates the app's state to match
 * the new user.
 */
export function useAuthChangeHandler() {
  const { getAccessToken } = useAuth()
  const { refreshPrompts } = usePromptApps()
  const { refreshChatHistory } = useChatHistory()

  React.useEffect(() => {
    const subscription = Highlight.app.addListener('onAuthUpdate', async () => {
      // Force new tokens
      await getAccessToken(true)

      // Refresh prompts and chat history
      await Promise.allSettled([refreshPrompts(), refreshChatHistory()])
    })

    return () => subscription()
  })
}
