'use client'

import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query'

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

export function useInfiniteHistory() {
  const LIMIT_PER_PAGE = 30
  const { get } = useApi()

  return useInfiniteQuery({
    queryKey: ['paginated-history'],
    queryFn: async ({ pageParam }) => {
      try {
        const response = await get(`history/paginated?skip=${LIMIT_PER_PAGE * pageParam}&limit=${LIMIT_PER_PAGE}`, {
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
    initialPageParam: 0,
    getNextPageParam: (lastPage, _, lastPageParam) => {
      if (lastPage.length < LIMIT_PER_PAGE) {
        return undefined
      }
      return lastPageParam + 1
    },
    staleTime: Infinity,
  })
}
