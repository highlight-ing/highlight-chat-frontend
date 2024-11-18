import { StateCreator } from 'zustand'

export interface ThinkingMessagesState {
  thinkingMessages: { [conversationId: string]: string[] }
}

export type ThinkingMessagesSlice = ThinkingMessagesState & {
  addThinkingMessage: (conversationId: string, messageId: string) => void
}

export const initialThinkingMessagesState: ThinkingMessagesState = {
  thinkingMessages: {},
}

export const createThinkingMessagesSlice: StateCreator<ThinkingMessagesSlice> = (set, get) => ({
  ...initialThinkingMessagesState,
  addThinkingMessage: (conversationId: string, messageId: string) => {
    const state = get()
    set({
      thinkingMessages: {
        ...state.thinkingMessages,
        [conversationId]: [...(state.thinkingMessages[conversationId] || []), messageId]
      }
    })
  },
})
