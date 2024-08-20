import { StateCreator } from 'zustand'
import { Message } from '@/types'

export interface MessagesState {
  messages: Message[]
  openConversationMessages: Record<string, Message[]>
}

export type MessagesSlice = MessagesState & {
  addMessage: (message: Message) => void
  updateLastMessage: (message: Message) => void
  clearMessages: () => void
  setMessages: (messages: Message[]) => void
  updateOpenConversationMessages: (conversationId: string, messages: Message[]) => void
  clearOpenConversationMessages: (conversationId: string) => void
  setAllOpenConversationMessages: (conversationMessages: Record<string, Message[]>) => void
  clearAllOpenConversationMessages: () => void
}

export const initialMessagesState: MessagesState = {
  messages: [],
  openConversationMessages: {},
}

export const createMessagesSlice: StateCreator<MessagesSlice> = (set, get) => ({
  ...initialMessagesState,
  addMessage: (message: Message) => set((state) => ({ messages: [...state.messages, message] })),
  updateLastMessage: (message: Message) => set((state) => ({ messages: [...state.messages.slice(0, -1), message] })),
  clearMessages: () => set({ messages: [] }),
  setMessages: (messages: Message[]) => {
    set({ messages })
  },
  updateOpenConversationMessages: (conversationId, messages) => {
    const openConversationMessages = { ...get().openConversationMessages }
    openConversationMessages[conversationId] = messages
    set({ openConversationMessages })
  },
  clearOpenConversationMessages: (conversationId) => {
    const conversations = get().openConversationMessages
    if (!conversations[conversationId]) {
      return
    }
    const openConversationMessages = { ...conversations }
    delete openConversationMessages[conversationId]
    set({ openConversationMessages })
  },
  setAllOpenConversationMessages: (conversationMessages) => {
    set({ openConversationMessages: conversationMessages })
  },
  clearAllOpenConversationMessages: () => {
    set({ openConversationMessages: {} })
  },
})
