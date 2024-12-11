'use server'

import { google } from 'googleapis'
import { v4 as uuidv4 } from 'uuid'

import type { CreateGoogleCalendarEventParams } from '../_hooks/use-integrations'

const HIGHLIGHT_BACKEND_BASE_URL = 'https://backend.highlightai.com'

export async function checkGoogleConnectionStatus(accessToken: string) {
  const response = await fetch(`${HIGHLIGHT_BACKEND_BASE_URL}/v1/connections`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    console.warn('Failed to check if Google is connected', response.status, await response.text())
    throw new Error('Failed to check if Google is connected')
  }

  let data
  try {
    data = await response.json()
  } catch (e) {
    console.warn('Failed to parse response as JSON', e, await response.text())
    throw e
  }

  return data.google
}

/**
 * Returns the latest Notion API token for the given user by their ID.
 */
export async function getGoogleTokenForUser(hlAccessToken: string) {
  const response = await fetch(`${HIGHLIGHT_BACKEND_BASE_URL}/v1/connections/google/access-token`, {
    headers: {
      Authorization: `Bearer ${hlAccessToken}`,
    },
  })

  if (response.status === 400) {
    // User doesn't have a Google connection created yet.
    return null
  }

  if (!response.ok) {
    console.error('Failed to get Google token for user. HTTP code:', response.status, await response.text())
    throw new Error('Failed to get Google token for user.')
  }

  const data = await response.json()

  if (!data.accessToken) {
    console.error('Failed to get Google token for user. No token found in response body.')
    throw new Error('Failed to get Google token for user. No token found in response body.')
  }

  return data.accessToken as string
}

/**
 * Creates a magic sign in link for Google.
 * We will redirect the user to this link to create a connection.
 */
export async function createMagicLinkForGoogle(accessToken: string) {
  const response = await fetch(
    `${HIGHLIGHT_BACKEND_BASE_URL}/v1/auth/magiclink?redirect_uri=https://auth.highlight.ing/connect/google`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  )

  if (!response.ok) {
    console.warn('Failed to create Google connect link', response.status, await response.text())
    throw new Error('Failed to create Google connect link')
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

export async function createGoogleCalendarEvent(accessToken: string, data: CreateGoogleCalendarEventParams) {
  const gToken = await getGoogleTokenForUser(accessToken)

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URL,
  )

  oauth2Client.setCredentials({
    access_token: gToken,
  })

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

  const event = await calendar.events.insert({
    auth: oauth2Client,
    calendarId: 'primary',
    conferenceDataVersion: data.includeGoogleMeetDetails ? 1 : 0,
    requestBody: {
      summary: data.summary,
      description: data.description,
      start: {
        dateTime: data.start,
      },
      end: {
        dateTime: data.end,
      },
      location: data.location,
      conferenceData: data.includeGoogleMeetDetails
        ? {
            createRequest: {
              conferenceSolutionKey: {
                type: 'hangoutsMeet',
              },
              requestId: uuidv4(),
            },
          }
        : undefined,
    },
  })

  return event.data.htmlLink
}
