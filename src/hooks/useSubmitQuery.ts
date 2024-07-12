import { useAuthContext } from '../context/AuthContext'
import { useInputContext } from '../context/InputContext'
import { useMessagesContext } from '../context/MessagesContext'
import { HighlightContext } from '@highlight-ai/app-runtime'
import { useHighlightContextContext } from '../context/HighlightContext'
import { useConversationContext } from '../context/ConversationContext'

export const useSubmitQuery = () => {
  const { getAccessToken, refreshAccessToken } = useAuthContext()
  const { attachments, clearAttachments, input, setInput, setIsDisabled } = useInputContext()
  const { messages, addMessage, updateLastMessage } = useMessagesContext()
  const { highlightContext } = useHighlightContextContext()
  const { getOrCreateConversationId, resetConversationId } = useConversationContext()

  const addAttachmentsToFormData = (formData: FormData, attachments: any[]) => {
    let screenshot = undefined
    let audio = undefined
    let fileTitle = undefined

    attachments.forEach((attachment) => {
      if (attachment && attachment.value) {
        if (attachment.type === 'image') {
          screenshot = attachment.value
          if (attachment.file) {
            formData.append('image', attachment.file)
          } else {
            formData.append('base64_image', attachment.value)
          }
        } else if (attachment.type === 'pdf') {
          fileTitle = attachment.value.name
          formData.append('pdf', attachment.value)
        } else if (attachment.type === 'audio') {
          console.log('audio:', attachment.value)
          audio = attachment.value
          formData.append('audio', attachment.value)
        }
      }
    })

    return { screenshot, audio, fileTitle }
  }

  const fetchResponse = async (formData: FormData, token: string) => {
    setIsDisabled(true)

    try {
      const conversationId = getOrCreateConversationId()
      formData.append('conversation_id', conversationId)

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://0.0.0.0:8080/'
      let response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      })

      if (response.status === 401) {
        // Token has expired, refresh it
        const newToken = await refreshAccessToken()
        // Retry the request with the new token
        response = await fetch(backendUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${newToken}`
          },
          body: formData
        })
      }

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No reader available')
      }

      let accumulatedResponse = ''
      addMessage({ type: 'assistant', content: '' })

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = new TextDecoder().decode(value)

        // Directly append the chunk to the accumulated response
        accumulatedResponse += chunk

        // Update the UI with the accumulated response
        updateLastMessage({ type: 'assistant', content: accumulatedResponse })
      }
    } catch (error) {
      console.error('Error fetching response:', error)
      addMessage({ type: 'assistant', content: 'Sorry, there was an error processing your request.' })
    } finally {
      setIsDisabled(false)
    }
  }

  const prepareHighlightContext = (highlightContext: any) => {
    if (!highlightContext) return '';

    const processedContext = { ...highlightContext };
    
    if (processedContext.attachments) {
      processedContext.attachments = processedContext.attachments
        .filter((attachment: any) => attachment.type !== 'screenshot')
        .map((attachment: any) => {
          if (attachment.type === 'audio') {
            return {
              ...attachment,
              value: attachment.value.slice(0, 1000)
            };
          }
          return attachment;
        });
    }

    return '\n\nHighlight Context:\n' + JSON.stringify(processedContext, null, 2);
  }

  const handleIncomingContext = async (context: HighlightContext) => {
    resetConversationId() // Reset conversation ID for new incoming context
    
    let query = context.suggestion || ''
    let screenshotUrl = context.attachments?.find((a) => a.type === 'screenshot')?.value ?? ''
    let clipboardText = context.attachments?.find((a) => a.type === 'clipboard')?.value ?? ''
    let ocrScreenContents = context.environment.ocrScreenContents ?? ''
    let rawContents = context.application.focusedWindow.rawContents
    let audio = context.attachments?.find((a) => a.type === 'audio')?.value ?? ''

    if (query || clipboardText || ocrScreenContents || screenshotUrl || rawContents || audio) {
      addMessage({
        type: 'user',
        content: query,
        clipboardText,
        screenshot: screenshotUrl,
        audio
      })

      setInput('')
      clearAttachments() // Clear the attachment immediately

      const formData = new FormData()
      formData.append('prompt', query)

      let contextString = 'This is a new conversation with Highlight Chat.'
      
      contextString += prepareHighlightContext(context);
      
      console.log('contextString:', contextString)
      formData.append('context', contextString)

      const contextAttachments = context.attachments || []
      addAttachmentsToFormData(formData, contextAttachments)

      const accessToken = await getAccessToken()
      await fetchResponse(formData, accessToken)
    }
  }

  const handleSubmit = async () => {
    const query = input.trim()
    if (query) {
      const formData = new FormData()
      formData.append('prompt', query)

      const { screenshot, audio, fileTitle } = addAttachmentsToFormData(formData, attachments)

      addMessage({
        type: 'user',
        content: query,
        screenshot,
        audio,
        fileTitle
      })

      setInput('')
      clearAttachments() // Clear the attachment immediately

      // Create context from conversation history
      const conversationHistory = messages.map((msg) => `${msg.type}: ${msg.content}`).join('\n')
      let contextString = conversationHistory ?? 'This is a new conversation with Highlight Chat.'

      contextString += prepareHighlightContext(highlightContext);

      if (contextString.trim() === '') {
        contextString = 'This is a new conversation with Highlight Chat.'
      }

      console.log('contextString:', contextString)
      formData.append('context', contextString)

      // If it's a new conversation, reset the conversation ID
      if (messages.length === 0) {
        resetConversationId()
      }

      const accessToken = await getAccessToken()
      await fetchResponse(formData, accessToken)
    }
  }

  return { handleSubmit, handleIncomingContext }
}