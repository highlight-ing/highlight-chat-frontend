import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { HIGHLIGHT_BACKEND_BASE_URL } from '@/lib/integrations-backend'

import { useHighlightToken } from '../_hooks/use-hl-token'
import { checkGoogleConnectionStatus } from './actions'
import { GoogleCalEventFormSchema } from './google-cal'

export function useCheckGoogleCalConnection() {
  const { data: hlToken } = useHighlightToken()

  return useQuery({
    queryKey: ['google-cal-check-connection'],
    queryFn: async () => {
      if (!hlToken) {
        throw new Error('No highlight token found')
      }

      const connected = await checkGoogleConnectionStatus(hlToken)

      return connected as boolean
    },
    enabled: !!hlToken,
  })
}

interface CreateGoogleCalEventResponse {
  url: string
}

export function useCreateGoogleCalEvent(onSuccess: ((url: string) => void) | undefined) {
  const { data: hlToken } = useHighlightToken()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['create-google-cal-event'],
    mutationFn: async (input: GoogleCalEventFormSchema) => {
      if (!hlToken) {
        console.warn('Highlight token not set, please try again later.')
        throw new Error('No Highlight token available')
      }

      const response = await fetch(`${HIGHLIGHT_BACKEND_BASE_URL}/v1/gcal/event`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${hlToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      })

      if (!response.ok) {
        const responseText = await response.text()
        throw new Error(`Failed to create Google Calendar event: ${responseText}`)
      }

      const data = (await response.json()) as CreateGoogleCalEventResponse

      return data.url
    },
    onSuccess: (link) => {
      if (onSuccess) onSuccess(link)
    },
    onError: (error) => {
      if (error.message.includes('Not connected')) {
        queryClient.invalidateQueries({ queryKey: ['google-cal-check-connection'] })
      }
      console.warn(error.message)
    },
  })
}
