import { StateCreator } from 'zustand'

export interface AuthState {
  accessToken?: string
  refreshToken?: string
  userId?: string
  /**
   * Highlight supports anonymous accounts, if the user is anonymous, we should alter
   * behavior, like preventing them from creating prompts until they sign in fully.
   */
  userIsAnonymous?: boolean
  /**
   * Stores when the access token expires.
   */
  authExpiration?: number
}

export type AuthSlice = AuthState & {
  setAuth: (auth: AuthState) => void
  setUserId: (userId: string) => void
}

export const initialAuthState: AuthState = {
  accessToken: undefined,
  refreshToken: undefined,
  userId: undefined,
  userIsAnonymous: undefined,
  authExpiration: undefined,
}

export const createAuthSlice: StateCreator<AuthSlice> = (set) => ({
  ...initialAuthState,
  setAuth: (auth: AuthState) => set(auth),
  setUserId: (userId: string) => set({ userId }),
})
