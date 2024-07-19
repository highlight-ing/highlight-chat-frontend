import { StateCreator } from "zustand";

/**
 * Store that deals with the text input for Highlight Chat.
 */

export interface ChatInputState {
  input: string;
  inputIsDisabled: boolean;
}

export type ChatInputSlice = ChatInputState & {
  setInput: (input: string) => void;
  clearInput: () => void;
  setInputIsDisabled: (isDisabled: boolean) => void;
};

export const initialChatInputState: ChatInputState = {
  input: "",
  inputIsDisabled: false,
};

export const createChatInputSlice: StateCreator<ChatInputSlice> = (set) => ({
  ...initialChatInputState,
  setInput: (input: string) => set({ input }),
  clearInput: () => set({ input: "" }),
  setInputIsDisabled: (isDisabled: boolean) =>
    set({ inputIsDisabled: isDisabled }),
});
