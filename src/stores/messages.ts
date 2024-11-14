import { StateCreator } from 'zustand'
import { Message } from '@/types'

export interface MessagesState {
  conversationMessages: Record<string, Message[]>
}

export type MessagesSlice = MessagesState & {
  addConversationMessage: (conversationId: string, messages: Message) => void
  updateLastConversationMessage: (conversationId: string, messages: Message, personalization?: boolean) => void
  updateConversationMessages: (conversationId: string, messages: Message[]) => void
  clearConversationMessages: (conversationId: string) => void
  setAllConversationMessages: (conversationMessages: Record<string, Message[]>) => void
  clearAllConversationMessages: () => void
  clearAllOtherConversationMessages: (conversationId: string) => void
  getConversationMessages: (conversationId: string) => Message[] | undefined
  getLastConversationMessage: (conversationId: string) => Message | undefined
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
  updateLastConversationMessage: (conversationId, message, personalization) => {
    const openConversationMessages = { ...get().conversationMessages }
    if (!openConversationMessages[conversationId]?.length) {
      console.log('no messages in conversation', conversationId, get().conversationMessages)
      return
    }
    const lastMessageIndex = openConversationMessages[conversationId].findLastIndex((msg) => msg.role === message.role)
    if (lastMessageIndex === -1) {
      get().addConversationMessage(conversationId, message)
    } else {
      openConversationMessages
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
  getConversationMessages: (conversationId) => {
    const conversationMessages = get().conversationMessages
    return conversationMessages[conversationId]
  },
  clearAllOtherConversationMessages: (conversationId) => {
    const conversationMessages: Record<string, Message[]> = {}
    conversationMessages[conversationId] = get().conversationMessages[conversationId]
    set({ conversationMessages })
  },
  getLastConversationMessage: (conversationId) => {
    const conversationMessages = get().conversationMessages
    if (!conversationMessages[conversationId]?.length) {
      return undefined
    }
    return conversationMessages[conversationId][conversationMessages[conversationId].length - 1]
  },
})
