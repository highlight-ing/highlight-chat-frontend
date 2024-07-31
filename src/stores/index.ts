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
import {
  PromptSlice,
  PromptState,
  createPromptSlice,
  initialPromptState,
} from "./prompt";
import {
  PromptsSlice,
  PromptsState,
  createPromptsSlice,
  initialPromptsState,
} from "./prompts";
import {
  AboutMeSlice,
  AboutMeState,
  createAboutMeSlice,
  initialAboutMeState,
} from "./about-me";
import {
  HighlightContextSlice,
  HighlightContextState,
  createHighlightContextSlice,
  initialHighlightContextState,
} from "./highlight-context";
import {
  ModalsSlice,
  ModalsState,
  createModalsSlice,
  initialModalsState,
} from "./modals";
import {createHistorySlice, HistorySlice, HistoryState, initialHistoryState} from "@/stores/history";

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
  ConversationState &
  PromptState &
  AboutMeState &
  HighlightContextState &
  ModalsState &
  HistoryState;

export type Store = MessagesSlice &
  AuthSlice &
  ChatInputSlice &
  ChatAttachmentsSlice &
  ConversationSlice &
  PromptSlice &
  PromptsSlice &
  AboutMeSlice &
  HighlightContextSlice &
  ModalsSlice &
  HistorySlice;

const defaultState: StoreState = {
  ...initialMessagesState,
  ...initialAuthState,
  ...initialChatInputState,
  ...initialChatAttachmentsState,
  ...initialConversationState,
  ...initialPromptState,
  ...initialPromptsState,
  ...initialAboutMeState,
  ...initialHighlightContextState,
  ...initialModalsState,
  ...initialHistoryState
};

export const initStore: () => StoreState = () => {
  return defaultState;
};

export const createStore = (initState: StoreState = defaultState) => {
  return create<Store>()((...a) => ({
    ...initState,
    ...createMessagesSlice(...a),
    ...createHistorySlice(...a),
    ...createAuthSlice(...a),
    ...createChatInputSlice(...a),
    ...createChatAttachmentsSlice(...a),
    ...createConversationSlice(...a),
    ...createPromptSlice(...a),
    ...createPromptsSlice(...a),
    ...createAboutMeSlice(...a),
    ...createHighlightContextSlice(...a),
    ...createModalsSlice(...a),
  }));
};
