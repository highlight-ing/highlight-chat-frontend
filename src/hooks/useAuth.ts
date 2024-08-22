import { refreshTokens } from '@/app/(app)/actions'
import { useStore } from '@/providers/store-provider'
import Highlight from '@highlight-ai/app-runtime'
import { decodeJwt } from 'jose'
import { useEffect, useRef } from 'react'

async function getNewTokens(): Promise<{ accessToken: string; refreshToken: string; authExpiration: number }> {
  console.log('got new tokens')
  const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await Highlight.auth.signIn()

  const payload = decodeJwt(newAccessToken)

  const exp = payload.exp ?? 0

  if (!payload.sub) {
    throw new Error('Invalid access token, missing subscriber id (user ID) in the payload.')
  }

  return { accessToken: newAccessToken, refreshToken: newRefreshToken, authExpiration: exp }
}

async function attemptToRefreshTokens(oldRefreshToken: string): Promise<{
  accessToken: string
  refreshToken: string
  authExpiration: number
}> {
  // Attempt to refresh the tokens
  try {
    const refreshTokensResponse = await refreshTokens(oldRefreshToken)

    console.log('[useAuth] Refreshed tokens from backend.')

    const payload = decodeJwt(refreshTokensResponse.access_token)

    return {
      accessToken: refreshTokensResponse.access_token,
      refreshToken: refreshTokensResponse.refresh_token,
      authExpiration: payload.exp ?? 0,
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
  let { accessToken, refreshToken, authExpiration, setAuth } = useStore((state) => ({
    accessToken: state.accessToken,
    refreshToken: state.refreshToken,
    setAuth: state.setAuth,
    authExpiration: state.authExpiration,
  }))

  // Keeps track of the promise to fetch/refresh tokens

  // Hook that checks if the auth state in Highlight has changed, if so,
  // we need to update the auth state in the store
  useEffect(() => {
    const subscription = Highlight.app.addListener('onAuthUpdate', () => {
      console.log('[useAuth] onAuthUpdate was fired from HL runtime, requesting new tokens.')
      getNewTokens()

      // TODO: This should trigger a refetch of all prompts, conversations, etc.
    })

    return () => subscription()
  }, [])

  /**
   * Fetches tokens from the auth store or fetches new ones if they don't exist.
   */
  async function getAccessToken() {
    // if there's an ongoing request, return the promise
    if (requestPromise) {
      return requestPromise
    }

    // Check if the store already has tokens
    if (!accessToken || !refreshToken || !authExpiration) {
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

  return { getAccessToken }
}
