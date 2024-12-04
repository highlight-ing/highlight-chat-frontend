'use client'

import Highlight from '@highlight-ai/app-runtime'
import { useQuery } from '@tanstack/react-query'

const THIRTY_MINUTES_IN_MS = 30 * 60 * 1000

export function useAudioNotes() {
  return useQuery({
    queryKey: ['audio-notes'],
    queryFn: async () => {
      const recentConversations = await Highlight.conversations.getAllConversations()

      return recentConversations
    },
    staleTime: THIRTY_MINUTES_IN_MS,
  })
}
