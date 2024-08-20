import { StateCreator } from 'zustand'
import { Message } from '@/types'

export interface MessagesState {
  conversationMessages: Record<string, Message[]>
}

export type MessagesSlice = MessagesState & {
  addConversationMessage: (conversationId: string, messages: Message) => void
  updateLastConversationMessage: (conversationId: string, messages: Message) => void
  updateConversationMessages: (conversationId: string, messages: Message[]) => void
  clearConversationMessages: (conversationId: string) => void
  setAllConversationMessages: (conversationMessages: Record<string, Message[]>) => void
  clearAllConversationMessages: () => void
  clearAllOtherConversationMessages: (conversationId: string) => void
}

export const initialMessagesState: MessagesState = {
  conversationMessages: {},
}

export const createMessagesSlice: StateCreator<MessagesSlice> = (set, get) => ({
  ...initialMessagesState,
  addConversationMessage: (conversationId, message) => {
    const openConversationMessages = { ...get().conversationMessages }
    if (!openConversationMessages[conversationId]) {
      openConversationMessages[conversationId] = []
    }
    openConversationMessages[conversationId].push(message)
    set({ conversationMessages: openConversationMessages })
  },
  updateLastConversationMessage: (conversationId, message) => {
    const openConversationMessages = { ...get().conversationMessages }
    if (!openConversationMessages[conversationId]?.length) {
      return
    }
    openConversationMessages[conversationId] = [...openConversationMessages[conversationId].slice(0, -1), message]
    set({ conversationMessages: openConversationMessages })
  },
  updateConversationMessages: (conversationId, messages) => {
    const openConversationMessages = { ...get().conversationMessages }
    openConversationMessages[conversationId] = messages
    set({ conversationMessages: openConversationMessages })
  },
  clearConversationMessages: (conversationId) => {
    const conversations = get().conversationMessages
    if (!conversations[conversationId]) {
      return
    }
    const openConversationMessages = { ...conversations }
    delete openConversationMessages[conversationId]
    set({ conversationMessages: openConversationMessages })
  },
  setAllConversationMessages: (conversationMessages) => {
    set({ conversationMessages: conversationMessages })
  },
  clearAllConversationMessages: () => {
    set({ conversationMessages: {} })
  },
  clearAllOtherConversationMessages: (conversationId) => {
    const conversationMessages: Record<string, Message[]> = {}
    conversationMessages[conversationId] = get().conversationMessages[conversationId]
    set({ conversationMessages })
  },
})
