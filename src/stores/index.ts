import { createHistorySlice, HistorySlice, HistoryState, initialHistoryState } from '@/stores/history'
import { createToastSlice, initialToastState, ToastSlice, ToastState } from '@/stores/toasts'
import { persist } from 'zustand/middleware'
import { createStore as create } from 'zustand/vanilla'

import { AboutMeSlice, AboutMeState, createAboutMeSlice, initialAboutMeState } from './about-me'
import { AuthSlice, AuthState, createAuthSlice, initialAuthState } from './auth'
import {
  ChatAttachmentsSlice,
  ChatAttachmentsState,
  createChatAttachmentsSlice,
  initialChatAttachmentsState,
} from './chat-attachments'
import { ChatInputSlice, ChatInputState, createChatInputSlice, initialChatInputState } from './chat-input'
import { ConversationSlice, ConversationState, createConversationSlice, initialConversationState } from './conversation'
import {
  createHighlightContextSlice,
  HighlightContextSlice,
  HighlightContextState,
  initialHighlightContextState,
} from './highlight-context'
import { createIntegrationsSlice, initialIntegrationsState, IntegrationsSlice, IntegrationsState } from './integrations'
import { createMessagesSlice, initialMessagesState, MessagesSlice, MessagesState } from './messages'
import { createModalsSlice, initialModalsState, ModalsSlice, ModalsState } from './modals'
import {
  createPendingCreateActionsSlice,
  initialPendingCreateActionsState,
  PendingCreateActionsSlice,
  PendingCreateActionsState,
} from './pending-create-actions'
import { createPromptSlice, initialPromptState, PromptSlice, PromptState } from './prompt'
import {
  createPromptEditorSlice,
  initialPromptEditorState,
  PromptEditorSlice,
  PromptEditorState,
} from './prompt-editor'
import { createPromptsSlice, initialPromptsState, PromptsSlice } from './prompts'

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
  HistoryState &
  PromptEditorState &
  ToastState &
  IntegrationsState &
  PendingCreateActionsState

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
  HistorySlice &
  PromptEditorSlice &
  ToastSlice &
  IntegrationsSlice &
  PendingCreateActionsSlice

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
  ...initialHistoryState,
  ...initialPromptEditorState,
  ...initialToastState,
  ...initialIntegrationsState,
  ...initialPendingCreateActionsState,
}

export const initStore: () => StoreState = () => {
  return defaultState
}

export const createStore = (initState: StoreState = defaultState) => {
  return create<Store>()(
    persist(
      (...a) => ({
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
        ...createPromptEditorSlice(...a),
        ...createToastSlice(...a),
        ...createIntegrationsSlice(...a),
        ...createPendingCreateActionsSlice(...a),
      }),
      {
        name: 'highlight-store',
        partialize: (state) => ({
          // This is the "Prompt Editor" onboarding, we persist this state because
          // we want to only show the onboarding once automatically.
          onboarding: {
            hasOnboardedOnceBefore: state.onboarding.hasOnboardedOnceBefore,
          },
          /**
           * Store the auth state in persistent storage.
           */
          accessToken: state.accessToken,
          refreshToken: state.refreshToken,
          userId: state.userId,
          userIsAnonymous: state.userIsAnonymous,
          authExpiration: state.authExpiration,
        }),
      },
    ),
  )
}
