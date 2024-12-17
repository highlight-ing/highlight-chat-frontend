'use client'

import { useEffect } from 'react'

import { useStore } from '@/components/providers/store-provider'

import { useIntegration } from './use-integration'

/**
 * Weird workaround I did bc the state logic is a PIA for onExternalMessage hook.
 */
export function usePendingShareActions() {
  const pendingShareActions = useStore((state) => state.pendingCreateActions)
  const conversationMessages = useStore((state) => state.conversationMessages)
  const removePendingShareAction = useStore((state) => state.removePendingCreateAction)
  const getLastConversationMessage = useStore((state) => state.getLastConversationMessage)
  const { createAction } = useIntegration()

  useEffect(() => {
    pendingShareActions.forEach((shareAction) => {
      const lastMessage = getLastConversationMessage(shareAction.conversationId)

      if (!lastMessage) {
        // Ignore until the store has the last message
        return
      }

      removePendingShareAction(shareAction.id)

      createAction(shareAction.actionName, lastMessage)
    })
  }, [pendingShareActions, conversationMessages])
}
