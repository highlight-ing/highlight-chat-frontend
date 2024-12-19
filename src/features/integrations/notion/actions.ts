'use server'

const HIGHLIGHT_BACKEND_BASE_URL = 'https://backend.highlightai.com'

/**
 * Returns the latest Notion API token for the given user by their ID.
 */
export async function getNotionTokenForUser(hlAccessToken: string) {
  const response = await fetch(`${HIGHLIGHT_BACKEND_BASE_URL}/v1/notion/token`, {
    headers: {
      Authorization: `Bearer ${hlAccessToken}`,
    },
  })

  if (response.status === 404) {
    // User doesn't have a Notion connection created yet.
    return null
  }

  if (!response.ok) {
    console.error('Failed to get Notion token for user. HTTP code:', response.status, await response.text())
    throw new Error('Failed to get Notion token for user.')
  }

  const data = await response.json()

  if (!data.token) {
    console.error('Failed to get Notion token for user. No token found in response body.')
    throw new Error('Failed to get Notion token for user. No token found in response body.')
  }

  return data.token as string
}

/**
 * Creates a magic sign in link for Notion.
 * We will redirect the user to this link to create a connection.
 */
export async function createMagicLinkForNotion(accessToken: string) {
  const response = await fetch(
    `${HIGHLIGHT_BACKEND_BASE_URL}/v1/auth/magiclink?redirect_uri=https://auth.highlight.ing/connect/notion`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  )

  if (!response.ok) {
    console.warn('Failed to create Notion connect link', response.status, await response.text())
    throw new Error('Failed to create Notion connect link')
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

export async function checkNotionConnectionStatus(accessToken: string) {
  const response = await fetch(`${HIGHLIGHT_BACKEND_BASE_URL}/v1/notion`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    console.warn('Failed to check if Notion is connected', response.status, await response.text())
    throw new Error('Failed to check if Notion is connected')
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
