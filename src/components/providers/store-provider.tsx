import { createContext, useContext, useRef, type ReactNode } from 'react'
/**
 * This is setup to support Next.JS and our Zustand store
 * This is all boilerplate
 * @see https://github.com/pmndrs/zustand/discussions/2326
 */

import { createStore, initStore, Store } from '@/stores'
import { useStore as useZustandStore, type StoreApi } from 'zustand'

export const StoreContext = createContext<StoreApi<Store> | null>(null)

export interface StoreState {
  thinkingMessages: { [conversationId: string]: string[] }
  addThinkingMessage: (conversationId: string, messageId: string) => void
}

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const storeRef = useRef<StoreApi<Store>>()
  if (!storeRef.current) storeRef.current = createStore(initStore())

  return <StoreContext.Provider value={storeRef.current}>{children}</StoreContext.Provider>
}

export const useStore = <T,>(selector: (store: Store) => T): T => {
  const storeContext = useContext(StoreContext)

  if (!storeContext) {
    throw new Error('useStore must be use within StoreProvider')
  }

  return useZustandStore(storeContext, selector)
}

export const create = createStore<StoreState>((set, get) => ({
  thinkingMessages: {},
  addThinkingMessage: (conversationId: string, messageId: string) => {
    set((state) => ({
      thinkingMessages: {
        ...state.thinkingMessages,
        [conversationId]: [...(state.thinkingMessages[conversationId] || []), messageId]
      }
    }))
  },
}))
