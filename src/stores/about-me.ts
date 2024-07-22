import { StateCreator } from "zustand";

export interface AboutMeState {
  aboutMe?: string;
}

export type AboutMeSlice = AboutMeState & {
  setAboutMe: (aboutMe: string) => void;
};

export const initialAboutMeState: AboutMeState = {
  aboutMe: undefined,
};

export const createAboutMeSlice: StateCreator<AboutMeSlice> = (set) => ({
  ...initialAboutMeState,
  setAboutMe: (aboutMe: string) => set({ aboutMe }),
});
