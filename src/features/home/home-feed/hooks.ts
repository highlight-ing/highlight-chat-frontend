'use client'

import React from 'react'
import { useAtom } from 'jotai'

import { PAGINATION_LIMIT } from '@/lib/constants'
import { useAudioNotes } from '@/hooks/audio-notes'
import { useHistory } from '@/hooks/chat-history'

import { recentActionsPageAtom } from './atoms'

export function useRecentActions() {
  const [localPage, setLocalPage] = useAtom(recentActionsPageAtom)
  const [isLoadingMore, setIsLoadingMore] = React.useState(false)
  const historyQuery = useHistory()
  const audioQuery = useAudioNotes()

  const combinedData = React.useMemo(() => {
    const allChats =
      historyQuery.data?.pages.flat().map((chat) => ({
        ...chat,
        updatedAt: new Date(chat.updated_at),
        type: 'chat' as const,
      })) ?? []
    const audioNotes =
      audioQuery.data?.map((audioNote) => ({
        ...audioNote,
        updatedAt: audioNote.endedAt,
        type: 'audio-note' as const,
      })) ?? []

    return [...allChats, ...audioNotes].sort((a, b) => b.updatedAt?.getTime() - a.updatedAt?.getTime())
  }, [historyQuery.data?.pages, audioQuery.data])

  const fetchNextPage = React.useCallback(async () => {
    if (isLoadingMore || !combinedData) return

    try {
      setIsLoadingMore(true)

      const currentEnd = (localPage + 1) * PAGINATION_LIMIT
      const nextBatchOfItems = combinedData.slice(currentEnd, currentEnd + PAGINATION_LIMIT)

      if (!nextBatchOfItems.length) return

      const remainingChats = combinedData.slice(currentEnd).filter((item) => item.type === 'chat')

      if (remainingChats.length > PAGINATION_LIMIT) {
        setLocalPage((prev) => prev + 1)
        return
      }

      const oldestLoadedChat = historyQuery.data?.pages.flat().at(-1)

      if (!oldestLoadedChat) {
        await historyQuery.fetchNextPage({ cancelRefetch: true })
        setLocalPage((prev) => prev + 1)
        return
      }

      const nextChat = combinedData.find((item, index) => item.type === 'chat' && index >= currentEnd)

      if (nextChat) {
        const nextBatchOldestTime = nextBatchOfItems[nextBatchOfItems.length - 1].updatedAt
        if (nextChat.updatedAt < nextBatchOldestTime) {
          setLocalPage((prev) => prev + 1)
          return
        }
      }

      const oldestChatTime = new Date(oldestLoadedChat.updated_at).getTime()
      const needsMoreChats = nextBatchOfItems.some((item) => item.updatedAt.getTime() > oldestChatTime)

      if (needsMoreChats && historyQuery.hasNextPage) {
        await historyQuery.fetchNextPage()
      }

      setLocalPage((prev) => prev + 1)
    } finally {
      setIsLoadingMore(false)
    }
  }, [isLoadingMore, historyQuery, combinedData, localPage, setLocalPage])

  const visibleData = React.useMemo(() => {
    if (!combinedData) return null
    return combinedData.slice(0, (localPage + 1) * PAGINATION_LIMIT)
  }, [combinedData, localPage])

  const hasNextPage = React.useMemo(() => {
    if (!combinedData) return false
    return combinedData.length > (localPage + 1) * PAGINATION_LIMIT
  }, [combinedData, localPage])

  return {
    data: visibleData,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage: isLoadingMore,
    isLoading: historyQuery.isLoading || audioQuery.isLoading,
    historyQuery,
  }
}
