import { useQuery } from '@tanstack/react-query'

import { PromptWithTags } from '@/types/supabase-helpers'
import useAuth from '@/hooks/useAuth'

import { fetchPinnedShortcuts } from '../_actions/fetchPinnedShortcuts'
import { fetchUserCreatedShortcuts } from '../_actions/fetchUserCreatedShortcuts'

export type ShortcutsResponse = {
  created: PromptWithTags[]
  pinned: PromptWithTags[]
}

async function fetchShortcuts(getAccessToken: () => Promise<string>): Promise<ShortcutsResponse> {
  const authToken = await getAccessToken()
  const [created, pinned] = await Promise.all([fetchUserCreatedShortcuts(authToken), fetchPinnedShortcuts(authToken)])

  if ('error' in created || 'error' in pinned) {
    throw new Error('Failed to fetch shortcuts')
  }

  return {
    created: created as PromptWithTags[],
    pinned: pinned as PromptWithTags[],
  }
}

export function useShortcuts() {
  const { getAccessToken } = useAuth()

  return useQuery({
    queryKey: ['shortcuts'],
    queryFn: () => fetchShortcuts(getAccessToken),
  })
}
