import { refreshTokens } from '@/app/(app)/actions'
import { useStore } from '@/providers/store-provider'
import Highlight from '@highlight-ai/app-runtime'
import { decodeJwt } from 'jose'
import { useShallow } from 'zustand/react/shallow'

/**
 * Hook that handles automatically fetching tokens, refreshing them, etc.
 * @todo Add persistant store to Zustand, this hook matter that much without persistant storage.
 */
export default function useAuth() {
  let { accessToken, refreshToken, authExpiration, setAuth } = useStore(
    useShallow((state) => ({
      accessToken: state.accessToken,
      refreshToken: state.refreshToken,
      setAuth: state.setAuth,
      authExpiration: state.authExpiration,
    })),
  )

  async function getNewTokens() {
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await Highlight.auth.signIn()

    const payload = decodeJwt(newAccessToken)

    const exp = payload.exp

    if (!payload.sub) {
      throw new Error('Invalid access token, missing subscriber id (user ID) in the payload.')
    }

    const newUserId = payload.sub

    // Store the expiration time in the auth store
    setAuth({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      userId: newUserId,
      authExpiration: exp,
    })

    accessToken = newAccessToken
    refreshToken = newRefreshToken
    authExpiration = exp
  }

  async function attemptToRefreshTokens() {
    // Attempt to refresh the tokens
    try {
      const refreshTokensResponse = await refreshTokens(refreshToken!)

      console.log('[useAuth] Refreshed tokens from backend.')

      const payload = decodeJwt(refreshTokensResponse.access_token)

      console.log('[useAuth] Decoded payload', payload)

      setAuth({
        accessToken: refreshTokensResponse.access_token,
        refreshToken: refreshTokensResponse.refresh_token,
        authExpiration: payload.exp,
      })

      accessToken = refreshTokensResponse.access_token
      refreshToken = refreshTokensResponse.refresh_token
      authExpiration = payload.exp
    } catch (error) {
      // If the refresh fails, get new tokens
      console.log('[useAuth] Refresh failed, getting new tokens.')
      await getNewTokens()
    }
  }

  /**
   * Fetches tokens from the auth store or fetches new ones if they don't exist.
   */
  async function getAccessToken() {
    // Check if the store already has tokens
    if (!accessToken || !refreshToken || !authExpiration) {
      console.log('[useAuth] No existing auth tokens found, getting new tokens.')
      await getNewTokens()
    }

    // Check if the current tokens are expired
    if (authExpiration && Date.now() >= authExpiration * 1000) {
      console.log('[useAuth] Auth tokens expired, attempting to refresh.', Date.now(), authExpiration * 1000)
      await attemptToRefreshTokens()
    }

    if (!accessToken) {
      // The new access token should be set by now...
      throw new Error("Access token wasn't set after trying to refresh/generate a new one.")
    }

    return accessToken
  }

  return { getAccessToken }
}
