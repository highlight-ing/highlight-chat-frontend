import Highlight from '@highlight-ai/app-runtime'
import { useQuery } from '@tanstack/react-query'

export function useGetAllConversations() {
  return useQuery({
    queryKey: ['all-conversations'],
    queryFn: async () => {
      const conversations = await Highlight.conversations.getAllConversations()
      return conversations
    },
  })
}
