import { useStore } from '@/components/providers/store-provider'
import type { MessagesSlice } from '@/stores/messages'
import { Message } from '@/types'
import { LinearIcon, NotionIcon, SlackIcon, GoogleIcon } from '@/components/Icons'
import { useRef } from 'react'

import { IntegrationsLoader } from '../_components/loader'
import { SetupConnection } from '../_components/setup-connection'
import { CreateGoogleCalEvent } from '../google-cal/google-cal'
import { CreateLinearTicket } from '../linear/linear'
import { CreateNotionPage } from '../notion/notion'
import { SendSlackMessageComponent } from '../slack/slack'
import { SendSlackMessageParams } from '../types'

// Holds the previous content of the conversation to be able to append to it
const previousContent = new Map<string, string>()

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

export function useIntegrations(): UseIntegrationsAPI {
  const store = useStore()
  const updateLastConversationMessage = useStore((state: MessagesSlice) => state.updateLastConversationMessage)
  const getLastConversationMessage = useStore((state: MessagesSlice) => state.getLastConversationMessage)
  // Use useRef to maintain the Map across renders but keep it component-specific
  const integrationAuthorizedRef = useRef(new Map<string, Promise<void>>())
  
  function getMessageContent(conversationId: string | undefined) {
    if (!conversationId) return null
    const message = getLastConversationMessage(conversationId)
    if (!message || !('content' in message)) return null
    return message
  }

  async function createLinearTicket(conversationId: string, title: string, description: string) {
    showLoading(conversationId, false, 'linear')
    let lastMessage = previousContent.get(conversationId)

    if (!lastMessage) {
      lastMessage = getMessageContent(conversationId)?.content as string
    }

    // Update the last message to show the Linear ticket component which will handle checking for authentication,
    // creating the ticket, and showing the success message.
    // @ts-expect-error
    updateLastConversationMessage(conversationId, {
      content: (
        <MessageWithComponent content={lastMessage}>
          <CreateLinearTicket title={title} description={description} />
        </MessageWithComponent>
      ),
      role: 'assistant',
    })
  }

  async function createNotionPage(conversationId: string, params: CreateNotionPageParams) {
    showLoading(conversationId, false, 'notion')
    const lastMessage = getMessageContent(conversationId)
    if (!lastMessage) return

    // Update the last message to show the Notion page component which will handle checking for authentication,
    // creating the page, and showing the success message.
    // @ts-expect-error
    updateLastConversationMessage(conversationId, {
      content: (
        <MessageWithComponent content={previousContent.get(conversationId) || ''}>
          <CreateNotionPage {...params} />
        </MessageWithComponent>
      ),
      role: 'assistant',
    })
  }

  async function createGoogleCalendarEvent(conversationId: string, params: CreateGoogleCalendarEventParams) {
    showLoading(conversationId, false, 'google')
    let lastMessage = previousContent.get(conversationId)

    if (!lastMessage) {
      lastMessage = getMessageContent(conversationId)?.content as string
    }

    // Update the last message to show the Notion page component which will handle checking for authentication,
    // creating the page, and showing the success message.
    // @ts-expect-error
    updateLastConversationMessage(conversationId, {
      content: (
        <MessageWithComponent content={lastMessage}>
          <CreateGoogleCalEvent {...params} />
        </MessageWithComponent>
      ),
      role: 'assistant',
    })
  }

  async function sendSlackMessage(conversationId: string, params: SendSlackMessageParams) {
    showLoading(conversationId, false, 'slack')
    let lastMessage = previousContent.get(conversationId)

    if (!lastMessage) {
      lastMessage = getMessageContent(conversationId)?.content as string
    }

    // @ts-expect-error
    updateLastConversationMessage(conversationId, {
      content: (
        <MessageWithComponent content={lastMessage}>
          <SendSlackMessageComponent data={params} />
        </MessageWithComponent>
      ),
      role: 'assistant',
    })
  }

  function showLoading(conversationId: string, loaded: boolean, functionName?: string) {
    const lastMessage = getMessageContent(conversationId)
    if (!lastMessage) return

    const textContents = lastMessage.content as string

    // Store the previous content for restoring later
    previousContent.set(conversationId, textContents)

    // Send loading state metadata event
    const event = new CustomEvent('metadata', {
      detail: {
        type: 'loading',
        loaded: loaded,
        name: functionName || 'unknown'
      }
    });
    window.dispatchEvent(event);

    if (!loaded) {
      updateLastConversationMessage(conversationId, {
        content: (
          <MessageWithComponent content={textContents}>
            <IntegrationsLoader />
          </MessageWithComponent>
        ),
        role: 'assistant',
      })
    }
  }

  async function handleIntegrationConnection(
    conversationId: string, 
    functionName: string, 
    integrationName: string, 
    checkConnectionStatus: (token: string) => Promise<boolean>, 
    createMagicLink: (token: string) => Promise<string>
  ) {
    // @ts-expect-error highlight is injected globally
    const hlToken = (await highlight.internal.getAuthorizationToken()) as string
    const connected = await checkConnectionStatus(hlToken)

    if (!connected) {
      const existingPromise = integrationAuthorizedRef.current.get(integrationName)
      if (existingPromise) {
        await existingPromise
        return
      }

      const promise = new Promise<void>((resolve) => {
        const message: Message = {
          content: (
            <MessageWithComponent content={previousContent.get(conversationId) || ''}>
              <SetupConnection
                name={integrationName}
                checkConnectionStatus={checkConnectionStatus}
                onConnect={() => resolve()}
                icon={getIntegrationIcon(integrationName)}
                createMagicLink={createMagicLink}
                token={hlToken}
              />
            </MessageWithComponent>
          ),
          role: 'assistant',
        }
        updateLastConversationMessage(conversationId, message)
      })

      integrationAuthorizedRef.current.set(integrationName, promise)
      try {
        await promise
      } finally {
        integrationAuthorizedRef.current.delete(integrationName)
      }
    }
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
