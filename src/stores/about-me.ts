import { StateCreator } from 'zustand'

export interface AboutMeState {
  aboutMe?: string[]
  lastMessageSentTimestamp: number
}

export type AboutMeSlice = AboutMeState & {
  setAboutMe: (aboutMe: string[]) => void
  updateLastMessageSentTimestamp: () => void
}

export const initialAboutMeState: AboutMeState = {
  aboutMe: undefined,
  lastMessageSentTimestamp: 0,
}

export const createAboutMeSlice: StateCreator<AboutMeSlice> = (set) => ({
  ...initialAboutMeState,
  setAboutMe: (aboutMe: string[]) => set({ aboutMe }),
  updateLastMessageSentTimestamp: () => set({ lastMessageSentTimestamp: Date.now() }),
})
