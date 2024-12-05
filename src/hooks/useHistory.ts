'use client'

import { useQuery } from '@tanstack/react-query'

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
