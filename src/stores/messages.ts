import { StateCreator } from "zustand";
import { Message } from "@/types";

export interface MessagesState {
  messages: Message[];
}

export type MessagesSlice = MessagesState & {
  addMessage: (message: Message) => void;
  updateLastMessage: (message: Message) => void;
  clearMessages: () => void;
};

export const initialMessagesState: MessagesState = {
  messages: [],
};

export const createMessagesSlice: StateCreator<MessagesSlice> = (set) => ({
  ...initialMessagesState,
  addMessage: (message: Message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  updateLastMessage: (message: Message) =>
    set((state) => ({ messages: [...state.messages.slice(0, -1), message] })),
  clearMessages: () => set({ messages: [] }),
});
