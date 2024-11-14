import { useStore } from '@/providers/store-provider'
import { useEffect } from 'react'
import { useIntegrations } from './use-integrations'

/**
 * Weird workaround I did bc the state logic is a PIA for onExternalMessage hook.
 */
export function usePendingIntegrations() {
  const pendingIntegrations = useStore((state) => state.pendingIntegrations)
  const conversationMessages = useStore((state) => state.conversationMessages)
  const removePendingIntegration = useStore((state) => state.removePendingIntegration)
  const getLastConversationMessage = useStore((state) => state.getLastConversationMessage)
  const integrations = useIntegrations()

  useEffect(() => {
    pendingIntegrations.forEach((integration) => {
      const lastMessage = getLastConversationMessage(integration.conversationId)

      if (!lastMessage) {
        // Ignore until we've the store has the last message
        return
      }

      removePendingIntegration(integration.id)

      switch (integration.integrationName) {
        case 'create_google_calendar_event':
          integrations.createGoogleCalendarEvent(integration.conversationId, integration.input)
          break
        case 'create_linear_ticket':
          integrations.createLinearTicket(
            integration.conversationId,
            integration.input.title ?? '',
            integration.input.description ?? '',
          )
          break
        case 'create_notion_page':
          integrations.createNotionPage(integration.conversationId, integration.input)
          break
      }
    })
  }, [pendingIntegrations, conversationMessages])
}
