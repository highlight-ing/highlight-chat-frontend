import { MetadataEvent, Toast, VisualizationData } from '@/types'

import { UseIntegrationsAPI } from '@/features/integrations/_hooks/use-integrations'
import { integrationFunctionNames } from '@/features/integrations/utils'

type StreamParserProps = {
  showConfirmationModal: (message: string) => Promise<boolean>
  addToast: (toast: Partial<Toast>) => void
  integrations: UseIntegrationsAPI
  conversationId: string
  onMetadata?: (metadata: MetadataEvent) => void
}

type StreamParserResult = {
  content: string
  windowName: string | null
  conversation: string | null
  factIndex: number | null
  fact: string | null
  messageId: string | null
  visualization?: VisualizationData
}

function extractIframeFromContent(content: string): { text: string; iframe?: string } {
  const iframeMatch = content.match(/<iframe[^>]*>.*?<\/iframe>/i)
  if (!iframeMatch) {
    return { text: content }
  }

  // Remove the script tag if it exists
  const cleanContent = content.replace(/<script.*?<\/script>/i, '')

  return {
    text: '', // Don't keep the text description
    iframe: iframeMatch[0],
  }
}

export async function parseAndHandleStreamChunk(
  chunk: string,
  { showConfirmationModal, addToast, integrations, conversationId, onMetadata }: StreamParserProps,
): Promise<StreamParserResult> {
  let contextConfirmed: boolean | null = null
  let accumulatedContent = ''
  let factIndex = null
  let fact = null
  let messageId = null
  let visualization: VisualizationData | undefined = undefined
  let isVisualizationMessage = false

  // Split the chunk into individual data objects
  const dataObjects = chunk.split(/\n(?=data: )/)

  for (const dataStr of dataObjects) {
    if (!dataStr.trim()) continue // Skip empty strings

    // Remove the 'data: ' prefix if it exists
    const jsonStr = dataStr.replace(/^data: /, '').trim()

    try {
      // Try to parse as JSON
      const jsonChunk = JSON.parse(jsonStr)
      console.log('got a chunk', jsonChunk)

      switch (jsonChunk.type) {
        case 'metadata':
          if (jsonChunk.conversation_id && jsonChunk.message_id) {
            console.log('Received metadata event:', jsonChunk)
            if (onMetadata) {
              onMetadata(jsonChunk as MetadataEvent)
            }
            // Check if this is a visualization message
            if (jsonChunk.visualization) {
              isVisualizationMessage = true
              accumulatedContent = '' // Reset content for visualization messages
            }
          }
          break

        case 'text':
          messageId = jsonChunk.message_id

          // Always accumulate content, including the iframe
          accumulatedContent += jsonChunk.content

          // If visualization data is present, store it
          if (jsonChunk.visualization) {
            visualization = jsonChunk.visualization
          }
          break

        case 'loading':
          if (jsonChunk.name === 'highlight_search') {
            integrations.showLoading(conversationId, jsonChunk.loaded)
          } else if (jsonChunk.agent_name && jsonChunk.tool_name) {
            integrations.showMCPLoader(conversationId, jsonChunk.loaded, {
              agentName: jsonChunk.agent_name,
              toolName: jsonChunk.tool_name,
            })
          }
          break

        // We can define each tool use with different names
        case 'tool_use':
          if (jsonChunk.name === 'get_more_context_from_window' || jsonChunk.name === 'get_more_context') {
            if (contextConfirmed === null) {
              contextConfirmed = await showConfirmationModal(
                'The assistant is requesting additional context. Do you want to allow this?',
              )
            }
            if (contextConfirmed) {
              const window = jsonChunk.input.window
              if (window) {
                return {
                  content: accumulatedContent,
                  windowName: window,
                  conversation: null,
                  factIndex: null,
                  fact: null,
                  messageId: messageId,
                }
              }
            }
          } else if (jsonChunk.name === 'create_linear_ticket') {
            const title = jsonChunk.input.title ?? ''
            const description = jsonChunk.input.description ?? ''

            integrations.createLinearTicket(conversationId, title, description)
          } else if (jsonChunk.name === 'create_notion_page') {
            const title = jsonChunk.input.title ?? ''
            const description = jsonChunk.input.description ?? undefined
            const content = jsonChunk.input.content ?? ''

            integrations.createNotionPage(conversationId, { title, description, content })
          } else if (jsonChunk.name === 'send_slack_message') {
            integrations.sendSlackMessage(conversationId, {
              message: jsonChunk.input.message ?? '',
            })
          } else if (jsonChunk.name === 'create_google_calendar_event') {
            const summary = jsonChunk.input.summary ?? ''
            const location = jsonChunk.input.location ?? undefined
            const description = jsonChunk.input.description ?? undefined
            const start = jsonChunk.input.start ?? undefined
            const end = jsonChunk.input.end ?? undefined

            integrations.createGoogleCalendarEvent(conversationId, {
              summary,
              location,
              description,
              start,
              end,
              includeGoogleMeetDetails: false,
            })
          } else if (jsonChunk.name === 'get_more_context_from_conversations') {
            if (contextConfirmed === null) {
              contextConfirmed = await showConfirmationModal(
                'The assistant is requesting additional context. Do you want to allow this?',
              )
            }
            if (contextConfirmed) {
              const conversation = jsonChunk.input.conversation
              if (conversation) {
                return {
                  content: accumulatedContent,
                  windowName: null,
                  conversation: conversation,
                  factIndex: null,
                  fact: null,
                  messageId: messageId,
                }
              }
            }
          } else if (jsonChunk.name === 'add_or_update_about_me_facts') {
            // This will update the fact at the specified index
            if (typeof jsonChunk.input.fact_index === 'number' && jsonChunk.input.fact) {
              factIndex = jsonChunk.input.fact_index
              fact = jsonChunk.input.fact
              return {
                content: accumulatedContent,
                windowName: null,
                conversation: null,
                factIndex: factIndex,
                fact: fact,
                messageId: messageId,
              }
            }
            // This will add the fact to the end of the array
            else if (jsonChunk.input.fact) {
              fact = jsonChunk.input.fact
              return {
                content: accumulatedContent,
                windowName: null,
                conversation: null,
                factIndex: null,
                fact: fact,
                messageId: messageId,
              }
            }
          } else if (jsonChunk.agent_id || jsonChunk.agent_name) {
            console.log('Trying to find tool from MCP, Tool Name:', jsonChunk.name)
            integrations.createMCPTool(conversationId, {
              toolName: jsonChunk.name,
              toolInput: jsonChunk.input,
              toolId: jsonChunk.tool_id,
              agentId: jsonChunk.agent_id,
              agentName: jsonChunk.agent_name,
            })
          } else {
            console.log('Unknown tool name:', jsonChunk.name)
          }
          break

        case 'done':
          // Message is complete, return the accumulated content and attachments added
          return {
            content: accumulatedContent,
            windowName: null,
            conversation: null,
            factIndex: null,
            fact: null,
            messageId: messageId,
            visualization: visualization,
          }

        case 'message_delta':
          // Handle message delta if needed
          break

        case 'error':
          console.error('Error from backend:', jsonChunk.content)
          addToast({
            title: 'Unexpected Server Error',
            description: jsonChunk.content,
            type: 'error',
            timeout: 15000,
          })
          break

        default:
          console.warn('Unknown chunk type:', jsonChunk.type)
      }
    } catch (parseError) {
      // If parsing fails, log the error but don't add the content
      addToast({
        title: 'Unexpected Parse Error',
        description: 'Error parsing incoming response from the server.',
        type: 'error',
        timeout: 15000,
      })
      console.error('Error parsing JSON:', parseError, 'Raw data:', jsonStr)
    }
  }

  // If we haven't returned yet, return the accumulated content and attachments added
  return {
    content: accumulatedContent,
    windowName: null,
    conversation: null,
    factIndex: null,
    fact: null,
    messageId: messageId,
    visualization: visualization,
  }
}
