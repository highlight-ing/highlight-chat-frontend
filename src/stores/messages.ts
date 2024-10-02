import { StateCreator } from 'zustand'
import { Message, UserMessage, AssistantMessage } from '@/types'

export interface MessagesState {
  conversationMessages: Record<string, Message[]>
  failedMessage: string | null
}

export type MessagesSlice = MessagesState & {
  addConversationMessage: (conversationId: string, message: Message) => void
  updateLastConversationMessage: (conversationId: string, message: Partial<Message>, personalization?: boolean) => void
  updateConversationMessages: (conversationId: string, messages: Message[]) => void
  clearConversationMessages: (conversationId: string) => void
  setAllConversationMessages: (conversationMessages: Record<string, Message[]>) => void
  clearAllConversationMessages: () => void
  clearAllOtherConversationMessages: (conversationId: string) => void
  deleteMessage: (conversationId: string, messageId: string) => void
}

export const initialMessagesState: MessagesState = {
  conversationMessages: {},
  failedMessage: null,
}

export const createMessagesSlice: StateCreator<MessagesSlice> = (set, get) => ({
  ...initialMessagesState,
  addConversationMessage: (conversationId, message) => {
    set((state) => {
      const openConversationMessages = { ...state.conversationMessages }
      if (!openConversationMessages[conversationId]) {
        openConversationMessages[conversationId] = []
      }
      openConversationMessages[conversationId].push(message)
      return { conversationMessages: openConversationMessages }
    })
  },
  updateLastConversationMessage: (conversationId, message, personalization) => {
    set((state) => {
      const openConversationMessages = { ...state.conversationMessages }
      if (!openConversationMessages[conversationId]?.length) {
        return state
      }
      const lastMessageIndex = openConversationMessages[conversationId].length - 1
      const lastMessage = openConversationMessages[conversationId][lastMessageIndex]

      openConversationMessages[conversationId][lastMessageIndex] = {
        ...lastMessage,
        ...message,
        id: lastMessage.id,
        role: lastMessage.role,
        error: message.error !== undefined ? message.error : lastMessage.error,
      }

      return { conversationMessages: openConversationMessages }
    })
  },
  updateConversationMessages: (conversationId, messages) => {
    set((state) => ({
      conversationMessages: {
        ...state.conversationMessages,
        [conversationId]: messages,
      },
    }))
  },
  clearConversationMessages: (conversationId) => {
    set((state) => {
      const openConversationMessages = { ...state.conversationMessages }
      delete openConversationMessages[conversationId]
      return { conversationMessages: openConversationMessages }
    })
  },
  setAllConversationMessages: (conversationMessages) => {
    set({ conversationMessages: conversationMessages })
  },
  clearAllConversationMessages: () => {
    set({ conversationMessages: {} })
  },
  clearAllOtherConversationMessages: (conversationId) => {
    set((state) => ({
      conversationMessages: {
        [conversationId]: state.conversationMessages[conversationId] || [],
      },
    }))
  },
  deleteMessage: (conversationId, messageId) => {
    set((state) => {
      const openConversationMessages = { ...state.conversationMessages }
      if (!openConversationMessages[conversationId]) {
        return state
      }
      openConversationMessages[conversationId] = openConversationMessages[conversationId].filter(
        (msg) => msg.id !== messageId,
      )
      return { conversationMessages: openConversationMessages }
    })
  },
})
