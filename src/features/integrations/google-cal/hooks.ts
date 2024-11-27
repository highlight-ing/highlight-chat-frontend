import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useHighlightToken } from '../_hooks/use-hl-token'
import { checkGoogleConnectionStatus, createGoogleCalendarEvent } from './actions'
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

export function useCreateGoogleCalEvent(onSuccess: ((url: string) => void) | undefined) {
  const { data: hlToken } = useHighlightToken()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['create-google-cal-event'],
    mutationFn: async (data: GoogleCalEventFormSchema) => {
      if (!hlToken) {
        console.warn('Highlight token not set, please try again later.')
        throw new Error('No Highligh token available')
      }

      const connected = await checkGoogleConnectionStatus(hlToken)

      if (!connected) {
        throw new Error('Not connected to Google Cal')
      }

      const link = await createGoogleCalendarEvent(hlToken, data)

      if (!link) {
        throw new Error('Error getting google cal event link')
      }

      return link
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
