import { createStore as create } from "zustand/vanilla";

import {
  MessagesSlice,
  MessagesState,
  createMessagesSlice,
  initialMessagesState,
} from "./messages";

import {
  AuthSlice,
  AuthState,
  createAuthSlice,
  initialAuthState,
} from "./auth";

import {
  ChatInputSlice,
  ChatInputState,
  createChatInputSlice,
  initialChatInputState,
} from "./chat-input";

import {
  ChatAttachmentsSlice,
  ChatAttachmentsState,
  createChatAttachmentsSlice,
  initialChatAttachmentsState,
} from "./chat-attachments";
import {
  ConversationSlice,
  ConversationState,
  createConversationSlice,
  initialConversationState,
} from "./conversation";

/**
 * To add a new store, create a new file and reference messages.ts
 *
 * Then follow the same pattern used below, simply add the types, set the defaultState,
 * and add it to the store.
 */

export type StoreState = MessagesState &
  AuthState &
  ChatInputState &
  ChatAttachmentsState &
  ConversationState;

export type Store = MessagesSlice &
  AuthSlice &
  ChatInputSlice &
  ChatAttachmentsSlice &
  ConversationSlice;

const defaultState: StoreState = {
  ...initialMessagesState,
  ...initialAuthState,
  ...initialChatInputState,
  ...initialChatAttachmentsState,
  ...initialConversationState,
};

export const initStore: () => StoreState = () => {
  return defaultState;
};

export const createStore = (initState: StoreState = defaultState) => {
  return create<Store>()((...a) => ({
    ...initState,
    ...createMessagesSlice(...a),
    ...createAuthSlice(...a),
    ...createChatInputSlice(...a),
    ...createChatAttachmentsSlice(...a),
    ...createConversationSlice(...a),
  }));
};
