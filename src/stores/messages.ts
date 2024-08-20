import { StateCreator } from 'zustand'
import { Message } from '@/types'

export interface MessagesState {
  messages: Message[]
  isLoadingMessages: boolean
}

export type MessagesSlice = MessagesState & {
  addMessage: (message: Message) => void
  updateLastMessage: (message: Message) => void
  clearMessages: () => void
  setIsLoadingMessages: (isLoading: boolean) => void
}

export const initialMessagesState: MessagesState = {
  messages: [],
  isLoadingMessages: false,
}

export const createMessagesSlice: StateCreator<MessagesSlice> = (set) => ({
  ...initialMessagesState,
  addMessage: (message: Message) => set((state) => ({ messages: [...state.messages, message] })),
  updateLastMessage: (message: Message) => set((state) => ({ messages: [...state.messages.slice(0, -1), message] })),
  clearMessages: () => set({ messages: [] }),
  setIsLoadingMessages: (isLoading: boolean) => set({ isLoadingMessages: isLoading }),
})
