import { useStore } from "@/providers/store-provider";
import { useEffect } from "react";
import Highlight from "@highlight-ai/app-runtime";

/**
 * Hook that handles automatically fetching tokens, refreshing them, etc.
 */
export default function useAuth() {
  const { setAccessToken, setRefreshToken } = useStore((state) => ({
    accessToken: state.accessToken,
    refreshToken: state.refreshToken,
    setAccessToken: state.setAccessToken,
    setRefreshToken: state.setRefreshToken,
  }));

  /**
   * Fetches tokens from the auth store or fetches new ones if they don't exist.
   */
  async function getTokens() {
    // TODO: refactor this to take token refreshing into account.
    const { accessToken, refreshToken } = await Highlight.auth.signIn();
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);

    return { accessToken, refreshToken };
  }

  return { getTokens };
}
