import { StateCreator } from "zustand";

export interface AuthState {
  accessToken?: string;
  refreshToken?: string;
  userId?: string;
  authExpiration?: number;
}

export type AuthSlice = AuthState & {
  setAuth: (auth: AuthState) => void;
};

export const initialAuthState: AuthState = {
  accessToken: undefined,
  refreshToken: undefined,
  userId: undefined,
  authExpiration: undefined,
};

export const createAuthSlice: StateCreator<AuthSlice> = (set) => ({
  ...initialAuthState,
  setAuth: (auth: AuthState) => set(auth),
});
