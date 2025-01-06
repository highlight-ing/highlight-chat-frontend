import { useStore } from '@/components/providers/store-provider'

import { IntegrationsLoader } from '../_components/loader'
import { MCPLoader, MCPLoaderProps } from '../_components/mcp-loader'
import { CreateGoogleCalEvent } from '../google-cal/google-cal'
import { CreateLinearTicket } from '../linear/linear'
import { CreateMCPTool } from '../mcp/mcp'
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
  includeGoogleMeetDetails: boolean
  location?: string
  description?: string
  start?: string
  end?: string
}

export interface CreateMCPToolParams {
  toolName: string
  toolInput: object
  toolId: string
  agentId: string
  agentName: string
}

export interface UseIntegrationsAPI {
  createLinearTicket: (
    conversationId: string,
    title: string,
    description: string,
    includeLastMessage?: boolean,
  ) => Promise<void>
  createNotionPage: (
    conversationId: string,
    params: CreateNotionPageParams,
    includeLastMessage?: boolean,
  ) => Promise<void>
  createGoogleCalendarEvent: (conversationId: string, params: CreateGoogleCalendarEventParams) => Promise<void>
  sendSlackMessage: (conversationId: string, params: SendSlackMessageParams) => Promise<void>
  showLoading: (conversationId: string, loaded: boolean) => void
  showMCPLoader: (conversationId: string, loaded: boolean, params: MCPLoaderProps) => void
  createMCPTool: (conversationId: string, params: CreateMCPToolParams) => Promise<void>
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

  async function createLinearTicket(
    conversationId: string,
    title: string,
    description: string,
    includeLastMessage: boolean = false,
  ) {
    let lastMessage = previousContent.get(conversationId)

    if (!lastMessage) {
      lastMessage = getLastConversationMessage(conversationId)?.content as string
    }

    // Update the last message to show the Linear ticket component which will handle checking for authentication,
    // creating the ticket, and showing the success message.
    // @ts-expect-error
    updateLastConversationMessage(conversationId!, {
      content: (
        <MessageWithComponent content={includeLastMessage ? lastMessage : ''}>
          <CreateLinearTicket title={title} description={description} />
        </MessageWithComponent>
      ),
      role: 'assistant',
    })
  }

  async function createNotionPage(
    conversationId: string,
    params: CreateNotionPageParams,
    includeLastMessage: boolean = false,
  ) {
    let lastMessage = previousContent.get(conversationId)

    if (!lastMessage) {
      lastMessage = getLastConversationMessage(conversationId)?.content as string
    }

    // Update the last message to show the Notion page component which will handle checking for authentication,
    // creating the page, and showing the success message.
    // @ts-expect-error
    updateLastConversationMessage(conversationId!, {
      content: (
        <MessageWithComponent content={includeLastMessage ? lastMessage : ''}>
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

  async function createMCPTool(conversationId: string, params: CreateMCPToolParams) {
    const lastMessage = getLastConversationMessage(conversationId)
    const textContents = lastMessage?.content as string

    previousContent.set(conversationId, textContents)

    // @ts-expect-error
    updateLastConversationMessage(conversationId!, {
      content: (
        <MessageWithComponent content={textContents}>
          <CreateMCPTool {...params} />
        </MessageWithComponent>
      ),
      role: 'assistant',
    })
  }

  function showLoading(conversationId: string, loaded: boolean) {
    if (loaded) return

    const lastMessage = getLastConversationMessage(conversationId)
    const textContents = lastMessage?.content as string

    previousContent.set(conversationId, textContents)

    // @ts-expect-error
    updateLastConversationMessage(conversationId!, {
      content: (
        <MessageWithComponent content={textContents}>
          <IntegrationsLoader />
        </MessageWithComponent>
      ),
      role: 'assistant',
    })
  }

  function showMCPLoader(conversationId: string, loaded: boolean, params: MCPLoaderProps) {
    if (loaded) return

    const lastMessage = getLastConversationMessage(conversationId)
    const textContents = lastMessage?.content as string

    previousContent.set(conversationId, textContents)

    // @ts-expect-error
    updateLastConversationMessage(conversationId!, {
      content: (
        <MessageWithComponent content={textContents}>
          <MCPLoader {...params} />
        </MessageWithComponent>
      ),
      role: 'assistant',
    })
  }

  return {
    createLinearTicket,
    createNotionPage,
    createGoogleCalendarEvent,
    sendSlackMessage,
    createMCPTool,
    showLoading,
    showMCPLoader,
  }
}
