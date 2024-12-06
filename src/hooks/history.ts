'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { HistoryResponseData } from '@/types/history'

import { useApi } from './useApi'
import { useChatHistory } from './useChatHistory'

export function useHistory() {
  const { refreshChatHistory } = useChatHistory()

  return useQuery({
    queryKey: ['history'],
    queryFn: async () => {
      const history = await refreshChatHistory()

      return history ?? []
    },
    staleTime: Infinity,
  })
}

export function usePaginatedHistory() {
  const page = 0
  const LIMIT_PER_PAGE = 10
  const { get } = useApi()

  return useQuery({
    queryKey: ['paginated-history', page],
    queryFn: async () => {
      try {
        const response = await get(`history/paginated?skip=${LIMIT_PER_PAGE * page}&limit=${LIMIT_PER_PAGE}`, {
          version: 'v4',
        })

        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        const data = (await response.json()) as HistoryResponseData

        return data.conversations
      } catch (error) {
        console.error('Error fetching response:', error)
        return []
      }
    },
    placeholderData: keepPreviousData,
    staleTime: Infinity,
  })
}
