import { GoogleIcon, LinearIcon, NotionIcon, SlackIcon } from '@/components/icons'
import { useStore } from '@/components/providers/store-provider'
import { IntegrationsLoader } from '../_components/loader'
import { SetupConnection } from '../_components/setup-connection'
import { checkGoogleConnectionStatus, createMagicLinkForGoogle } from '../google-cal/actions'
import { CreateGoogleCalEvent } from '../google-cal/google-cal'
import { checkLinearConnectionStatus, createMagicLinkForLinear } from '../linear/actions'
import { CreateLinearTicket } from '../linear/linear'
import { checkNotionConnectionStatus, createMagicLinkForNotion } from '../notion/actions'
import { CreateNotionPage } from '../notion/notion'
import { SendSlackMessageParams } from '../types'
import { checkIntegrationStatus, createMagicLinkForIntegration } from '@/utils/integrations-server-actions'
import { SendSlackMessageComponent } from '../slack/slack'

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
  showLoading: (conversationId: string, functionName: string, loaded: boolean) => Promise<void>
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
// Holds the name of the integration and if the authorization check is pending
// This is so that the user can sign in while the contents of notion/linear are still loading.
const integrationAuthorized = new Map<string, Promise<void>>()

export function useIntegrations(): UseIntegrationsAPI {
  const getLastConversationMessage = useStore((state) => state.getLastConversationMessage)
  const updateLastConversationMessage = useStore((state) => state.updateLastConversationMessage)

  async function createLinearTicket(conversationId: string, title: string, description: string) {
    await integrationAuthorized.get('linear')

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
    await integrationAuthorized.get('notion')

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
    await integrationAuthorized.get('google')

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
    await integrationAuthorized.get('slack')

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

  async function showLoading(conversationId: string, functionName: string, loaded: boolean) {
    const lastMessage = getLastConversationMessage(conversationId)
    const textContents = lastMessage?.content as string

    previousContent.set(conversationId, textContents)

    if (functionName === 'highlight_search' && !loaded) {
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

    // The two if blocks below handle the case where the user needs to connect their integration
    // We have a map that stores a Promise for each integration that is pending.
    if (functionName === 'create_linear_ticket' && !loaded) {
      //@ts-ignore
      const hlToken = (await highlight.internal.getAuthorizationToken()) as string

      const connected = await checkLinearConnectionStatus(hlToken)

      if (!connected) {
        const promise = new Promise<void>((resolve) => {
          // @ts-expect-error
          updateLastConversationMessage(conversationId!, {
            content: (
              <MessageWithComponent content={textContents}>
                <SetupConnection
                  name={'Linear'}
                  checkConnectionStatus={checkLinearConnectionStatus}
                  onConnect={() => resolve()}
                  icon={<LinearIcon size={16} />}
                  createMagicLink={createMagicLinkForLinear}
                />
              </MessageWithComponent>
            ),
            role: 'assistant',
          })
        })

        integrationAuthorized.set('linear', promise)

        return
      }
      integrationAuthorized.set('linear', Promise.resolve())
    }

    if (functionName === 'create_notion_page' && !loaded) {
      //@ts-ignore
      const hlToken = (await highlight.internal.getAuthorizationToken()) as string

      const connected = await checkNotionConnectionStatus(hlToken)

      if (!connected) {
        const promise = new Promise<void>((resolve) => {
          // @ts-expect-error
          updateLastConversationMessage(conversationId!, {
            content: (
              <MessageWithComponent content={textContents}>
                <SetupConnection
                  name={'Notion'}
                  checkConnectionStatus={checkNotionConnectionStatus}
                  onConnect={() => resolve()}
                  icon={<NotionIcon size={16} />}
                  createMagicLink={createMagicLinkForNotion}
                />
              </MessageWithComponent>
            ),
            role: 'assistant',
          })
        })

        integrationAuthorized.set('notion', promise)

        return
      }
      integrationAuthorized.set('notion', Promise.resolve())
    }

    if (functionName === 'send_slack_message' && !loaded) {
      //@ts-ignore
      const hlToken = (await highlight.internal.getAuthorizationToken()) as string

      const connected = await checkIntegrationStatus(hlToken, 'slack')

      if (!connected) {
        const promise = new Promise<void>((resolve) => {
          // @ts-expect-error
          updateLastConversationMessage(conversationId!, {
            content: (
              <MessageWithComponent content={textContents}>
                <SetupConnection
                  name={'Slack'}
                  checkConnectionStatus={(token) => checkIntegrationStatus(token, 'slack')}
                  onConnect={() => resolve()}
                  icon={<SlackIcon size={16} />}
                  createMagicLink={(token) => createMagicLinkForIntegration(token, 'slack')}
                />
              </MessageWithComponent>
            ),
            role: 'assistant',
          })
        })

        integrationAuthorized.set('notion', promise)

        return
      }
      integrationAuthorized.set('notion', Promise.resolve())
    }

    if (functionName === 'create_google_calendar_event' && !loaded) {
      //@ts-ignore
      const hlToken = (await highlight.internal.getAuthorizationToken()) as string

      const connected = await checkGoogleConnectionStatus(hlToken)

      console.log('Google Connected', connected)

      if (!connected) {
        const promise = new Promise<void>((resolve) => {
          // @ts-expect-error
          updateLastConversationMessage(conversationId!, {
            content: (
              <MessageWithComponent content={textContents}>
                <SetupConnection
                  name={'Google'}
                  checkConnectionStatus={checkGoogleConnectionStatus}
                  onConnect={() => resolve()}
                  icon={<GoogleIcon size={16} />}
                  createMagicLink={createMagicLinkForGoogle}
                />
              </MessageWithComponent>
            ),
            role: 'assistant',
          })
        })

        integrationAuthorized.set('google', promise)

        return
      }
      integrationAuthorized.set('google', Promise.resolve())
    }

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

  return { createLinearTicket, createNotionPage, createGoogleCalendarEvent, showLoading, sendSlackMessage }
}