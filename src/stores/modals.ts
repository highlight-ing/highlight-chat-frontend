import { StateCreator } from "zustand";

export interface ModalsState {
  errorModalOpen: boolean;
  errorModalMessage?: string;
}

export type ModalsSlice = ModalsState & {
  setErrorModalOpen: (open: boolean) => void;
  openErrorModal: (message: string) => void;
};

export const initialModalsState: ModalsState = {
  errorModalOpen: false,
  errorModalMessage: undefined,
};

export const createModalsSlice: StateCreator<ModalsSlice> = (set) => ({
  ...initialModalsState,
  setErrorModalOpen: (open: boolean) => set({ errorModalOpen: open }),
  openErrorModal: (message: string) =>
    set({ errorModalOpen: true, errorModalMessage: message }),
});
