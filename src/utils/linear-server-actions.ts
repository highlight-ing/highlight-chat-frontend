'use server'

import { validateUserAuth } from '@/lib/auth'

const HIGHLIGHT_BACKEND_BASE_URL = 'http://localhost:8787/v1'

const ERROR_MESSAGES = {
  INVALID_AUTH_TOKEN: 'Invalid authorization token. Try refreshing Highlight Chat.',
}

/**
 * Returns the latest Linear API token for the given user by their ID.
 */
export async function getLinearTokenForUser(accessToken: string) {
  let userId: string
  try {
    userId = await validateUserAuth(accessToken)
  } catch (error) {
    return { error: ERROR_MESSAGES.INVALID_AUTH_TOKEN }
  }

  const response = await fetch(`${HIGHLIGHT_BACKEND_BASE_URL}/linear/token/${userId}`, {
    headers: {
      Authorization: `Token ${process.env.HIGHLIGHT_CHAT_API_TOKEN}`,
    },
  })

  if (response.status === 404) {
    // User doesn't have a Linear connection created yet.
    return null
  }

  if (!response.ok) {
    console.error('Failed to get Linear token for user. HTTP code:', response.status, await response.text())
    throw new Error('Failed to get Linear token for user.')
  }

  const data = await response.json()

  if (!data.token) {
    console.error('Failed to get Linear token for user. No token found in response body.')
    throw new Error('Failed to get Linear token for user. No token found in response body.')
  }

  return data.token as string
}

/**
 * Creates a magic sign in link for Linear.
 * We will redirect the user to this link to create a connection.
 */
export async function createMagicLinkForLinear(accessToken: string) {}

export async function createLinearClientForUser(userId: string) {
  // Make an outgoing fetch request to Highlight backend to get the user's Linear API key
  // const linearToken = await getLinearTokenForUser(userId)
  // return new LinearClient({
  //   accessToken: linearToken,
  // })
}
