'use client'

import { ChatHistoryItem } from '@/types'
import { InfiniteData, useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query'

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
  const LIMIT_PER_PAGE = 10
  const { get } = useApi()

  return useInfiniteQuery({
    queryKey: ['infinite-history'],
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

export function useHistoryStore() {
  const queryClient = useQueryClient()

  function addOrUpdateChat(chat: ChatHistoryItem) {
    queryClient.setQueryData(['infinite-history'], (queryData: InfiniteData<Array<ChatHistoryItem>>) => {
      const firstPage = queryData.pages?.[0]
      const existingChatIndex = firstPage.findIndex((existingChat) => existingChat.id === chat.id)
      const newChatHistory =
        existingChatIndex !== -1
          ? [
              [...firstPage.slice(0, existingChatIndex), chat, ...firstPage.slice(existingChatIndex + 1)],
              ...queryData.pages.slice(1),
            ]
          : [[chat, ...firstPage], ...queryData.pages.slice(1)]

      return {
        pages: newChatHistory,
        pageParams: queryData.pageParams,
      }
    })
  }

  return {
    addOrUpdateChat,
  }
}
