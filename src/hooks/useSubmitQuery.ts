// src/hooks/useSubmitQuery.ts
import { useEffect, useRef } from 'react'
import { Attachment, FileAttachment, ImageAttachment, PdfAttachment } from '@/types'
import Highlight, { HighlightContext } from '@highlight-ai/app-runtime'
import * as Sentry from '@sentry/react'
import { v4 as uuidv4 } from 'uuid'
import { useShallow } from 'zustand/react/shallow'

import { Prompt } from '@/types/supabase-helpers'
import { trackEvent } from '@/utils/amplitude'
import { fetchWindows } from '@/utils/attachmentUtils'
import { processAttachments } from '@/utils/contextprocessor'
// Import necessary types from formDataUtils
import {
  AboutMeAttachment,
  AttachedContexts,
  AvailableContexts,
  buildFormData,
  ClipboardTextAttachment,
  ConversationAttachment,
  ConversationAttachmentMetadata,
  ImageAttachmentMetadata,
  OCRTextAttachment,
  PDFAttachment,
  SpreadsheetAttachment,
  TextFileAttachmentMetadata,
  WindowContentsAttachment,
  WindowListAttachment,
} from '@/utils/formDataUtils'
import { parseAndHandleStreamChunk } from '@/utils/streamParser'
import { formatDateForConversation, getWordCount } from '@/utils/string'
import { useApi } from '@/hooks/useApi'
import { useStore } from '@/components/providers/store-provider'

import { useIntegrations } from '@/features/integrations/_hooks/use-integrations'

import { useUploadFile } from './useUploadFile'

// Create a type guard for FileAttachment
function isUploadableAttachment(attachment: Attachment): attachment is PdfAttachment | ImageAttachment {
  return ['pdf', 'image'].includes(attachment.type)
}

async function createAttachmentMetadata(
  attachment: FileAttachment | Attachment,
  fileId?: string,
): Promise<
  | TextFileAttachmentMetadata
  | ImageAttachmentMetadata
  | PDFAttachment
  | OCRTextAttachment
  | WindowContentsAttachment
  | WindowListAttachment
  | ClipboardTextAttachment
  | AboutMeAttachment
  | ConversationAttachment
  | SpreadsheetAttachment
  | undefined
> {
  switch (attachment.type) {
    case 'pdf':
      return {
        type: 'pdf',
        name: attachment.value.name,
        file_id: fileId || '',
      }
    case 'image':
      return {
        type: 'image',
        file_id: fileId || '',
      }
    case 'text_file':
      return {
        type: 'text_file',
        name: attachment.fileName || 'Unnamed text file',
        text: attachment.value,
        words: getWordCount(attachment.value),
        created_at: new Date(),
      }
    case 'spreadsheet':
      const text = await attachment.value.text()

      return {
        type: 'spreadsheet',
        content: text,
        name: attachment.value.name,
      }
    case 'window_context':
      return {
        type: 'window_contents',
        text: attachment.value,
        name: '',
        words: getWordCount(attachment.value),
        created_at: new Date(),
      }
    case 'clipboard':
      return {
        type: 'clipboard_text',
        text: attachment.value,
      }
    case 'audio': // TODO (SP) there should be no more audio attachments, just conversations. This is coming soon
      return {
        id: uuidv4(),
        type: 'conversation',
        title: 'conversation',
        text: attachment.value,
        started_at: new Date().toISOString(),
        ended_at: new Date().toISOString(),
      }
    case 'conversation':
      return {
        id: attachment.id,
        type: 'conversation',
        title: attachment.title,
        text: attachment.value,
        started_at: new Date(attachment.startedAt).toISOString(),
        ended_at: attachment.isCurrentConversation
          ? new Date().toISOString()
          : new Date(attachment.endedAt).toISOString(),
      }
    default:
      console.error('Unknown attachment type:', attachment.type)
      return undefined
  }
}

// Add this helper function at the top of the file
function getFileType(attachment: Attachment): string {
  switch (attachment.type) {
    case 'pdf':
      return 'application/pdf'
    case 'image':
      return attachment.value?.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg'
    case 'spreadsheet':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    case 'text_file':
      return 'text/plain'
    default:
      return 'application/octet-stream'
  }
}

interface ToolOverrides {
  create_linear_ticket?: boolean
  create_notion_page?: boolean
}

export const useSubmitQuery = () => {
  const { get, post } = useApi()
  const { uploadFile } = useUploadFile()

  const {
    addAttachment,
    getConversationId,
    setConversationId,
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
      addAttachment: state.addAttachment,
      getConversationId: state.getConversationId,
      setConversationId: state.setConversationId,
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

  const { openModal, closeModal } = useStore(
    useShallow((state) => ({
      openModal: state.openModal,
      closeModal: state.closeModal,
    })),
  )

  const setInput = useStore((state) => state.setInputOverride)
  const conversationId = useStore((state) => state.conversationId)
  const conversationIdRef = useRef(conversationId)
  const abortControllerRef = useRef<AbortController>()
  const integrations = useIntegrations()

  // Centralized Error Handling
  const handleError = (error: any, context: any) => {
    console.error('Error:', error)
    Sentry.captureException(error, { extra: context })
    trackEvent('HL_CHAT_BACKEND_API_ERROR', {
      ...context,
      errorMessage: error.message,
    })
    addToast({
      title: 'Unexpected Error',
      description: `${error?.message}`,
      type: 'error',
      timeout: 15000,
    })
  }

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

  const TWO_SECONDS_IN_MILLISECONDS = 2000

  // Validates conversation ID's that are generated in HL Chat
  const createAndValidateConversationId = async () => {
    try {
      const newConversationId = uuidv4()
      const response = (await Promise.race([
        get(`conversation/${newConversationId}/exists`, { version: 'v4' }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Validation timeout. Generated a new one')), TWO_SECONDS_IN_MILLISECONDS),
        ),
      ])) as Response

      if (typeof response === 'object' && !response?.ok)
        throw new Error('Could not validate conversation ID. Generated a new one')

      const data = (await response.json()) as { id: string }
      const idIsTheSame = newConversationId === data.id
      console.log(`${idIsTheSame ? 'The same' : 'ID exists! A new'} conversation ID was returned`)

      setConversationId(data.id)
      return data.id
    } catch (error: any) {
      handleError(error, { method: 'validateConversationId' })
      // Return new conversation ID if there's an error with the end point
      console.log('Error. Generating new conversation ID...')
      const newId = uuidv4()

      setConversationId(newId)
      return newId
    }
  }

  const checkAbortSignal = () => {
    if (abortControllerRef.current?.signal.aborted) {
      throw new Error('Chat message request aborted')
    }
  }

  const fetchResponse = async (
    conversationId: string,
    formData: FormData,
    isPromptApp: boolean,
    promptApp?: Prompt | null,
    toolOverrides?: ToolOverrides,
  ) => {
    setInputIsDisabled(true)
    const startTime = Date.now()

    console.log('promptApp: ', promptApp)
    try {
      const tools = {
        create_linear_ticket:
          (promptApp?.linear_integration_enabled ?? false) || (toolOverrides?.create_linear_ticket ?? false),
        create_notion_page:
          (promptApp?.create_notion_page_integration_enabled ?? false) || (toolOverrides?.create_notion_page ?? false),
        create_google_calendar_event: promptApp?.create_gcal_event_integration_enabled ?? false,
        send_slack_message: promptApp?.send_slack_message_integration_enabled ?? false,
      }

      formData.append('conversation_id', conversationId)
      formData.append('tools', JSON.stringify(tools))
      formData.append('origin', 'https://chat.highlight.ing')

      const endpoint = 'chat/'

      const abortController = new AbortController()
      abortControllerRef.current = abortController

      if (isPromptApp && promptApp) {
        formData.append('app_id', promptApp.external_id)
      }

      const response = await post(endpoint, formData, {
        version: 'v4',
        signal: abortController.signal,
        // @ts-ignore
        headers: {
          Accept: 'text/event-stream',
        },
      })

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`)
      }

      // @ts-expect-error
      addConversationMessage(conversationId, { role: 'assistant', content: '' })

      let accumulatedMessage = ''
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      if (!reader) {
        throw new Error('No reader available')
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        checkAbortSignal()

        // Append new chunk to buffer and split by newlines
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')

        // Process all complete lines
        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i].trim()
          if (line.startsWith('data: ')) {
            const eventData = line.slice(6) // Remove 'data: ' prefix
            if (eventData === '[DONE]') continue

            try {
              const { content, windowName, conversation, factIndex, fact, messageId, visualization } =
                await parseAndHandleStreamChunk(eventData, {
                  showConfirmationModal,
                  addToast,
                  integrations,
                  conversationId,
                  onMetadata: (metadata) => {
                    if (metadata.provider_switch) {
                      console.log('[Provider Switch Event]:', {
                        from: metadata.from_provider,
                        to: metadata.to_provider,
                        reason: metadata.switch_reason,
                        model: metadata.model,
                        llm_provider: metadata.llm_provider,
                        has_live_data: metadata.has_live_data,
                        requires_live_data: metadata.requires_live_data,
                      })
                    } else if (metadata.tool_activated) {
                      console.log('[Tool Activation Event]:', {
                        tool_name: metadata.tool_name,
                        tool_id: metadata.tool_id,
                      })
                    } else if (metadata.model && metadata.llm_provider) {
                      console.log('[Initial Chat Event]:', {
                        model: metadata.model,
                        llm_provider: metadata.llm_provider,
                        has_live_data: metadata.has_live_data,
                        requires_live_data: metadata.requires_live_data,
                      })
                    }
                  },
                })

              if (content) {
                accumulatedMessage += content
                updateLastConversationMessage(conversationId, {
                  role: 'assistant',
                  content: accumulatedMessage,
                  conversation_id: conversationId,
                  id: messageId,
                  given_feedback: null,
                  visualization: visualization,
                })
              }

              if (conversation) {
                const conversation_data = await Highlight.conversations.getConversationById(conversation)
                if (conversation_data) {
                  addAttachment({
                    type: 'audio',
                    value: conversation_data.transcript,
                    duration: Math.floor(
                      (new Date(conversation_data.endedAt).getTime() -
                        new Date(conversation_data.startedAt).getTime()) /
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

              if (typeof factIndex === 'number' && fact) {
                updateLastConversationMessage(conversationId, {
                  role: 'assistant',
                  content: accumulatedMessage,
                  conversation_id: conversationId,
                  factIndex: factIndex,
                  fact: fact,
                  id: messageId,
                  given_feedback: null,
                  visualization: visualization,
                })
              } else if (fact) {
                updateLastConversationMessage(conversationId, {
                  role: 'assistant',
                  content: accumulatedMessage,
                  conversation_id: conversationId,
                  fact: fact,
                  id: messageId,
                  given_feedback: null,
                  visualization: visualization,
                })
              }

              if (windowName) {
                const contextGranted = await Highlight.permissions.requestWindowContextPermission()
                const screenshotGranted = await Highlight.permissions.requestScreenshotPermission()
                if (contextGranted && screenshotGranted) {
                  addToast({
                    title: 'Context Granted',
                    description: `Context granted for ${windowName}`,
                    type: 'success',
                    timeout: 5000,
                  })
                  const screenshot = await Highlight.user.getWindowScreenshot(windowName)
                  addAttachment({ type: 'image', value: screenshot })

                  const windowContext = await Highlight.user.getWindowContext(windowName)
                  const ocrScreenContents = windowContext.application.focusedWindow.rawContents
                    ? windowContext.application.focusedWindow.rawContents
                    : windowContext.environment.ocrScreenContents || ''
                  addAttachment({ type: 'window_context', value: ocrScreenContents })

                  await handleSubmit("Here's the context you requested.", promptApp, {
                    image: screenshot,
                    window_context: ocrScreenContents,
                  })
                }
              }
            } catch (error) {
              console.error('Error parsing event data:', error)
            }
          }
        }
        // Keep the last incomplete line in the buffer
        buffer = lines[lines.length - 1]
      }
    } catch (error: any) {
      const endTime = Date.now()
      const duration = (endTime - startTime) / 1000

      if (error.message.includes('aborted')) {
        console.log('Skipping message request, aborted')
      } else {
        handleError(error, {
          conversationId,
          isPromptApp,
          duration,
          endpoint: 'chat/',
        })
      }
    } finally {
      const endTime = Date.now()
      const duration = endTime - startTime

      trackEvent('HL_CHAT_BACKEND_API_REQUEST', {
        endpoint: 'chat/',
        duration,
        success: !abortControllerRef.current?.signal.aborted,
      })

      setInputIsDisabled(false)
      abortControllerRef.current = undefined
    }
  }

  // This function no longer be required as the first response from the assistant will
  // be created within the assistant preview window
  const handleIncomingContext = async (context: HighlightContext, promptApp?: Prompt) => {
    console.log('Received context:', context)

    if (!context.application) {
      console.log('No application data in context, ignoring.')
      return
    }

    const { suggestion: query = '', attachments: rawAttachments = [], application, environment } = context

    const screenshotUrl = rawAttachments.find((a) => a.type === 'screenshot')?.value
    const clipboardText = rawAttachments.find((a) => a.type === 'clipboard')?.value
    const audio = rawAttachments.find((a) => a.type === 'audio')?.value
    const windowTitle = application.focusedWindow?.title
    const appIcon = application.appIcon
    const rawContents = application.focusedWindow?.rawContents
    const ocrText = environment?.ocrScreenContents
    const contentToUse = rawContents || ocrText

    const processedAttachments = processAttachments(rawAttachments)
    const hasFileAttachment = processedAttachments.some((a) =>
      ['pdf', 'spreadsheet', 'text_file', 'image'].includes(a.type),
    )

    const windows = await fetchWindows()

    if (!query || query === '') {
      console.log('No query provided, ignoring.')
      return
    }

    if (query || clipboardText || contentToUse || screenshotUrl || audio || hasFileAttachment) {
      setInputIsDisabled(true)

      const fileAttachments = attachments.filter(isUploadableAttachment)

      let conversationId = getConversationId()
      if (!conversationId) {
        conversationId = await createAndValidateConversationId()
      }

      // @ts-expect-error
      addConversationMessage(conversationId, {
        role: 'user',
        content: query,
        clipboard_text: clipboardText,
        screenshot: screenshotUrl,
        audio,
        window: windowTitle ? { title: windowTitle, appIcon, type: 'window' } : undefined,
        file_attachments: fileAttachments as unknown as FileAttachment[],
      })

      setInput('')
      // This will refresh the 'about me'
      updateLastMessageSentTimestamp()
      clearAttachments()

      // Extract and format attached_context_metadata
      const attachedContext: AttachedContexts = {
        context: [],
      }

      const availableContexts: AvailableContexts = {
        context: [],
      }

      // Upload files first
      const uploadedFiles = await Promise.all(
        fileAttachments.map(async (attachment) => {
          const fileName = `${uuidv4()}.${attachment.type}`
          const mimeType = getFileType(attachment)
          const uploadedFile = await uploadFile(
            new File([attachment.value], fileName, { type: mimeType }),
            conversationId,
          )
          return {
            originalAttachment: attachment,
            uploadedFile: uploadedFile,
          }
        }),
      )

      // Create a map of original attachments to file IDs
      const attachmentToFileIdMap = new Map(
        uploadedFiles.map(({ originalAttachment, uploadedFile }) => [originalAttachment, uploadedFile?.file_id]),
      )

      // Now you can use this map to get the file ID for any file attachment
      fileAttachments.forEach(async (attachment) => {
        const fileId = attachmentToFileIdMap.get(attachment)
        if (fileId) {
          const metadata = await createAttachmentMetadata(attachment, fileId)
          if (metadata) attachedContext.context.push(metadata)
        }
      })

      const conversationData = await Highlight.conversations.getAllConversations()
      const conversationAttachments: Array<ConversationAttachmentMetadata> = conversationData
        .filter((conversation) => {
          return Object.entries(conversation).every(([key, value]) => key !== undefined && value !== undefined)
        })
        .map((conversation) => ({
          id: conversation.id,
          type: 'conversation',
          title: conversation.title,
          words: conversation.transcript ? conversation.transcript.split(/\s+/).length : 0,
          started_at: formatDateForConversation(conversation.startedAt),
          ended_at: formatDateForConversation(conversation.endedAt),
        }))

      availableContexts.context.push(...conversationAttachments)

      if (rawContents) {
        const windowContentsAttachment: WindowContentsAttachment = {
          type: 'window_contents',
          text: rawContents,
          name: 'Window Contents',
          words: getWordCount(rawContents),
          created_at: new Date(),
        }
        attachedContext.context.push(windowContentsAttachment)
      }

      if (aboutMe) {
        const aboutMeAttachment: AboutMeAttachment = {
          type: 'about_me',
          text: aboutMe.join('\n'),
        }
        attachedContext.context.push(aboutMeAttachment)
      }

      // Add window list and conversation metadata here
      const windowListAttachment: WindowListAttachment = {
        type: 'window_list',
        titles: windows,
      }
      availableContexts.context.push(windowListAttachment)

      // Build FormData using the updated builder
      const formData = await buildFormData({
        prompt: query,
        conversationId,
        llmProvider: 'anthropic',
        attachedContext,
        availableContexts,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      })

      await fetchResponse(conversationId, formData, !!promptApp, promptApp)
    }
  }

  const handleSubmit = async (
    input: string,
    promptApp?: Prompt | null,
    context?: { image?: string; window_context?: string; conversation?: ConversationAttachment },
    toolOverrides?: ToolOverrides,
  ) => {
    const query = input.trim()

    if (!query || query === '') {
      console.log('No query provided, ignoring.')
      return
    }

    try {
      setInputIsDisabled(true)

      let conversationId = getConversationId()
      if (!conversationId) {
        conversationId = await createAndValidateConversationId()
      }

      // Extract and format attached_context_metadata
      const attachedContext: AttachedContexts = {
        context: [],
      }

      const availableContexts: AvailableContexts = {
        context: [],
      }

      // Upload files first
      const uploadFilePromises = await Promise.all(
        attachments.filter(isUploadableAttachment).map(async (attachment) => {
          let fileOrUrl: File | string = attachment.value

          // If it's a string, assume it's a URL (could be a local URL)
          if (typeof attachment.value === 'string') {
            fileOrUrl = attachment.value // Pass the URL directly
          } else {
            const fileName = `${uuidv4()}.${attachment.type}`
            const mimeType = getFileType(attachment)
            fileOrUrl = new File([attachment.value], fileName, { type: mimeType })
          }

          const uploadedFile = await uploadFile(fileOrUrl, conversationId)

          if (uploadedFile && uploadedFile.file_id) {
            const metadata = await createAttachmentMetadata(attachment, uploadedFile.file_id)
            if (metadata) attachedContext.context.push(metadata)
          }
        }),
      )

      await Promise.all(uploadFilePromises)

      // Add non-uploadable attachments to attachedContext
      attachments
        .filter((a) => !isUploadableAttachment(a))
        .forEach(async (attachment) => {
          const metadata = await createAttachmentMetadata(attachment)
          if (metadata) attachedContext.context.push(metadata)
        })

      const conversationData = await Highlight.conversations.getAllConversations()
      const conversationAttachments: Array<ConversationAttachmentMetadata> = conversationData
        .filter((conversation) => {
          return Object.entries(conversation).every(([key, value]) => key !== undefined && value !== undefined)
        })
        .map((conversation) => ({
          id: conversation.id,
          type: 'conversation',
          title: conversation.title,
          words: conversation.transcript ? conversation.transcript.split(/\s+/).length : 0,
          started_at: formatDateForConversation(conversation.startedAt),
          ended_at: formatDateForConversation(conversation.endedAt),
        }))

      availableContexts.context.push(...conversationAttachments)

      if (context?.window_context) {
        const windowContentsAttachment: WindowContentsAttachment = {
          type: 'window_contents',
          text: context?.window_context,
          name: 'Window Contents',
          words: getWordCount(context?.window_context),
          created_at: new Date(),
        }
        attachedContext.context.push(windowContentsAttachment)
      }

      if (aboutMe) {
        const aboutMeAttachment: AboutMeAttachment = {
          type: 'about_me',
          text: aboutMe.join('\n'),
        }
        attachedContext.context.push(aboutMeAttachment)
      }

      if (context?.conversation) {
        const conversationAttachment: ConversationAttachment = {
          id: context.conversation.id,
          type: 'conversation',
          title: context.conversation.title,
          text: context.conversation.text,
          started_at: context.conversation.started_at,
          ended_at: context.conversation.ended_at,
        }
        attachedContext.context.push(conversationAttachment)
      }

      const windows = await fetchWindows()
      // Add window list and conversation metadata here
      const windowListAttachment: WindowListAttachment = {
        type: 'window_list',
        titles: windows,
      }
      availableContexts.context.push(windowListAttachment)

      // Build FormData using the updated builder
      const formData = await buildFormData({
        prompt: query,
        conversationId,
        llmProvider: 'anthropic',
        attachedContext,
        availableContexts,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      })

      // @ts-expect-error
      addConversationMessage(conversationId, {
        role: 'user',
        version: 'v4',
        content: query,
        screenshot: context?.image,
        window_context: context?.window_context,
        file_attachments: attachments.filter((a) => a.type === 'text_file'),
        attached_context: attachedContext.context,
      })

      setInput('')
      updateLastMessageSentTimestamp()
      clearAttachments()

      await fetchResponse(conversationId, formData, !!promptApp, promptApp, toolOverrides)
    } catch (error: any) {
      handleError(error, { method: 'handleSubmit' })
    } finally {
      setInputIsDisabled(false)
    }
  }

  useEffect(() => {
    conversationIdRef.current = conversationId
  }, [conversationId])

  return { handleSubmit, handleIncomingContext }
}
