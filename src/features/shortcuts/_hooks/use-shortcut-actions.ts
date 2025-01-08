import { useMutation, useQueryClient } from '@tanstack/react-query'

import useAuth from '@/hooks/useAuth'

import { deleteShortcut } from '../_actions/deleteShortcut'
import { deleteShortcutPreferencesById } from '../_actions/deleteShortcutPreferencesById'
import { pinShortcut as pinShortcutAction } from '../_actions/pinShortcut'
import { unpinShortcut as unpinShortcutAction } from '../_actions/unpinShortcut'

export function useShortcutActions() {
  const { getAccessToken } = useAuth()
  const queryClient = useQueryClient()

  const pinShortcutMutation = useMutation({
    mutationFn: async (externalId: string) => {
      const token = await getAccessToken()
      return pinShortcutAction(externalId, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shortcuts'] })
    },
  })

  const unpinShortcutMutation = useMutation({
    mutationFn: async (promptId: number) => {
      const token = await getAccessToken()
      return unpinShortcutAction(promptId, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shortcuts'] })
    },
  })

  const deleteShortcutMutation = useMutation({
    mutationFn: async (promptId: number) => {
      const token = await getAccessToken()
      await deleteShortcutPreferencesById(promptId, token)
      return deleteShortcut(promptId, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shortcuts'] })
      queryClient.invalidateQueries({ queryKey: ['user-shortcut-preferences'] })
    },
  })

  return {
    pinShortcut: pinShortcutMutation.mutate,
    unpinShortcut: unpinShortcutMutation.mutate,
    deleteShortcut: deleteShortcutMutation.mutate,
    isPinning: pinShortcutMutation.isPending,
    isUnpinning: unpinShortcutMutation.isPending,
    isDeleting: deleteShortcutMutation.isPending,
    error: pinShortcutMutation.error || unpinShortcutMutation.error || deleteShortcutMutation.error,
  }
}
