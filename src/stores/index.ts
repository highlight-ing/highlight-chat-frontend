import { createStore as create } from "zustand/vanilla";
import {
  MessagesSlice,
  MessagesState,
  createMessagesSlice,
  initialMessagesState,
} from "./messages";

export type StoreState = MessagesState;

export type Store = MessagesSlice;

const defaultState: StoreState = {
  ...initialMessagesState,
};

export const initStore: () => StoreState = () => {
  return defaultState;
};

export const createStore = (initState: StoreState = defaultState) => {
  return create<Store>()((...a) => ({
    ...initState,
    ...createMessagesSlice(...a),
  }));
};
