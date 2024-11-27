import { useStore } from '@/components/providers/store-provider'

import { IntegrationsLoader } from '../_components/loader'
import { CreateGoogleCalEvent } from '../google-cal/google-cal'
import { CreateLinearTicket } from '../linear/linear'
import { CreateNotionPage } from '../notion/notion'
import { SendSlackMessageComponent } from '../slack/slack'
import { SendSlackMessageParams } from '../types'

interface CreateNotionPageParams {
  title: string
  description: string
  content: string
}

export interface CreateGoogleCalendarEventParams {
  summary: string
  location?: string
  description?: string
  start?: string
  end?: string
}

export interface UseIntegrationsAPI {
  createLinearTicket: (conversationId: string, title: string, description: string) => Promise<void>
  createNotionPage: (conversationId: string, params: CreateNotionPageParams) => Promise<void>
  createGoogleCalendarEvent: (conversationId: string, params: CreateGoogleCalendarEventParams) => Promise<void>
  sendSlackMessage: (conversationId: string, params: SendSlackMessageParams) => Promise<void>
  showLoading: (conversationId: string, loaded: boolean) => void
}

function MessageWithComponent({ content, children }: { content: string; children?: React.ReactNode }) {
  return (
    <div>
      {content && <p className="pb-2">{content} </p>}
      {children}
    </div>
  )
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
          <CreateLinearTicket title={title} description={description} />
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
          <CreateNotionPage {...params} />
        </MessageWithComponent>
      ),
      role: 'assistant',
    })
  }

  async function createGoogleCalendarEvent(conversationId: string, params: CreateGoogleCalendarEventParams) {
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
          <CreateGoogleCalEvent {...params} />
        </MessageWithComponent>
      ),
      role: 'assistant',
    })
  }

  async function sendSlackMessage(conversationId: string, params: SendSlackMessageParams) {
    let lastMessage = previousContent.get(conversationId)

    if (!lastMessage) {
      lastMessage = getLastConversationMessage(conversationId)?.content as string
    }

    // @ts-expect-error
    updateLastConversationMessage(conversationId!, {
      content: (
        <MessageWithComponent content={lastMessage}>
          <SendSlackMessageComponent data={params} />
        </MessageWithComponent>
      ),
      role: 'assistant',
    })
  }

  function showLoading(conversationId: string, loaded: boolean) {
    if (loaded) return

    const lastMessage = getLastConversationMessage(conversationId)
    const textContents = lastMessage?.content as string

    // Store the previous content for restoring later
    previousContent.set(conversationId, textContents)

    // Send loading state metadata event
    const event = new CustomEvent('metadata', {
      detail: {
        type: 'loading',
        loaded: loaded,
        name: functionName
      }
    });
    window.dispatchEvent(event);
  }

  async function handleIntegrationConnection(conversationId: string, functionName: string, integrationName: string, checkConnectionStatus: (token: string) => Promise<boolean>, createMagicLink: (token: string) => Promise<string>) {
    //@ts-ignore
    const hlToken = (await highlight.internal.getAuthorizationToken()) as string

    const connected = await checkConnectionStatus(hlToken)

    if (!connected) {
      const promise = new Promise<void>((resolve) => {
        // @ts-expect-error
        updateLastConversationMessage(conversationId!, {
          content: (
            <MessageWithComponent content={previousContent.get(conversationId) || ''}>
              <SetupConnection
                name={integrationName}
                checkConnectionStatus={checkConnectionStatus}
                onConnect={() => resolve()}
                icon={getIntegrationIcon(integrationName)}
                createMagicLink={createMagicLink}
              />
            </MessageWithComponent>
          ),
          role: 'assistant',
        })
      })

      integrationAuthorized.set(integrationName, promise)

      return
    }
    integrationAuthorized.set(integrationName, Promise.resolve())
  }

  function getIntegrationIcon(integrationName: string) {
    switch (integrationName) {
      case 'linear':
        return <LinearIcon size={16} />
      case 'notion':
        return <NotionIcon size={16} />
      case 'slack':
        return <SlackIcon size={16} />
      case 'google':
        return <GoogleIcon size={16} />
      default:
        return null
    }
  }

  return { createLinearTicket, createNotionPage, createGoogleCalendarEvent, showLoading, sendSlackMessage }
}
