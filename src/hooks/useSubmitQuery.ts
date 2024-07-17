import { useAuthContext } from '../context/AuthContext'
import { useInputContext } from '../context/InputContext'
import { useMessagesContext } from '../context/MessagesContext'
import { HighlightContext } from '@highlight-ai/app-runtime'
import { useHighlightContextContext } from '../context/HighlightContext'
import { useConversationContext } from '../context/ConversationContext'
import { useAboutMeContext } from '@/context/AboutMeContext'

export const useSubmitQuery = () => {
  const { getAccessToken, refreshAccessToken } = useAuthContext()
  const { attachments, clearAttachments, input, setInput, setIsDisabled } = useInputContext()
  const { messages, addMessage, updateLastMessage } = useMessagesContext()
  const { highlightContext } = useHighlightContextContext()
  const { getOrCreateConversationId, resetConversationId } = useConversationContext()
  const { aboutMe } = useAboutMeContext();

  const addAttachmentsToFormData = async (formData: FormData, attachments: any[]) => {
    let screenshot, audio, fileTitle;

    for (const attachment of attachments) {
      if (attachment?.value) {
        switch (attachment.type) {
          case 'image':
          case 'screenshot':
            screenshot = attachment.value;
            if (attachment.file) {
              const base64data = await readFileAsBase64(attachment.file);
              const mimeType = attachment.file.type || 'image/png';
              const base64WithMimeType = `data:${mimeType};base64,${base64data.split(',')[1]}`;
              formData.append('base64_image', base64WithMimeType);
            } else if (typeof attachment.value === 'string' && attachment.value.startsWith('data:image')) {
              formData.append('base64_image', attachment.value);
            } else {
              console.error('Unsupported image format:', attachment.value);
            }
            break;
          case 'pdf':
            fileTitle = attachment.value.name;
            formData.append('pdf', attachment.value);
            break;
          case 'audio':
            audio = attachment.value;
            formData.append('audio', attachment.value);
            break;
          default:
            console.warn('Unknown attachment type:', attachment.type);
        }
      }
    }

    return { screenshot, audio, fileTitle };
  }

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
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
    if (!highlightContext) return ''

    const processedContext = { ...highlightContext }

    if (processedContext.attachments) {
      processedContext.attachments = processedContext.attachments
        .filter((attachment: any) => attachment.type !== 'screenshot')
        .map((attachment: any) => {
          if (attachment.type === 'audio') {
            return {
              ...attachment,
              value: attachment.value.slice(0, 1000)
            }
          }
          return attachment
        })
    }

    return '\n\nHighlight Context:\n' + JSON.stringify(processedContext, null, 2)
  }

  const handleIncomingContext = async (context: HighlightContext, systemPrompt?: string) => {
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
      if (systemPrompt) {
        formData.append('system_prompt', systemPrompt)
      }

      // Add previous messages to form data as an array of objects
      const previousMessages = messages.map(msg => ({
        type: msg.type,
        content: msg.content
      }))
      formData.append('previous_messages', JSON.stringify(previousMessages))

      let contextString = 'This is a new conversation with Highlight Chat.'

      contextString += prepareHighlightContext(context)

      console.log('contextString:', contextString)
      formData.append('context', contextString)

      // Add about_me to form data
      if (aboutMe) {
        formData.append('about_me', JSON.stringify(aboutMe))
      }

      const contextAttachments = context.attachments || []
      await addAttachmentsToFormData(formData, contextAttachments)
      const accessToken = await getAccessToken()
      await fetchResponse(formData, accessToken)
    }
  }

  const handleSubmit = async (systemPrompt?: string) => {
    const query = input.trim()
    if (query) {
      const formData = new FormData()
      formData.append('prompt', query)
      if (systemPrompt) {
        formData.append('system_prompt', systemPrompt)
      }

      // Add about_me to form data
      if (aboutMe) {
        formData.append('about_me', JSON.stringify(aboutMe))
      }

      // Add previous messages to form data as an array of objects
      const previousMessages = messages.map(msg => ({
        type: msg.type,
        content: msg.content
      }))
      formData.append('previous_messages', JSON.stringify(previousMessages))

      const { screenshot, audio, fileTitle } = await addAttachmentsToFormData(formData, attachments)

      addMessage({
        type: 'user',
        content: query,
        screenshot,
        audio,
        fileTitle
      })

      setInput('')
      clearAttachments() // Clear the attachment immediately

      let contextString = prepareHighlightContext(highlightContext);

      if (contextString.trim() === '') {
        contextString = 'This is a new conversation with Highlight Chat. You do not have any Highlight Context available.'
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