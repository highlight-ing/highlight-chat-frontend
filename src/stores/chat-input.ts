import { StateCreator } from 'zustand'
import { ConversationData } from '@highlight-ai/app-runtime'

/**
 * Store that deals with the text input for Highlight Chat.
 */

export interface ChatInputState {
  input: string
  inputIsDisabled: boolean
  fileInputRef?: React.RefObject<HTMLInputElement>
  selectedConversation?: string
}

export type ChatInputSlice = ChatInputState & {
  setInput: (input: string) => void
  clearInput: () => void
  setInputIsDisabled: (isDisabled: boolean) => void
  setFileInputRef: (ref: React.RefObject<HTMLInputElement>) => void
  setSelectedConversation: (conversation: string | undefined) => void
}

export const initialChatInputState: ChatInputState = {
  input: '',
  inputIsDisabled: false,
  fileInputRef: undefined,
  selectedConversation: undefined,
}

export const createChatInputSlice: StateCreator<ChatInputSlice> = (set) => ({
  ...initialChatInputState,
  setInput: (input: string) => set({ input }),
  clearInput: () => set({ input: '' }),
  setInputIsDisabled: (isDisabled: boolean) => set({ inputIsDisabled: isDisabled }),
  setFileInputRef: (ref: React.RefObject<HTMLInputElement>) => set({ fileInputRef: ref }),
  setSelectedConversation: (conversation: string | undefined) => set({ selectedConversation: conversation }),
})
