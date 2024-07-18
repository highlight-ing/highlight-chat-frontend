import { StateCreator } from "zustand";

export interface AuthState {
  accessToken?: string;
  refreshToken?: string;
}

export type AuthSlice = AuthState & {
  setAccessToken: (accessToken: string) => void;
  setRefreshToken: (refreshToken: string) => void;
  clearTokens: () => void;
};

export const initialAuthState: AuthState = {
  accessToken: undefined,
  refreshToken: undefined,
};

export const createAuthSlice: StateCreator<AuthSlice> = (set) => ({
  ...initialAuthState,
  setAccessToken: (accessToken: string) => set({ accessToken }),
  setRefreshToken: (refreshToken: string) => set({ refreshToken }),
  clearTokens: () => set({ accessToken: undefined, refreshToken: undefined }),
});
