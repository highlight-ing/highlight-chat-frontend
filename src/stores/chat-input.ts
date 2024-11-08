import { StateCreator } from 'zustand'

/**
 * Store that deals with the text input for Highlight Chat.
 */

export interface ChatInputState {
  inputOverride: string | null
  inputIsDisabled: boolean
  fileInputRef?: React.RefObject<HTMLInputElement>
}

export type ChatInputSlice = ChatInputState & {
  setInputOverride: (input: string | null) => void
  clearInputOverride: () => void
  setInputIsDisabled: (isDisabled: boolean) => void
  setFileInputRef: (ref: React.RefObject<HTMLInputElement>) => void
}

export const initialChatInputState: ChatInputState = {
  inputOverride: null,
  inputIsDisabled: false,
  fileInputRef: undefined,
}

export const createChatInputSlice: StateCreator<ChatInputSlice> = (set) => ({
  ...initialChatInputState,
  setInputOverride: (input: string | null) => set({ inputOverride: input }),
  clearInputOverride: () => set({ inputOverride: null }),
  setInputIsDisabled: (isDisabled: boolean) => set({ inputIsDisabled: isDisabled }),
  setFileInputRef: (ref: React.RefObject<HTMLInputElement>) => set({ fileInputRef: ref }),
})
