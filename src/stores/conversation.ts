import { StateCreator } from "zustand";
import { v4 as uuidv4 } from "uuid";

/**
 * Store that deals with the current conversation.
 */

export interface ConversationState {
  conversationId: string | undefined;
}

export type ConversationSlice = ConversationState & {
  resetConversationId: () => void;
  getOrCreateConversationId: () => string;
};

export const initialConversationState: ConversationState = {
  conversationId: undefined,
};

export const createConversationSlice: StateCreator<ConversationSlice> = (
  set
) => ({
  ...initialConversationState,
  resetConversationId: () => set({ conversationId: undefined }),
  getOrCreateConversationId: () => {
    const newId = uuidv4();

    set({ conversationId: newId });

    return newId;
  },
});
