import { StateCreator } from "zustand";

/**
 * Store that deals with the current conversation.
 */

export interface ConversationState {
  conversationId: string | null;
}

export type ConversationSlice = ConversationState & {
  resetConversationId: () => void;
  getOrCreateConversationId: () => string;
};

export const initialConversationState: ConversationState = {
  conversationId: null,
};

export const createConversationSlice: StateCreator<ConversationSlice> = (
  set
) => ({
  ...initialConversationState,
  resetConversationId: () => set({ conversationId: null }),
  getOrCreateConversationId: () => {
    const conversationId = Math.random().toString(36).substring(2, 15);
    set({ conversationId });
    return conversationId;
  },
});
