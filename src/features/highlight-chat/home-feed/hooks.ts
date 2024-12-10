'use client'

import Highlight from '@highlight-ai/app-runtime'
import { useQuery } from '@tanstack/react-query'

import { ConversationData } from '@/types/conversations'
import { HistoryResponseData } from '@/types/history'
import { useApi } from '@/hooks/useApi'

const THIRTY_MINUTES_IN_MS = 30 * 60 * 1000

export function useAudioNotes() {
  return useQuery({
    queryKey: ['audio-notes'],
    queryFn: async () => {
      const recentConversations = await Highlight.conversations.getAllConversations()

      return recentConversations as Array<ConversationData> | undefined
    },
    staleTime: THIRTY_MINUTES_IN_MS,
  })
}

export function useRecentlyUpdatedHistory() {
  const { get } = useApi()

  return useQuery({
    queryKey: ['recently-updated-history'],
    queryFn: async () => {
      try {
        const response = await get(`history/paginated`, {
          version: 'v4',
        })

        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        const data = (await response.json()) as HistoryResponseData

        const chatsSortedByUpdatedAt = data.conversations.sort((a, b) =>
          new Date(b.updated_at).toISOString().localeCompare(new Date(a.updated_at).toISOString()),
        )

        return chatsSortedByUpdatedAt ?? []
      } catch (error) {
        console.error('Error fetching response:', error)
        return []
      }
    },
    staleTime: Infinity,
  })
}
