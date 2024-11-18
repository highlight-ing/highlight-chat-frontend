import { StateCreator } from 'zustand'

/**
 * Store that deals with the text input for Highlight Chat.
 */

export interface ChatInputState {
  fileInputRef: React.RefObject<HTMLInputElement> | null
  input: string
  inputIsDisabled: boolean
  inputOverride: string | null
}

export type ChatInputSlice = ChatInputState & {
  setFileInputRef: (ref: React.RefObject<HTMLInputElement>) => void
  setInput: (input: string) => void
  setInputIsDisabled: (isDisabled: boolean) => void
  setInputOverride: (input: string) => void
  clearInputOverride: () => void
}

export const initialChatInputState: ChatInputState = {
  fileInputRef: null,
  input: '',
  inputIsDisabled: false,
  inputOverride: null,
}

export const createChatInputSlice: StateCreator<ChatInputSlice> = (set) => ({
  ...initialChatInputState,
  setInput: (input: string) => set({ input }),
  setInputOverride: (inputOverride: string) => set({ inputOverride }),
  clearInputOverride: () => set({ inputOverride: null }),
  setInputIsDisabled: (isDisabled: boolean) => set({ inputIsDisabled: isDisabled }),
  setFileInputRef: (ref: React.RefObject<HTMLInputElement>) => {
    // Don't persist the ref to avoid circular references
    set((state: ChatInputState) => ({ ...state, fileInputRef: ref }), false)
  },
})
