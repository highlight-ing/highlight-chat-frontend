'use server'

import { validateUserAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// Hard code this, probably move to an env variable later on
const HIGHLIGHT_CLIENT_ID = 'e64e0f07dd078e9750a2d8cca0b8e90849b9689aa601247aa4fafee8089cd3d4'
const HIGHLIGHT_CLIENT_SECRET = process.env.HIGHLIGHT_AUTH_CLIENT_SECRET

/**
 * Refreshes the Highlight access token using the Highlight Oauth service
 * @see https://docs.highlight.ing/learn/developers/authentication#refreshing-a-token
 */
export async function refreshTokens(refreshToken: string) {
  if (!HIGHLIGHT_CLIENT_SECRET) {
    throw new Error('HIGHLIGHT_CLIENT_SECRET must be set, check your .env file')
  }

  const formData = new FormData()

  formData.append('grant_type', 'refresh_token')
  formData.append('refresh_token', refreshToken)
  formData.append('client_id', HIGHLIGHT_CLIENT_ID)
  formData.append('client_secret', HIGHLIGHT_CLIENT_SECRET)

  // Send a request to refresh the auth token
  const response = await fetch('https://backend.workers.highlight.ing/v1/auth/token', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const responseBody = await response.text()

    console.error('Auth refresh response body:', responseBody)

    throw new Error('Failed to refresh token, Highlight auth service returned a non-OK status.')
  }

  const tokensResponse = await response.json()

  return tokensResponse as {
    access_token: string
    refresh_token: string
    expires_in: number
  }
}

/**
 * Server action that checks if we should present the follow up feedback toast to the user.
 * @returns true if we should present the toast
 */
export async function checkForFollowUpFeedback(accessToken: string) {
  let userId: string
  try {
    userId = await validateUserAuth(accessToken)
  } catch (error) {
    console.warn('Error validating user auth', error)
    return
  }

  const supabase = supabaseAdmin()

  const { error, data } = await supabase
    .from('follow_up_feedback')
    .select('follow_up_shown')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    console.warn('Error checking for follow up feedback', error)
    return
  }

  if (!data || data.follow_up_shown === true) {
    return false
  }

  return true
}

/**
 * Marks the follow up feedback as shown for the user (so they won't see it again)
 */
export async function markFollowUpFeedbackAsShown(accessToken: string) {
  let userId: string
  try {
    userId = await validateUserAuth(accessToken)
  } catch (error) {
    console.warn('Error validating user auth', error)
    return
  }

  const supabase = supabaseAdmin()

  const { error } = await supabase.from('follow_up_feedback').update({ follow_up_shown: true }).eq('user_id', userId)

  if (error) {
    console.warn('Error marking follow up feedback as shown', error)
  }
}

/**
 * Use's Highlight's userinfo endpoint to update the user's information in the HL Chat database
 */
export async function updateUserInfo(accessToken: string) {
  let userId: string
  try {
    userId = await validateUserAuth(accessToken)
  } catch (error) {
    console.warn('Error validating user auth', error)
    return
  }

  const response = await fetch('https://backend.workers.highlight.ing/v1/auth/userinfo', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    console.warn('Non-OK status code returned from Highlight userinfo endpoint')

    return
  }

  const userInfo = await response.json()

  if (!userInfo.username) {
    console.info('No username found in Highlight userinfo response, skipping update.')

    return
  }

  const supabase = supabaseAdmin()

  const { error } = await supabase.from('profiles').upsert(
    {
      user_id: userId,
      username: userInfo.username,
    },
    {
      onConflict: 'user_id',
    },
  )

  if (error) {
    console.warn('Error updating user info', error)
  }
}

/**
 * Fetches 'appIcon' from supabase "app_icons" table using appName as the key
 */
export const fetchAppIcon = async (appName: string) => {
  const supabase = supabaseAdmin()

  const { data: icon, error } = await supabase
    .from('app_icons')
    .select('app_icon')
    .eq('app_name', appName)
    .maybeSingle()

  if (error) {
    console.error('Error fetching app icon:', error)
    return null
  }

  return icon?.app_icon || null
}
