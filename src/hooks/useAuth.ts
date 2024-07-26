import { refreshTokens } from "@/app/(app)/actions";
import { useStore } from "@/providers/store-provider";
import Highlight from "@highlight-ai/app-runtime";
import { decodeJwt } from "jose";

/**
 * Hook that handles automatically fetching tokens, refreshing them, etc.
 */
export default function useAuth() {
  const { accessToken, refreshToken, authExpiration, setAuth } = useStore(
    (state) => ({
      accessToken: state.accessToken,
      refreshToken: state.refreshToken,
      setAuth: state.setAuth,
      authExpiration: state.authExpiration,
    })
  );

  async function getNewTokens() {
    const { accessToken, refreshToken } = await Highlight.auth.signIn();

    const payload = decodeJwt(accessToken);

    const exp = payload.exp;

    if (!payload.sub) {
      throw new Error(
        "Invalid access token, missing subscriber id (user ID) in the payload."
      );
    }

    const userId = payload.sub;

    // Store the expiration time in the auth store
    setAuth({ accessToken, refreshToken, userId, authExpiration: exp });

    return accessToken;
  }

  /**
   * Fetches tokens from the auth store or fetches new ones if they don't exist.
   */
  async function getAccessToken() {
    let validAccessToken;

    // Check if the store already has tokens
    if (!accessToken || !refreshToken || !authExpiration) {
      console.log(
        "[useAuth] No existing auth tokens found, getting new tokens."
      );
      validAccessToken = await getNewTokens();
    }

    // Check if the current tokens are expired
    if (Date.now() > authExpiration!) {
      // Attempt to refresh the tokens
      try {
        const refreshTokensResponse = await refreshTokens(refreshToken!);

        console.log("[useAuth] Refreshed tokens from backend.");

        setAuth({
          accessToken: refreshTokensResponse.access_token,
          refreshToken: refreshTokensResponse.refresh_token,
          authExpiration: refreshTokensResponse.expires_in,
        });

        validAccessToken = refreshTokensResponse.access_token;
      } catch (error) {
        // If the refresh fails, get new tokens
        console.log("[useAuth] Refresh failed, getting new tokens.");
        validAccessToken = await getNewTokens();
      }
    }

    if (!validAccessToken) {
      throw new Error(
        "Access token wasn't set after trying to refresh/generate a new one."
      );
    }

    return validAccessToken;
  }

  return { getAccessToken };
}
