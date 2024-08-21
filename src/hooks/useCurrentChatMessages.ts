import { useStore } from '@/providers/store-provider'
import { useShallow } from 'zustand/react/shallow'

export const useCurrentChatMessages = () => {
  const conversationId = useStore((state) => state.conversationId)
  return useStore(useShallow((state) => state.conversationMessages[conversationId!] ?? []))
}
