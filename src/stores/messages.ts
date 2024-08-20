import { StateCreator } from 'zustand'
import { Message } from '@/types'

export interface MessagesState {
  messages: Message[]
  isLoadingMessages: boolean
  isChatting: boolean
}

export type MessagesSlice = MessagesState & {
  addMessage: (message: Message) => void
  updateLastMessage: (message: Message) => void
  clearMessages: () => void
  setIsLoadingMessages: (isLoading: boolean) => void
  setIsChatting: (isChatting: boolean) => void
}

export const initialMessagesState: MessagesState = {
  messages: [],
  isLoadingMessages: false,
  isChatting: false,
}

export const createMessagesSlice: StateCreator<MessagesSlice> = (set) => ({
  ...initialMessagesState,
  addMessage: (message: Message) => set((state) => ({ messages: [...state.messages, message] })),
  updateLastMessage: (message: Message) => set((state) => ({ messages: [...state.messages.slice(0, -1), message] })),
  clearMessages: () => set({ messages: [], isChatting: false }),
  setIsLoadingMessages: (isLoading: boolean) => set({ isLoadingMessages: isLoading }),
  setIsChatting: (isChatting: boolean) => set({ isChatting }),
})
