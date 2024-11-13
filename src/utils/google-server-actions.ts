'use server'

import type { CreateGoogleCalendarEventParams } from '@/hooks/useIntegrations'
import { google } from 'googleapis'
import { getIntegrationTokenForUser } from './integrations-server-actions'

export async function createGoogleCalendarEvent(accessToken: string, data: CreateGoogleCalendarEventParams) {
  const gToken = await getIntegrationTokenForUser(accessToken, 'google')

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URL,
  )

  oauth2Client.setCredentials({
    access_token: gToken,
  })

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

  const startDate = data.start ? new Date(data.start).toISOString() : new Date().toISOString()
  const endDate = data.end ? new Date(data.end).toISOString() : new Date(startDate).toISOString()

  const event = await calendar.events.insert({
    auth: oauth2Client,
    calendarId: 'primary',
    requestBody: {
      summary: data.summary,
      description: data.description,
      start: {
        dateTime: startDate,
      },
      end: {
        dateTime: endDate,
      },
      location: data.location,
    },
  })

  console.log({ event })

  return event.data.htmlLink
}
