import { CreateLinearTicketComponent } from '@/components/integrations/linear'
import { CreateNotionPageComponent } from '@/components/integrations/notion'
import { useStore } from '@/providers/store-provider'

interface CreateNotionPageParams {
  title: string
  description: string
  content: string
}

export interface UseIntegrationsAPI {
  createLinearTicket: (conversationId: string, title: string, description: string) => Promise<void>
  createNotionPage: (conversationId: string, params: CreateNotionPageParams) => Promise<void>
}

function MessageWithComponent({ content, children }: { content: string; children?: React.ReactNode }) {
  return (
    <div>
      <p>{content}</p>
      {children}
    </div>
  )
}

export function useIntegrations(): UseIntegrationsAPI {
  const getLastConversationMessage = useStore((state) => state.getLastConversationMessage)
  const updateLastConversationMessage = useStore((state) => state.updateLastConversationMessage)

  async function createLinearTicket(conversationId: string, title: string, description: string) {
    const lastMessage = getLastConversationMessage(conversationId)

    // Update the last message to show the Linear ticket component which will handle checking for authentication,
    // creating the ticket, and showing the success message.
    updateLastConversationMessage(conversationId!, {
      content: (
        <MessageWithComponent content={lastMessage?.content as string}>
          <CreateLinearTicketComponent title={title} description={description} />
        </MessageWithComponent>
      ),
      role: 'assistant',
    })
  }

  async function createNotionPage(conversationId: string, params: CreateNotionPageParams) {
    const lastMessage = getLastConversationMessage(conversationId)

    // Update the last message to show the Notion page component which will handle checking for authentication,
    // creating the page, and showing the success message.
    updateLastConversationMessage(conversationId!, {
      content: (
        <MessageWithComponent content={lastMessage?.content as string}>
          <CreateNotionPageComponent {...params} />
        </MessageWithComponent>
      ),
      role: 'assistant',
    })
  }

  return { createLinearTicket, createNotionPage }
}
