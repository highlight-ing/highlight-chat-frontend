import { StateCreator } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import { Store } from '.'
import { ChatHistoryItem, Message } from '@/types'

/**
 * Store that deals with the current conversation.
 */

export interface ConversationState {
  isConversationLoading: boolean
  conversationId: string | undefined
  openConversations: ChatHistoryItem[]
}

export type ConversationSlice = ConversationState & {
  resetConversationId: () => void
  getOrCreateConversationId: () => string
  startNewConversation: () => void
  setConversationId: (conversationId: string) => void
  setOpenConversations: (conversations: ChatHistoryItem[]) => void
  addOrUpdateOpenConversation: (conversation: ChatHistoryItem) => void
  removeOpenConversation: (conversationId: string) => void
  setConversationLoading: (isLoading: boolean) => void
  setShareId: (conversationId: string, shareId: string | null) => void
}

export const initialConversationState: ConversationState = {
  isConversationLoading: false,
  conversationId: undefined,
  openConversations: [],
}

export const createConversationSlice: StateCreator<Store, [], [], ConversationSlice> = (set, get) => ({
  ...initialConversationState,
  resetConversationId: () => set({ conversationId: undefined }),
  getOrCreateConversationId: () => {
    if (!get().conversationId) {
      const newId = uuidv4()
      set({ conversationId: newId })
    }
    return get().conversationId!
  },
  setConversationId: (conversationId: string) => {
    set({ conversationId })
  },
  startNewConversation: () => {
    get().resetConversationId()
    get().clearInput()
    get().clearAttachments()
  },
  setOpenConversations: (conversations: ChatHistoryItem[]) => {
    set({ openConversations: conversations })
  },
  addOrUpdateOpenConversation: (conversation: ChatHistoryItem) => {
    const conversations = get().openConversations
    const conversationIndex = conversations?.findIndex((c) => c.id === conversation.id)
    if (conversationIndex === -1) {
      set({ openConversations: [...conversations, conversation] })
    } else {
      const updatedConversations = [...conversations]
      updatedConversations[conversationIndex] = conversation
      set({ openConversations: updatedConversations })
    }
  },
  removeOpenConversation: (conversationId: string) => {
    if (get().conversationId === conversationId) {
      get().startNewConversation()
    }
    const conversations = get().openConversations
    get().clearConversationMessages(conversationId)
    set({
      openConversations: conversations.filter((c) => c.id !== conversationId),
    })
  },
  setConversationLoading: (isLoading: boolean) => {
    set({ isConversationLoading: isLoading })
  },
  setShareId: (conversationId: string, shareId: string | null) => {
    const conversations = get().openConversations
    const updatedConversations = conversations.map((conv) =>
      conv.id === conversationId ? { ...conv, shared_id: shareId } : conv,
    )
    set({ openConversations: updatedConversations })

    // Also update the history if the conversation exists there
    const history = get().history
    const updatedHistory = history.map((conv) => (conv.id === conversationId ? { ...conv, shared_id: shareId } : conv))
    set({ history: updatedHistory })
  },
})
