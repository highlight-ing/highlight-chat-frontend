import { checkIntegrationStatus } from '@/utils/integrations-server-actions'
import { useQuery } from '@tanstack/react-query'

import { useHighlightToken } from '../_hooks/use-hl-token'

export function useCheckSlackConnection() {
  const { data: hlToken } = useHighlightToken()

  return useQuery({
    queryKey: ['slack-check-connection'],
    queryFn: async () => {
      if (!hlToken) {
        throw new Error('No Linear token available')
      }

      const connected = await checkIntegrationStatus(hlToken, 'slack')

      return connected as boolean
    },
    enabled: !!hlToken,
    refetchInterval: 15000,
    retry: false,
  })
}
