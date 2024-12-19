'use client'

import { ChatHistoryItem } from '@/types'
import { InfiniteData, useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query'

import { HistoryResponseData } from '@/types/history'
import { PAGINATION_LIMIT } from '@/lib/constants'

import { useApi } from './useApi'
import { useChatHistory } from './useChatHistory'

export function DEPRECATED__useHistory() {
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

export function useHistory(options = {}) {
  const { get } = useApi()

  return useInfiniteQuery({
    queryKey: ['chat-history'],
    queryFn: async ({ pageParam }) => {
      try {
        const response = await get(`history/paginated?skip=${PAGINATION_LIMIT * pageParam}&limit=${PAGINATION_LIMIT}`, {
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
      if (lastPage.length < PAGINATION_LIMIT) {
        return undefined
      }
      return lastPageParam + 1
    },
    staleTime: Infinity,
    ...options,
  })
}

export function useChatHistoryStore() {
  const queryClient = useQueryClient()

  function addOrUpdateChat(chat: ChatHistoryItem) {
    queryClient.setQueryData(['chat-history'], (queryData: InfiniteData<Array<ChatHistoryItem>>) => {
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

  function removeChatsByIds(selectedHistoryIds: Array<ChatHistoryItem['id']>) {
    queryClient.setQueryData(['chat-history'], (queryData: InfiniteData<Array<ChatHistoryItem>>) => {
      const newChatHistory = queryData.pages.reduce((result: Array<Array<ChatHistoryItem>>, currentPage) => {
        const filteredPage = currentPage.filter((item) => !selectedHistoryIds.includes(item.id))
        result.push(filteredPage)
        return result
      }, [])

      return {
        pages: newChatHistory,
        pageParams: queryData.pageParams,
      }
    })
  }

  return {
    addOrUpdateChat,
    removeChatsByIds,
  }
}
