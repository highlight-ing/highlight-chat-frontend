import { Toast } from '@/types'

type StreamParserProps = {
  showConfirmationModal: (message: string) => Promise<boolean>
  addToast: (toast: Partial<Toast>) => void
}

export async function parseAndHandleStreamChunk(chunk: string, { showConfirmationModal, addToast }: StreamParserProps) {
  let contextConfirmed: boolean | null = null
  let accumulatedContent = ''

  // Split the chunk into individual data objects
  const dataObjects = chunk.split(/\n(?=data: )/)

  for (const dataStr of dataObjects) {
    if (!dataStr.trim()) continue // Skip empty strings

    // Remove the 'data: ' prefix if it exists
    const jsonStr = dataStr.replace(/^data: /, '').trim()

    try {
      // Try to parse as JSON
      const jsonChunk = JSON.parse(jsonStr)

      switch (jsonChunk.type) {
        case 'text':
          accumulatedContent += jsonChunk.content
          break

        // We can define each tool use with different names
        case 'tool_use':
          if (jsonChunk.name === 'get_more_context') {
            if (contextConfirmed === null) {
              contextConfirmed = await showConfirmationModal(
                'The assistant is requesting additional context. Do you want to allow this?',
              )
            }
            if (contextConfirmed) {
              const window = jsonChunk.input.window
              if (window) {
                return { content: accumulatedContent, windowName: window }
              }
            }
          }
          break

        case 'done':
          // Message is complete, return the accumulated content and attachments added
          return { content: accumulatedContent, windowName: null }

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
  return { content: accumulatedContent, windowName: null }
}
