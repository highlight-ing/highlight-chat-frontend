'use client'

import { ChatHistoryItem } from '@/types'
import { InfiniteData, useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query'

import { HistoryByIdResponseData, HistoryResponseData } from '@/types/history'
import { PAGINATION_LIMIT } from '@/lib/constants'

import { useApi } from './useApi'

export function useHistory(options = {}) {
  const { get } = useApi()

  return useInfiniteQuery({
    queryKey: ['chat-history'],
    queryFn: async ({ pageParam }) => {
      const response = await get(`history/paginated?skip=${PAGINATION_LIMIT * pageParam}&limit=${PAGINATION_LIMIT}`, {
        version: 'v4',
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const data = (await response.json()) as HistoryResponseData

      return data.conversations ?? []
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

export function useHistoryByChatId(chatId: string | undefined) {
  const queryClient = useQueryClient()
  const { get } = useApi()

  return useQuery({
    queryKey: ['chat', chatId],
    queryFn: async () => {
      if (!chatId) return

      const chatHistory = queryClient.getQueryData(['chat-history']) as InfiniteData<Array<ChatHistoryItem>>
      const flattenedHistory = chatHistory.pages.flat()
      const existingChat = flattenedHistory.find((chat) => chat.id === chatId)

      if (existingChat) return existingChat

      const response = await get(`history/${chatId}`, {
        version: 'v4',
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const data = (await response.json()) as HistoryByIdResponseData
      return data.conversation
    },
    enabled: !!chatId,
    gcTime: 60000,
  })
}

export function useChatHistoryStore() {
  const queryClient = useQueryClient()

  async function invalidateChatHistory() {
    await queryClient.invalidateQueries({ queryKey: ['chat-history'] })
  }

  async function addOrUpdateChat(chat: Partial<Omit<ChatHistoryItem, 'id'>> & { id: ChatHistoryItem['id'] }) {
    queryClient.setQueryData(['chat-history'], (queryData: InfiniteData<Array<ChatHistoryItem>>) => {
      const firstPage = queryData.pages?.[0]
      const existingChatIndex = firstPage.findIndex((existingChat) => existingChat.id === chat.id)
      const existingChat = firstPage.find((existingChat) => existingChat.id === chat.id)
      const newChat = { ...existingChat, ...chat }
      const newChatHistory =
        existingChatIndex !== -1
          ? [
            [...firstPage.slice(0, existingChatIndex), newChat, ...firstPage.slice(existingChatIndex + 1)],
            ...queryData.pages.slice(1),
          ]
          : [[newChat, ...firstPage], ...queryData.pages.slice(1)]

      return {
        pages: newChatHistory,
        pageParams: queryData.pageParams,
      }
    })

    await queryClient.invalidateQueries({ queryKey: ['chat', chat.id] })
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
    invalidateChatHistory,
    addOrUpdateChat,
    removeChatsByIds,
  }
}
