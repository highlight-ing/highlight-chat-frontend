import { useShallow } from 'zustand/react/shallow'

import { useStore } from '@/components/providers/store-provider'

export const useCurrentChatMessages = () => {
  const conversationId = useStore((state) => state.conversationId)
  return useStore(useShallow((state) => state.conversationMessages[conversationId!] ?? []))
}
