import Highlight from '@highlight-ai/app-runtime'
import { decodeJwt } from 'jose'

import { useStore } from '@/components/providers/store-provider'
import { refreshTokens, updateUserInfo } from '@/app/(app)/actions'

interface TokensResponse {
  accessToken: string
  refreshToken: string
  authExpiration: number
  userId?: string
}

async function getNewTokens(): Promise<TokensResponse> {
  const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await Highlight.auth.signIn()
  console.log('[useAuth] Got new tokens from Highlight.')
  updateUserInfo(newAccessToken)
  const payload = decodeJwt(newAccessToken)

  const exp = payload.exp ?? 0

  if (!payload.sub) {
    throw new Error('Invalid access token, missing subscriber id (user ID) in the payload.')
  }

  return { accessToken: newAccessToken, refreshToken: newRefreshToken, authExpiration: exp, userId: payload.sub }
}

async function attemptToRefreshTokens(oldRefreshToken: string): Promise<TokensResponse> {
  // Attempt to refresh the tokens
  try {
    const refreshTokensResponse = await refreshTokens(oldRefreshToken)

    console.log('[useAuth] Refreshed tokens from backend.')

    updateUserInfo(refreshTokensResponse.access_token)

    const payload = decodeJwt(refreshTokensResponse.access_token)

    return {
      accessToken: refreshTokensResponse.access_token,
      refreshToken: refreshTokensResponse.refresh_token,
      authExpiration: payload.exp ?? 0,
      userId: payload.sub,
    }
  } catch (error) {
    // If the refresh fails, get new tokens
    console.log('[useAuth] Refresh failed, getting new tokens.')
    return await getNewTokens()
  }
}

let requestPromise: Promise<string> | null = null

/**
 * Hook that handles automatically fetching tokens, refreshing them, etc.
 * @todo Add persistant store to Zustand, this hook matter that much without persistant storage.
 */
export default function useAuth() {
  let { accessToken, refreshToken, authExpiration, setAuth, userId } = useStore((state) => ({
    accessToken: state.accessToken,
    refreshToken: state.refreshToken,
    setAuth: state.setAuth,
    authExpiration: state.authExpiration,
    userId: state.userId,
  }))

  /**
   * Fetches tokens from the auth store or fetches new ones if they don't exist.
   */
  async function getAccessToken(forceNewTokens: boolean = false) {
    // if there's an ongoing request, return the promise
    if (requestPromise) {
      return requestPromise
    }

    // Check if the store already has tokens
    if (!accessToken || !refreshToken || !authExpiration || forceNewTokens) {
      console.log(accessToken, refreshToken, authExpiration, forceNewTokens)
      console.log('[useAuth] No existing auth tokens found, getting new tokens.')
      requestPromise = getNewTokens()
        .then((tokens) => {
          setAuth(tokens)
          return tokens.accessToken
        })
        .finally(() => {
          requestPromise = null
        })

      return requestPromise
    }

    // Check if the current tokens are expired
    if (authExpiration !== undefined && Date.now() >= authExpiration * 1000) {
      console.log('[useAuth] Auth tokens expired, attempting to refresh.', Date.now(), authExpiration * 1000)
      requestPromise = attemptToRefreshTokens(refreshToken!)
        .then((tokens) => {
          setAuth(tokens)
          return tokens.accessToken
        })
        .finally(() => {
          requestPromise = null
        })

      return requestPromise
    }

    if (!accessToken) {
      throw new Error('No access token found in the store (this should never happen).')
    }

    return accessToken
  }

  return { getAccessToken, userId }
}
