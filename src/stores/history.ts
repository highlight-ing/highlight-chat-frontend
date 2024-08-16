import { StateCreator } from 'zustand'
import { ChatHistoryItem } from '@/types'

export interface HistoryState {
  history: ChatHistoryItem[]
}

export type HistorySlice = HistoryState & {
  setHistory: (chats: ChatHistoryItem[]) => void
}

export const initialHistoryState: HistoryState = {
  history: [],
}

export const createHistorySlice: StateCreator<HistorySlice> = (set) => ({
  ...initialHistoryState,
  setHistory: (chats: ChatHistoryItem[]) => {
    set({ history: chats })
  },
})
