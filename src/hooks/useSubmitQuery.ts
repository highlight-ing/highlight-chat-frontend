import { type HighlightContext } from '@highlight-ai/app-runtime'
import Highlight from '@highlight-ai/app-runtime'
import imageCompression from 'browser-image-compression'
import { useStore } from '@/providers/store-provider'
import useAuth from './useAuth'
import { useApi } from '@/hooks/useApi'
import { Prompt } from '@/types/supabase-helpers'
import { FileAttachment, FileAttachmentType, TextFileAttachment } from '@/types'
import { useShallow } from 'zustand/react/shallow'
import { useEffect, useRef } from 'react'
import { parseAndHandleStreamChunk } from '@/utils/streamParser'
import { trackEvent } from '@/utils/amplitude'
import * as Sentry from '@sentry/react'
import { processAttachments } from '@/utils/contextprocessor'
import { useIntegrations } from './useIntegrations'

async function compressImageIfNeeded(file: File): Promise<File> {
  const ONE_MB = 1 * 1024 * 1024 // 1MB in bytes
  if (file.size <= ONE_MB) {
    return file
  }

  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  }

  try {
    return await imageCompression(file, options)
  } catch (error) {
    console.error('Error compressing image:', error)
    return file
  }
}

async function fetchWindows() {
  const windows = await Highlight.user.getWindows()
  return windows.map((window) => window.windowTitle)
}

async function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function addAttachmentsToFormData(formData: FormData, attachments: any[]) {
  console.log('addAttachmentsToFormData')
  let screenshot, audio, fileTitle, clipboardText, ocrText, windowContext

  for (const attachment of attachments) {
    if (attachment?.value) {
      switch (attachment.type) {
        case 'text_file':
          formData.append('text_file', attachment.fileName + '\n' + attachment.value)
          break
        case 'image':
        case 'screenshot':
          screenshot = attachment.value
          if (attachment.file) {
            const compressedFile = await compressImageIfNeeded(attachment.file)
            const base64data = await readFileAsBase64(compressedFile)
            const mimeType = compressedFile.type || 'image/png'
            const base64WithMimeType = `data:${mimeType};base64,${base64data.split(',')[1]}`
            formData.append('base64_image', base64WithMimeType)
          } else if (typeof attachment.value === 'string' && attachment.value.startsWith('data:image')) {
            formData.append('base64_image', attachment.value)
          } else {
            console.error('Unsupported image format:', attachment.value)
          }
          break
        case 'pdf':
          fileTitle = attachment.value.name
          formData.append('pdf', attachment.value)
          break
        case 'audio':
          audio = attachment.value
          formData.append('audio', attachment.value)
          break
        case 'spreadsheet':
          fileTitle = attachment.value.name
          formData.append('spreadsheet', attachment.value)
          break
        case 'clipboard':
          clipboardText = attachment.value
          formData.append('clipboard_text', attachment.value)
          break
        case 'ocr':
          ocrText = attachment.value
          formData.append('ocr_text', attachment.value)
          break
        case 'window_context':
          windowContext = attachment.value
          formData.append('window_context', attachment.value)
          break
        case 'conversation':
          audio = attachment.value
          formData.append('audio', attachment.value)
          break
        default:
          console.warn('Unknown attachment type:', attachment.type)
      }
    }
  }

  return { screenshot, audio, fileTitle, clipboardText, ocrText, windowContext }
}

export const useSubmitQuery = () => {
  const { post } = useApi()

  const { addAttachment } = useStore(
    useShallow((state) => ({
      addAttachment: state.addAttachment,
    })),
  )

  const {
    getOrCreateConversationId,
    attachments,
    clearAttachments,
    setInputIsDisabled,
    aboutMe,
    addConversationMessage,
    updateLastConversationMessage,
    addToast,
    updateLastMessageSentTimestamp,
  } = useStore(
    useShallow((state) => ({
      getOrCreateConversationId: state.getOrCreateConversationId,
      attachments: state.attachments,
      clearAttachments: state.clearAttachments,
      setInputIsDisabled: state.setInputIsDisabled,
      aboutMe: state.aboutMe,
      addConversationMessage: state.addConversationMessage,
      updateLastConversationMessage: state.updateLastConversationMessage,
      addToast: state.addToast,
      updateLastMessageSentTimestamp: state.updateLastMessageSentTimestamp,
    })),
  )

  const setInput = useStore((state) => state.setInput)

  const abortControllerRef = useRef<AbortController>()
  const { getAccessToken } = useAuth()
  const conversationId = useStore((state) => state.conversationId)
  const conversationIdRef = useRef(conversationId)

  const integrations = useIntegrations()

  const { openModal, closeModal } = useStore(
    useShallow((state) => ({
      openModal: state.openModal,
      closeModal: state.closeModal,
    })),
  )

  const showConfirmationModal = (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      openModal('confirmation-modal', {
        header: 'Additional Context Requested',
        children: message,
        primaryAction: {
          label: 'Allow',
          onClick: () => {
            closeModal('confirmation-modal')
            resolve(true)
          },
          variant: 'primary',
        },
        secondaryAction: {
          label: 'Deny',
          onClick: () => {
            closeModal('confirmation-modal')
            resolve(false)
          },
          variant: 'ghost-neutral',
        },
      })
    })
  }

  const fetchResponse = async (
    conversationId: string,
    formData: FormData,
    token: string,
    isPromptApp: boolean,
    promptApp?: Prompt,
  ) => {
    setInputIsDisabled(true)
    const startTime = Date.now()

    console.log('promptApp: ', promptApp)
    try {
      const tools = {
        get_more_context_from_window: true,
        get_more_context_from_conversation: false,
        add_or_update_about_me_facts: false,
        create_linear_ticket: promptApp?.linear_integration_enabled ?? false,
        create_notion_page: promptApp?.create_notion_page_integration_enabled ?? false,
      }

      formData.append('conversation_id', conversationId)
      formData.append('tools', JSON.stringify(tools))

      const endpoint = isPromptApp ? 'chat/prompt-as-app' : 'chat/'

      const abortController = new AbortController()
      abortControllerRef.current = abortController

      const checkAbortSignal = () => {
        if (abortController.signal.aborted) {
          throw new Error('Chat message request aborted')
        }
      }

      const response = await post(endpoint, formData, { version: 'v3' })
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No reader available')
      }

      checkAbortSignal()

      addConversationMessage(conversationId!, { role: 'assistant', content: '' })

      let accumulatedMessage = ''

      while (!abortController.signal.aborted) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = new TextDecoder().decode(value)

        checkAbortSignal()

        const { content, windowName, conversation, factIndex, fact } = await parseAndHandleStreamChunk(chunk, {
          showConfirmationModal,
          addToast,
          integrations,
          conversationId,
        })

        if (content) {
          accumulatedMessage += content
          updateLastConversationMessage(conversationId, {
            role: 'assistant',
            content: accumulatedMessage,
          })
        }

        if (conversation) {
          const conversation_data = await Highlight.conversations.getConversationById(conversation)
          if (conversation_data) {
            addAttachment({
              type: 'audio',
              value: conversation_data.transcript,
              duration: Math.floor(
                (new Date(conversation_data.endedAt).getTime() - new Date(conversation_data.startedAt).getTime()) /
                  60000,
              ),
            })
          } else {
            addToast({
              title: 'Failed to request Conversation',
              description: 'We were unable to request conversation with this ID',
            })
          }
        }
        console.log('incoming from parser factIndex: ', factIndex, 'fact: ', fact)
        if (typeof factIndex === 'number' && fact) {
          updateLastConversationMessage(conversationId, {
            role: 'assistant',
            content: accumulatedMessage,
            factIndex: factIndex,
            fact: fact,
          })
        } else if (fact) {
          updateLastConversationMessage(conversationId, {
            role: 'assistant',
            content: accumulatedMessage,
            fact: fact,
          })
        }

        if (windowName) {
          const contextGranted = await Highlight.permissions.requestWindowContextPermission()
          const screenshotGranted = await Highlight.permissions.requestScreenshotPermission()
          if (contextGranted && screenshotGranted) {
            addToast({
              title: 'Context Granted',
              description: 'Context granted for ' + windowName,
              type: 'success',
              timeout: 5000,
            })
            const screenshot = await Highlight.user.getWindowScreenshot(windowName)
            addAttachment({
              type: 'image',
              value: screenshot,
            })

            const windowContext = await Highlight.user.getWindowContext(windowName)
            const ocrScreenContents = windowContext.application.focusedWindow.rawContents
              ? windowContext.application.focusedWindow.rawContents
              : windowContext.environment.ocrScreenContents || ''
            addAttachment({
              type: 'window_context',
              value: ocrScreenContents,
            })

            handleSubmit("Here's the context you requested.", promptApp, {
              image: screenshot,
              window_context: ocrScreenContents,
            })
          }
        }
      }
    } catch (error) {
      const endTime = Date.now()
      const duration = (endTime - startTime) / 1000

      // @ts-ignore
      console.error('Error fetching response:', error.stack ?? error.message)

      // @ts-ignore
      if (error.message.includes('aborted')) {
        console.log('Skipping message request, aborted')
      } else {
        // Log to Sentry
        Sentry.captureException(error, {
          extra: {
            conversationId,
            isPromptApp,
            duration,
            endpoint: isPromptApp ? 'chat/prompt-as-app' : 'chat/',
          },
        })

        // Log to Amplitude
        trackEvent('HL_CHAT_BACKEND_API_ERROR', {
          endpoint: isPromptApp ? 'chat/prompt-as-app' : 'chat/',
          duration,
          // @ts-ignore
          errorMessage: error.message,
        })

        addToast({
          title: 'Unexpected Error',
          // @ts-ignore
          description: `${error?.message}`,
          type: 'error',
          timeout: 15000,
        })
      }
    } finally {
      const endTime = Date.now()
      const duration = endTime - startTime

      // Log request to Amplitude
      trackEvent('HL_CHAT_BACKEND_API_REQUEST', {
        endpoint: isPromptApp ? 'chat/prompt-as-app' : 'chat/',
        duration,
        success: !abortControllerRef.current?.signal.aborted,
      })

      setInputIsDisabled(false)
      abortControllerRef.current = undefined
    }
  }

  const handleIncomingContext = async (context: HighlightContext, promptApp?: Prompt) => {
    console.log('Received context inside handleIncomingContext: ', context)
    console.log('Got attachment count: ', context.attachments?.length)
    context.attachments?.forEach((attachment) => {
      console.log('Attachment: ', JSON.stringify(attachment))
    })

    if (!context.application) {
      console.log('No application data in context, ignoring.')
      return
    }

    const query = context.suggestion || ''
    const screenshotUrl = context.attachments?.find((a) => a.type === 'screenshot')?.value
    const clipboardText = context.attachments?.find((a) => a.type === 'clipboard')?.value
    const audio = context.attachments?.find((a) => a.type === 'audio')?.value
    const windowTitle = context.application?.focusedWindow?.title
    // @ts-ignore
    const appIcon = context.application?.appIcon
    const rawContents = context.application?.focusedWindow?.rawContents

    // Extract OCR content
    const ocrText = context.environment?.ocrScreenContents

    // Use rawContents if available, otherwise use ocrText
    const contentToUse = rawContents || ocrText

    const fileAttachmentTypes = ['pdf', 'spreadsheet', 'text_file', 'image']

    const processedAttachments = processAttachments(context.attachments || [])
    const hasFileAttachment = processedAttachments.some((a: { type: string }) => fileAttachmentTypes.includes(a.type))

    // Fetch windows information
    const windows = await fetchWindows()

    if (query || clipboardText || contentToUse || screenshotUrl || audio || hasFileAttachment) {
      setInputIsDisabled(true)

      const fileAttachments = (processedAttachments as FileAttachment[]).filter(
        (a) => a.type && fileAttachmentTypes.includes(a.type),
      )

      const conversationId = getOrCreateConversationId()
      addConversationMessage(conversationId!, {
        role: 'user',
        content: query,
        clipboard_text: clipboardText,
        screenshot: screenshotUrl,
        audio,
        window: windowTitle ? { title: windowTitle, appIcon: appIcon, type: 'window' } : undefined,
        windows: windows,
        file_attachments: fileAttachments as unknown as FileAttachment[],
      })

      setInput('')
      // This will refresh the 'about me'
      updateLastMessageSentTimestamp()
      clearAttachments()

      const formData = new FormData()
      formData.append('prompt', query)
      formData.append('windows', JSON.stringify(windows))

      if (promptApp) {
        formData.append('app_id', promptApp.external_id)
      }

      if (aboutMe) {
        formData.append('about_me', JSON.stringify(aboutMe))
      }

      await addAttachmentsToFormData(formData, processedAttachments)

      // Add OCR text or raw contents to form data
      if (contentToUse) {
        formData.append('ocr_text', contentToUse)
      }

      const accessToken = await getAccessToken()
      await fetchResponse(conversationId!, formData, accessToken, !!promptApp, promptApp)
    }
  }

  const handleSubmit = async (
    input: string,
    promptApp?: Prompt,
    context?: { image?: string; window_context?: string },
  ) => {
    console.log('handleSubmit triggered')

    const query = input.trim()

    if (!query) {
      console.log('No query provided, ignoring.')
      return
    }

    try {
      setInputIsDisabled(true)

      const formData = new FormData()
      formData.append('prompt', query)

      const isPromptApp = !!promptApp

      if (isPromptApp && promptApp!.external_id !== undefined) {
        formData.append('app_id', promptApp!.external_id)
      }

      // Fetch windows information
      await Sentry.startSpan({ name: 'fetchWindows', op: 'function' }, async () => {
        const windows = await fetchWindows()
        formData.append('windows', JSON.stringify(windows))
      })

      if (aboutMe) {
        formData.append('about_me', JSON.stringify(aboutMe))
      }

      // TODO(umut): This is a hack to add the context to the form data.
      if (context) {
        if (context.image) {
          formData.append('screenshot', context.image)
        }
        if (context.window_context) {
          formData.append('window_context', context.window_context)
        }
      }

      const { screenshot, audio, fileTitle, clipboardText, ocrText, windowContext } = await Sentry.startSpan(
        { name: 'addAttachmentsToFormData', op: 'function' },
        async () => {
          return await addAttachmentsToFormData(formData, attachments)
        },
      )

      const conversationId = getOrCreateConversationId()
      addConversationMessage(conversationId!, {
        role: 'user',
        content: query,
        screenshot,
        ocr_text: ocrText,
        audio,
        file_title: fileTitle,
        clipboard_text: clipboardText,
        windows: await fetchWindows(),
        window_context: windowContext,
        file_attachments: attachments.filter((attachment) => attachment.type === 'text_file'),
      })

      setInput('')
      updateLastMessageSentTimestamp()
      clearAttachments()

      const accessToken = await getAccessToken()
      await fetchResponse(conversationId!, formData, accessToken, isPromptApp, promptApp)
    } catch (error) {
      console.error('Error in handleSubmit: ', error)
      Sentry.captureException(error)
    } finally {
      setInputIsDisabled(false)
    }
  }

  useEffect(() => {
    conversationIdRef.current = conversationId
  }, [conversationId])

  return { handleSubmit, handleIncomingContext }
}
