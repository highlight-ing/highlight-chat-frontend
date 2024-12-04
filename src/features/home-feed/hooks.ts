'use client'

import Highlight from '@highlight-ai/app-runtime'
import { useQuery } from '@tanstack/react-query'

export function useAudioNotes() {
  return useQuery({
    queryKey: ['audio-notes'],
    queryFn: async () => {
      const recentConversations = await Highlight.conversations.getAllConversations()

      return recentConversations
    },
  })
}
