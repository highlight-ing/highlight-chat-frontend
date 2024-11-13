import { useMutation, useQuery } from '@tanstack/react-query'
import { useHighlightToken } from '../hooks/use-hl-token'
import { GoogleCalEventFormSchema } from './google-cal'
import { checkGoogleConnectionStatus, createGoogleCalendarEvent } from './actions'

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

export function useCreateGoogleCalEvent(onSubmitSuccess: (url: string | undefined) => void) {
  const { data: hlToken } = useHighlightToken()

  return useMutation({
    mutationKey: ['create-notion-page'],
    mutationFn: async (data: GoogleCalEventFormSchema) => {
      if (!hlToken) {
        console.warn('Notion token not set, please try again later.')
        throw new Error('No Notion token available')
      }

      const link = await createGoogleCalendarEvent(hlToken, data)

      if (!link) {
        throw new Error('Error getting google cal event link')
      }

      return link
    },
    onSuccess: (link) => {
      if (onSubmitSuccess) onSubmitSuccess(link)
    },
    onError: (error) => {
      console.warn(error.message)
    },
  })
}
