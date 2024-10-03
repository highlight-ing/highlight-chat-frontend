'use server'

const HIGHLIGHT_BACKEND_BASE_URL = 'https://backend.workers.highlight.ing'

const ERROR_MESSAGES = {
  INVALID_AUTH_TOKEN: 'Invalid authorization token. Try refreshing Highlight Chat.',
}

/**
 * Returns the latest Linear API token for the given user by their ID.
 */
export async function getLinearTokenForUser(hlAccessToken: string) {
  const response = await fetch(`${HIGHLIGHT_BACKEND_BASE_URL}/v1/linear/token`, {
    headers: {
      Authorization: `Bearer ${hlAccessToken}`,
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
export async function createMagicLinkForLinear(accessToken: string) {
  const response = await fetch(
    `${HIGHLIGHT_BACKEND_BASE_URL}/v1/auth/magiclink?redirect_uri=https://auth.highlight.ing/connect/linear`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  )

  if (!response.ok) {
    console.warn('Failed to create Linear connect link', response.status, await response.text())
    throw new Error('Failed to create Linear connect link')
  }

  let data
  try {
    data = await response.json()
  } catch (e) {
    console.warn('Failed to parse response as JSON', e, await response.text())
    throw e
  }

  return data.url
}

export async function checkLinearConnectionStatus(accessToken: string) {
  const response = await fetch(`${HIGHLIGHT_BACKEND_BASE_URL}/v1/linear`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    console.warn('Failed to check if Linear is connected', response.status, await response.text())
    throw new Error('Failed to check if Linear is connected')
  }

  let data
  try {
    data = await response.json()
  } catch (e) {
    console.warn('Failed to parse response as JSON', e, await response.text())
    throw e
  }

  return data.connected
}

export async function createLinearClientForUser(userId: string) {
  // Make an outgoing fetch request to Highlight backend to get the user's Linear API key
  // const linearToken = await getLinearTokenForUser(userId)
  // return new LinearClient({
  //   accessToken: linearToken,
  // })
}
