'use client'

import React from 'react'
import { initAmplitude, trackEvent } from '@/utils/amplitude'
import * as Sentry from '@sentry/react'
import { decodeJwt } from 'jose'

import useAuth from '@/hooks/useAuth'
import { useStore } from '@/components/providers/store-provider'

export function useInitializeAmplitudeAndSentry() {
  const { getAccessToken } = useAuth()
  const setUserId = useStore((state) => state.setUserId)

  React.useEffect(() => {
    const initializeAmplitude = async () => {
      try {
        // Get the access token using the useAuth hook
        const accessToken = await getAccessToken()

        // Decode the token to get the payload
        const payload = decodeJwt(accessToken)

        // Extract the user ID from the 'sub' field
        const userId = payload.sub as string

        if (!userId) {
          throw new Error('User ID not found in token')
        }

        // Set the user ID in the store
        setUserId(userId)

        // Initialize Amplitude with the user ID
        initAmplitude(userId)

        // Track the app initialization event
        trackEvent('HL Chat App Initialized', { userId })
      } catch (error) {
        console.error('Failed to initialize Amplitude:', error)

        // Fallback to a random ID if token retrieval or decoding fails
        const fallbackId = `anonymous_${Math.random().toString(36).substr(2, 9)}`
        initAmplitude(fallbackId)
        trackEvent('HL Chat App Initialized', { fallbackId, error: 'Failed to get userId' })
      }
    }

    const initializeSentry = async () => {
      Sentry.init({
        dsn: 'https://28291dbcd2a5dc04db47386e7d88bd0c@o4508286468816896.ingest.us.sentry.io/4508326587531264',
        integrations: [Sentry.browserTracingIntegration()],
        // Tracing
        tracesSampleRate: 1.0, //  Capture 100% of the transactions
        // Session Replay
        replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
        replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
      })
      // Get the access token using the useAuth hook
      const accessToken = await getAccessToken()

      // Decode the token to get the payload
      const payload = decodeJwt(accessToken)

      // Extract the user ID from the 'sub' field
      const userId = payload.sub as string

      if (!userId) {
        throw new Error('User ID not found in token')
      }

      Sentry.setUser({ id: userId })
    }

    initializeAmplitude()
    initializeSentry()
  }, [])
}
