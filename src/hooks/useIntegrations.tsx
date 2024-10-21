import { CreateLinearTicketComponent } from '@/components/integrations/linear'
import { CreateNotionPageComponent } from '@/components/integrations/notion'
import { useStore } from '@/providers/store-provider'
import { useEffect, useState } from 'react'
import { checkLinearConnectionStatus, createMagicLinkForLinear } from '@/utils/linear-server-actions'
import { LinearIcon, NotionIcon } from '@/icons/icons'
import { SetupConnectionComponent } from '@/components/integrations/integration-auth'
import { checkNotionConnectionStatus, createMagicLinkForNotion } from '@/utils/notion-server-actions'

interface CreateNotionPageParams {
  title: string
  description: string
  content: string
}

export interface UseIntegrationsAPI {
  createLinearTicket: (conversationId: string, title: string, description: string) => Promise<void>
  createNotionPage: (conversationId: string, params: CreateNotionPageParams) => Promise<void>
  showLoading: (conversationId: string, functionName: string) => Promise<void>
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
          <CreateLinearTicketComponent title={title} description={description} />
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
          <CreateNotionPageComponent {...params} />
        </MessageWithComponent>
      ),
      role: 'assistant',
    })
  }

  async function showLoading(conversationId: string, functionName: string) {
    const lastMessage = getLastConversationMessage(conversationId)
    const textContents = lastMessage?.content as string

    previousContent.set(conversationId, textContents)

    // The two if blocks below handle the case where the user needs to connect their integration
    // We have a map that stores a Promise for each integration that is pending.
    if (functionName === 'create_linear_ticket') {
      //@ts-ignore
      const hlToken = (await highlight.internal.getAuthorizationToken()) as string

      const connected = await checkLinearConnectionStatus(hlToken)

      if (!connected) {
        const promise = new Promise<void>((resolve) => {
          // @ts-expect-error
          updateLastConversationMessage(conversationId!, {
            content: (
              <MessageWithComponent content={textContents}>
                <div className="mt-2">
                  <SetupConnectionComponent
                    name={'Linear'}
                    checkConnectionStatus={checkLinearConnectionStatus}
                    onConnect={() => resolve()}
                    icon={<LinearIcon size={16} />}
                    createMagicLink={createMagicLinkForLinear}
                  />
                </div>
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

    if (functionName === 'create_notion_page') {
      //@ts-ignore
      const hlToken = (await highlight.internal.getAuthorizationToken()) as string

      const connected = await checkNotionConnectionStatus(hlToken)

      if (!connected) {
        const promise = new Promise<void>((resolve) => {
          // @ts-expect-error
          updateLastConversationMessage(conversationId!, {
            content: (
              <MessageWithComponent content={textContents}>
                <div className="mt-2">
                  <SetupConnectionComponent
                    name={'Notion'}
                    checkConnectionStatus={checkNotionConnectionStatus}
                    onConnect={() => resolve()}
                    icon={<NotionIcon size={16} />}
                    createMagicLink={createMagicLinkForNotion}
                  />
                </div>
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
