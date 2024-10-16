import { CreateLinearTicketComponent } from '@/components/integrations/linear'
import { CreateNotionPageComponent } from '@/components/integrations/notion'
import { useStore } from '@/providers/store-provider'
import { useEffect, useState } from 'react'

interface CreateNotionPageParams {
  title: string
  description: string
  content: string
}

export interface UseIntegrationsAPI {
  createLinearTicket: (conversationId: string, title: string, description: string) => Promise<void>
  createNotionPage: (conversationId: string, params: CreateNotionPageParams) => Promise<void>
  showLoading: (conversationId: string) => Promise<void>
}

function MessageWithComponent({ content, children }: { content: string; children?: React.ReactNode }) {
  return (
    <div>
      <p>{content}</p>
      {children}
    </div>
  )
}

function LoadingComponent() {
  const [text, setText] = useState('Loading...')

  useEffect(() => {
    const timeout = setTimeout(() => {
      setText('Still loading...')
    }, 5000)

    return () => clearTimeout(timeout)
  }, [])

  return <p className="mt-2 text-sm text-gray-500">{text}</p>
}
// Holds the previous content of the conversation to be able to append to it
const previousContent = new Map<string, string>()

export function useIntegrations(): UseIntegrationsAPI {
  const getLastConversationMessage = useStore((state) => state.getLastConversationMessage)
  const updateLastConversationMessage = useStore((state) => state.updateLastConversationMessage)

  async function createLinearTicket(conversationId: string, title: string, description: string) {
    let lastMessage = previousContent.get(conversationId)

    if (!lastMessage) {
      lastMessage = getLastConversationMessage(conversationId)?.content as string
    }

    // Update the last message to show the Linear ticket component which will handle checking for authentication,
    // creating the ticket, and showing the success message.
    // @ts-expect-error
    updateLastConversationMessage(conversationId!, {
      content: (
        <MessageWithComponent content={lastMessage}>
          <CreateLinearTicketComponent title={title} description={description} />
        </MessageWithComponent>
      ),
      role: 'assistant',
    })
  }

  async function createNotionPage(conversationId: string, params: CreateNotionPageParams) {
    let lastMessage = previousContent.get(conversationId)

    if (!lastMessage) {
      lastMessage = getLastConversationMessage(conversationId)?.content as string
    }

    // Update the last message to show the Notion page component which will handle checking for authentication,
    // creating the page, and showing the success message.
    // @ts-expect-error
    updateLastConversationMessage(conversationId!, {
      content: (
        <MessageWithComponent content={lastMessage}>
          <CreateNotionPageComponent {...params} />
        </MessageWithComponent>
      ),
      role: 'assistant',
    })
  }

  async function showLoading(conversationId: string) {
    const lastMessage = getLastConversationMessage(conversationId)
    const textContents = lastMessage?.content as string

    previousContent.set(conversationId, textContents)

    // @ts-expect-error
    updateLastConversationMessage(conversationId!, {
      content: (
        <MessageWithComponent content={textContents}>
          <LoadingComponent />
        </MessageWithComponent>
      ),
      role: 'assistant',
    })
  }

  return { createLinearTicket, createNotionPage, showLoading }
}
