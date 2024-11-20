'use server'

const HIGHLIGHT_BACKEND_BASE_URL = 'https://backend.highlightai.com'

/**
 * Uses the more modern connections endpoint to check if an integration is connected.
 */
export async function checkIntegrationStatus(hlAccessToken: string, integration: string) {
  const response = await fetch(`${HIGHLIGHT_BACKEND_BASE_URL}/v1/connections`, {
    headers: {
      Authorization: `Bearer ${hlAccessToken}`,
    },
  })

  if (!response.ok) {
    console.warn('Failed to check if integration is connected', response.status, await response.text())
    throw new Error('Failed to check if integration is connected')
  }

  let data
  try {
    data = await response.json()
  } catch (e) {
    console.warn('Failed to parse response as JSON', e, await response.text())
    throw e
  }

  if (data[integration] === null || data[integration] === undefined) {
    throw new Error('Integration not found')
  }

  return data[integration]
}

/**
 * Returns the access token for the given integration for the user.
 */
export async function getIntegrationTokenForUser(hlAccessToken: string, integration: string) {
  const response = await fetch(`${HIGHLIGHT_BACKEND_BASE_URL}/v1/connections/${integration}/access-token`, {
    headers: {
      Authorization: `Bearer ${hlAccessToken}`,
    },
  })

  if (response.status === 400) {
    // User doesn't have a connection created yet.
    return null
  }

  if (!response.ok) {
    console.error('Failed to get integration token for user. HTTP code:', response.status, await response.text())
    throw new Error('Failed to get integration token for user.')
  }

  const data = await response.json()

  if (!data.accessToken) {
    console.error('Failed to get integration token for user. No token found in response body.')
    throw new Error('Failed to get integration token for user. No token found in response body.')
  }

  return data.accessToken as string
}

export async function createMagicLinkForIntegration(accessToken: string, integration: string) {
  const response = await fetch(
    `${HIGHLIGHT_BACKEND_BASE_URL}/v1/auth/magiclink?redirect_uri=https://auth.highlight.ing/connect/${integration}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  )

  if (!response.ok) {
    console.warn('Failed to create integration connect link', response.status, await response.text())
    throw new Error('Failed to create integration connect link')
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
