import { useState } from 'react'
import { useAuthContext } from '../context/AuthContext'
import { useInputContext } from '../context/InputContext'
import { useMessagesContext } from '../context/MessagesContext'
import { HighlightContext } from '@highlight-ai/app-runtime'
import { useHighlightContextContext } from '../context/HighlightContext'

export const useSubmitQuery = () => {
  const { accessToken, refreshAccessToken } = useAuthContext()
  const { attachments, clearAttachments, input, setInput } = useInputContext()
  const { messages, addMessage, updateLastMessage } = useMessagesContext()
  const { highlightContext } = useHighlightContextContext()
  const [isWorking, setIsWorking] = useState(false)

  const fetchResponse = async (formData: FormData) => {
    setIsWorking(true)

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://0.0.0.0:8080/'
      let response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        body: formData
      })

      if (response.status === 401) {
        // Token has expired, refresh it
        await refreshAccessToken()
        // Retry the request with the new token
        response = await fetch(backendUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`
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

        // Split the chunk into individual JSON objects
        const jsonObjects = chunk.match(/\{[^\}]+\}/g) || []

        for (const jsonObject of jsonObjects) {
          try {
            const parsedChunk = JSON.parse(jsonObject)
            accumulatedResponse += parsedChunk.response

            // Update the UI with the accumulated response
            updateLastMessage({ type: 'assistant', content: accumulatedResponse })
          } catch (e) {
            console.error('Error parsing chunk:', e)
            console.error('Problematic JSON object:', jsonObject)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching response:', error)
      addMessage({ type: 'assistant', content: 'Sorry, there was an error processing your request.' })
    } finally {
      setIsWorking(false)
    }
  }

  const handleIncomingContext = (context: HighlightContext) => {
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
      contextString += '\n\nHighlight Context:\n' + JSON.stringify(context, null, 2)

      console.log('contextString:', contextString)
      formData.append('context', contextString)

      fetchResponse(formData)
    }
  }

  const handleSubmit = async () => {
    const query = input.trim()
    if (query) {
      const formData = new FormData()
      formData.append('prompt', query)

      // TODO (SP) Add clipboard text
      let screenshot = undefined
      let audio = undefined
      let fileTitle = undefined

      attachments.forEach((attachment) => {
        if (attachment && attachment.value) {
          if (attachment.type === 'image') {
            screenshot = attachment.value
            formData.append('image', attachment.value)
          } else if (attachment.type === 'pdf') {
            fileTitle = attachment.value.name
            formData.append('pdf', attachment.value)
          } else if (attachment.type === 'audio') {
            audio = attachment.value
            formData.append('audio', attachment.value)
          }
        }
      })

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

      // Add Highlight context if available
      if (highlightContext) {
        // Trim audio attachment and remove screenshot attachment
        if (highlightContext.attachments) {
          highlightContext.attachments = highlightContext.attachments
            .filter((attachment) => attachment.type !== 'screenshot')
            .map((attachment) => {
              if (attachment.type === 'audio') {
                return {
                  ...attachment,
                  value: attachment.value.slice(0, 1000)
                }
              }
              return attachment
            })
        }

        contextString += '\n\nHighlight Context:\n' + JSON.stringify(highlightContext, null, 2)
      }

      console.log('contextString:', contextString)
      formData.append('context', contextString)

      fetchResponse(formData)
    }
  }

  const cancelRequest = () => {
    setIsWorking(false)
  }

  return { isWorking, handleSubmit, handleIncomingContext, cancelRequest }
}
