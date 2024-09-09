import Highlight from '@highlight-ai/app-runtime'
import { FileAttachment, Toast } from '@/types'

type StreamParserProps = {
  formData: FormData
  addAttachment: (attachment: FileAttachment) => void
  showConfirmationModal: (message: string) => Promise<boolean>
  addToast: (toast: Partial<Toast>) => void
  handleSubmit: (input: string) => Promise<void>
}

export async function parseAndHandleStreamChunk(
  chunk: string,
  { formData, addAttachment, showConfirmationModal, addToast, handleSubmit }: StreamParserProps,
) {
  let contextConfirmed: boolean | null = null
  let accumulatedContent = ''
  let factIndex = null
  let fact = null
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
                await handleWindowContext(window, formData, addAttachment, handleSubmit)
              }
            }
          }
          if (jsonChunk.name === 'add_or_update_about_me_facts') {
            // This will update the fact at the specified index
            if (jsonChunk.input.fact_index && jsonChunk.input.fact) {
              console.log('incoming fact', jsonChunk.input.fact)
              console.log('incoming fact index', jsonChunk.input.fact_index)
              factIndex = jsonChunk.input.fact_index
              fact = jsonChunk.input.fact
            }
            // This will add the fact to the end of the array
            else if (jsonChunk.input.fact) {
              console.log('incoming fact', jsonChunk.input.fact)
              fact = jsonChunk.input.fact
            }
          }
          break

        case 'done':
          // Return both accumulated content and personalize flag
          return { content: accumulatedContent, factIndex, fact }

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

  // If we haven't returned yet, return the accumulated content and personalize flag
  return { content: accumulatedContent, factIndex, fact }
}

async function handleWindowContext(
  window: string,
  formData: FormData,
  addAttachment: (attachment: FileAttachment) => void,
  handleSubmit: (input: string) => Promise<void>,
) {
  const contextGranted = await Highlight.permissions.requestWindowContextPermission()
  const screenshotGranted = await Highlight.permissions.requestScreenshotPermission()
  if (contextGranted && screenshotGranted) {
    const screenshot = await Highlight.user.getWindowScreenshot(window)
    addAttachment({
      type: 'image',
      value: screenshot,
    })

    const windowContext = await Highlight.user.getWindowContext(window)
    const ocrScreenContents = windowContext.environment.ocrScreenContents || ''
    addAttachment({
      type: 'window_context',
      value: ocrScreenContents,
    })
    // await new Promise((resolve) => setTimeout(resolve, 500))

    // await handleSubmit("Here's the context you requested.") // When called it ignores the window context and image wtf?
  }
}
