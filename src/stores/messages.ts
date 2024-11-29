import { Message } from '@/types'
import { StateCreator } from 'zustand'

export interface MessagesState {
  conversationMessages: Record<string, Message[]>
  thinkingMessages: Record<string, string[]>
}

export type MessagesSlice = MessagesState & {
  addConversationMessage: (conversationId: string, message: Message) => void
  updateLastConversationMessage: (conversationId: string, message: Message, personalization?: boolean) => void
  updateConversationMessages: (conversationId: string, messages: Message[]) => void
  clearConversationMessages: (conversationId: string) => void
  setAllConversationMessages: (conversationMessages: Record<string, Message[]>) => void
  clearAllConversationMessages: () => void
  clearAllOtherConversationMessages: (conversationId: string) => void
  getConversationMessages: (conversationId: string) => Message[] | undefined
  getLastConversationMessage: (conversationId: string) => Message | undefined
  addThinkingMessage: (conversationId: string, messageId: string) => void
}

export const initialMessagesState: MessagesState = {
  conversationMessages: {},
  thinkingMessages: {},
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
  updateLastConversationMessage: (conversationId, message, personalization) => {
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
    const openConversationMessages = { ...get().conversationMessages }
    delete openConversationMessages[conversationId]
    set({ conversationMessages: openConversationMessages })
  },
  setAllConversationMessages: (conversationMessages) => {
    set({ conversationMessages })
  },
  clearAllConversationMessages: () => {
    set({ conversationMessages: {} })
  },
  clearAllOtherConversationMessages: (conversationId) => {
    const messages = get().conversationMessages[conversationId]
    set({
      conversationMessages: messages ? { [conversationId]: messages } : {},
    })
  },
  getConversationMessages: (conversationId) => {
    return get().conversationMessages[conversationId]
  },
  getLastConversationMessage: (conversationId) => {
    const messages = get().conversationMessages[conversationId]
    return messages?.[messages.length - 1]
  },
  addThinkingMessage: (conversationId: string, messageId: string) => {
    const thinkingMessages = { ...get().thinkingMessages }
    if (!thinkingMessages[conversationId]) {
      thinkingMessages[conversationId] = []
    }
    thinkingMessages[conversationId].push(messageId)
    set({ thinkingMessages })
  },
})
