// src/hooks/useSubmitQuery.ts
import { useEffect, useRef } from 'react'
import { useStore } from '@/providers/store-provider'
import useAuth from './useAuth'
import { useApi } from '@/hooks/useApi'
import { Prompt } from '@/types/supabase-helpers'
import { useShallow } from 'zustand/react/shallow'
import { HighlightContext } from '@highlight-ai/app-runtime'
import Highlight from '@highlight-ai/app-runtime'
import * as Sentry from '@sentry/react'

import { fetchWindows } from '@/utils/attachmentUtils'
import { parseAndHandleStreamChunk } from '@/utils/streamParser'
import {
  buildFormData,
  OCRTextAttachment,
  WindowListAttachment,
  ClipboardTextAttachment,
  AboutMeAttachment,
  ConversationAttachment,
  AttachedContexts,
  AvailableContexts,
  ConversationAttachmentMetadata,
} from '@/utils/formDataUtils'
import { trackEvent } from '@/utils/amplitude'
import { processAttachments } from '@/utils/contextprocessor'
import { FileAttachment, ImageAttachment, PdfAttachment } from '@/types'
import { useUploadFile } from './useUploadFile'
import { v4 as uuidv4 } from 'uuid'
import { Attachment } from '@/types'
import { useIntegrations } from './useIntegrations'
import { formatDateForConversation } from '@/utils/string'

// Create a type guard for FileAttachment
function isUploadableAttachment(attachment: Attachment): attachment is PdfAttachment | ImageAttachment {
  return ['pdf', 'image'].includes(attachment.type)
}

// Import necessary types from formDataUtils
import {
  TextFileAttachmentMetadata,
  ImageAttachmentMetadata,
  PDFAttachment,
  WindowContentsAttachment,
  SpreadsheetAttachment,
} from '@/utils/formDataUtils'
import { getWordCount } from '@/utils/string'

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
  const { post } = useApi()
  const { getAccessToken } = useAuth()
  const { uploadFile } = useUploadFile()

  const {
    addAttachment,
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
      addAttachment: state.addAttachment,
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

  const { openModal, closeModal } = useStore(
    useShallow((state) => ({
      openModal: state.openModal,
      closeModal: state.closeModal,
    })),
  )

  const setInput = useStore((state) => state.setInput)
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

  const checkAbortSignal = () => {
    if (abortControllerRef.current?.signal.aborted) {
      throw new Error('Chat message request aborted')
    }
  }

  const fetchResponse = async (
    conversationId: string,
    formData: FormData,
    isPromptApp: boolean,
    promptApp?: Prompt,
    toolOverrides?: ToolOverrides,
  ) => {
    setInputIsDisabled(true)
    const startTime = Date.now()

    console.log('promptApp: ', promptApp)
    try {
      const tools = {
        get_more_context_from_window: true,
        get_more_context_from_conversation: false,
        add_or_update_about_me_facts: false,
        create_linear_ticket:
          (promptApp?.linear_integration_enabled ?? false) || (toolOverrides?.create_linear_ticket ?? false),
        create_notion_page:
          (promptApp?.create_notion_page_integration_enabled ?? false) || (toolOverrides?.create_notion_page ?? false),
      }

      formData.append('conversation_id', conversationId)
      formData.append('tools', JSON.stringify(tools))

      const endpoint = 'chat/'

      const abortController = new AbortController()
      abortControllerRef.current = abortController

      if (isPromptApp && promptApp) {
        formData.append('app_id', promptApp.external_id)
      }
      const response = await post(endpoint, formData, { version: 'v4', signal: abortController.signal })
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No reader available')
      }

      addConversationMessage(conversationId, { role: 'assistant', content: '' })

      let accumulatedMessage = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        checkAbortSignal()

        const chunk = new TextDecoder().decode(value)

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

    if (query || clipboardText || contentToUse || screenshotUrl || audio || hasFileAttachment) {
      setInputIsDisabled(true)

      const fileAttachments = attachments.filter(isUploadableAttachment)

      const conversationId = getOrCreateConversationId()
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
      })

      await fetchResponse(conversationId, formData, !!promptApp, promptApp)
    }
  }

  const handleSubmit = async (
    input: string,
    promptApp?: Prompt,
    context?: { image?: string; window_context?: string; conversation?: ConversationAttachment },
    toolOverrides?: ToolOverrides,
  ) => {
    const query = input.trim()

    if (!query) {
      console.log('No query provided, ignoring.')
      return
    }

    try {
      setInputIsDisabled(true)

      const conversationId = getOrCreateConversationId()

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
      })

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
