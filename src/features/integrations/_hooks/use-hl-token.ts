import { useQuery } from '@tanstack/react-query'

export function useHighlightToken() {
  return useQuery({
    queryKey: ['hl-token'],
    queryFn: async () => {
      // @ts-expect-error: highlight is mounted on window
      const hlToken = (await highlight.internal.getAuthorizationToken()) as string
      return hlToken
    },
  })
}
