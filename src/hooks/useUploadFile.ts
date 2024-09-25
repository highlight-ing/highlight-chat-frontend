import { useRef } from 'react'
import { useStore } from '@/providers/store-provider'
import useAuth from './useAuth'
import { useApi } from '@/hooks/useApi'
import { useShallow } from 'zustand/react/shallow'
import * as Sentry from '@sentry/react'
import { trackEvent } from '@/utils/amplitude'

export const useUploadFile = () => {
  const { post } = useApi()
  const { getAccessToken } = useAuth()

  const { addToast, openModal, closeModal } = useStore(
    useShallow((state) => ({
      addToast: state.addToast,
      openModal: state.openModal,
      closeModal: state.closeModal,
    })),
  )

  const abortControllerRef = useRef<AbortController>()

  // Centralized Error Handling
  const handleError = (error: any, context: any) => {
    console.error('Error:', error)
    Sentry.captureException(error, { extra: context })
    trackEvent('HL_FILE_UPLOAD_ERROR', {
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

  const uploadFile = async (file: File, conversationId: string) => {
    const startTime = Date.now()

    try {
      const abortController = new AbortController()
      abortControllerRef.current = abortController

      const formData = new FormData()
      formData.append('file', file)
      formData.append('conversation_id', conversationId)
      formData.append('file_type', file.type)

      const response = await post('file-upload/', formData, { version: 'v4', signal: abortController.signal })

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      addToast({
        title: 'File Uploaded',
        description: `File ${result.metadata.filename} uploaded successfully`,
        type: 'success',
        timeout: 5000,
      })

      return result.metadata
    } catch (error: any) {
      const endTime = Date.now()
      const duration = (endTime - startTime) / 1000

      if (error.message.includes('aborted')) {
        console.log('Skipping file upload, aborted')
      } else {
        handleError(error, {
          conversationId,
          duration,
          endpoint: 'file-upload',
        })
      }
    } finally {
      const endTime = Date.now()
      const duration = endTime - startTime

      trackEvent('HL_FILE_UPLOAD_REQUEST', {
        endpoint: 'file-upload',
        duration,
        success: !abortControllerRef.current?.signal.aborted,
      })

      abortControllerRef.current = undefined
    }
  }

  return { uploadFile }
}
