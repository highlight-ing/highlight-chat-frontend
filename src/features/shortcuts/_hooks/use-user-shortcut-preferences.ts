import { useQuery } from '@tanstack/react-query'

import useAuth from '@/hooks/useAuth'

import { fetchUserShortcutPreferences } from '../_actions/fetchUserShortcutPreferences'

export function useUserShortcutPreferences() {
  const { getAccessToken } = useAuth()

  return useQuery({
    queryKey: ['user-shortcut-preferences'],
    queryFn: async () => {
      const authToken = await getAccessToken()
      const result = await fetchUserShortcutPreferences(authToken)

      if (result.error) {
        throw new Error(result.error)
      }

      return result.preferences || []
    },
  })
}
