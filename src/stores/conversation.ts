import { StateCreator } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import { Store } from '.'
import { Message } from '@/types'

/**
 * Store that deals with the current conversation.
 */

export interface ConversationState {
  conversationId: string | undefined
}

export type ConversationSlice = ConversationState & {
  resetConversationId: () => void
  getOrCreateConversationId: () => string
  startNewConversation: () => void
  loadConversation: (conversationId: string, messages: Message[]) => void
}

export const initialConversationState: ConversationState = {
  conversationId: undefined,
}

export const createConversationSlice: StateCreator<Store, [], [], ConversationSlice> = (set, get) => ({
  ...initialConversationState,
  resetConversationId: () => set({ conversationId: undefined }),
  getOrCreateConversationId: () => {
    if (!get().conversationId) {
      const newId = uuidv4()
      set({ conversationId: newId })
    }
    return get().conversationId!
  },
  loadConversation: (conversationId: string, messages: Message[]) => {
    set({ conversationId, messages })
  },
  startNewConversation: () => {
    get().resetConversationId()
    get().clearMessages()
    get().clearInput()
    get().clearAttachments()
  },
})
