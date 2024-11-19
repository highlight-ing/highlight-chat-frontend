import { useQuery } from "@tanstack/react-query"
import { useHighlightToken } from "../_hooks/use-hl-token"
import { checkIntegrationStatus } from "@/utils/integrations-server-actions"


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
    refetchInterval: 7 * 1000,
    retry: false,
  })
}