'use client'

import { useEffect, useCallback } from 'react'
import Highlight, { Attachment, type HighlightContext } from '@highlight-ai/app-runtime'
import { usePathname, useRouter } from 'next/navigation'
import { debounce } from 'throttle-debounce'
import { useSubmitQuery } from '@/hooks/useSubmitQuery'
import { useStore } from '@/providers/store-provider'
import Modals from './modals/Modals'
import { ModalContainer } from '@/components/modals/ModalContainer'
import { useShallow } from 'zustand/react/shallow'
import { dataURItoFile } from '@/utils/attachments'
import { ImageAttachment, PdfAttachment, SpreadsheetAttachment, TextFileAttachment } from '@/types'

function processAttachments(attachments: any[]): Attachment[] {
  return attachments.map((attachment) => {
    if (attachment.type !== 'file') {
      return attachment as Attachment
    }
    const { fileName, mimeType, value } = attachment

    if (mimeType.startsWith('image/')) {
      return {
        type: 'image',
        value,
      } as ImageAttachment
    } else if (mimeType === 'application/pdf') {
      const file = dataURItoFile(attachment.value, fileName, mimeType)
      if (!file) {
        console.error('Could not convert data URI to file for PDF:', fileName, value)
        return attachment
      }
      return {
        type: 'pdf',
        value: file,
      } as PdfAttachment
    } else if (
      mimeType.includes('spreadsheetml') ||
      mimeType.includes('excel') ||
      attachment.fileName.endsWith('.xlsx')
    ) {
      return {
        type: 'spreadsheet',
        value,
      } as SpreadsheetAttachment
    } else if (
      mimeType.startsWith('text/') ||
      mimeType === 'application/json' ||
      mimeType === 'application/xml' ||
      mimeType === 'application/javascript' ||
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimeType === 'application/msword' ||
      mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ) {
      return {
        type: 'text_file',
        value,
        fileName,
      } as TextFileAttachment
    } else {
      console.error('Unprocessable attachment:', mimeType, fileName, value)
      return attachment
    }
  })
}

function useContextReceivedHandler(navigateToNewChat: () => void) {
  const { addAttachment, setHighlightContext, setInput, promptApp, startNewConversation } = useStore(
    useShallow((state) => ({
      addAttachment: state.addAttachment,
      setHighlightContext: state.setHighlightContext,
      setInput: state.setInput,
      promptApp: state.promptApp,
      startNewConversation: state.startNewConversation,
    })),
  )

  const { handleIncomingContext } = useSubmitQuery()

  useEffect(() => {
    const debouncedHandleSubmit = debounce(300, async (context: HighlightContext) => {
      setInput(context.suggestion || '')
      await handleIncomingContext(context, navigateToNewChat, promptApp)
    })

    const contextDestroyer = Highlight.app.addListener('onContext', (context: HighlightContext) => {
      startNewConversation()
      const attachments = processAttachments(context.attachments || [])
      setHighlightContext({ ...context, attachments })
      debouncedHandleSubmit(context)
    })

    const attachmentDestroyer = Highlight.app.addListener('onConversationAttachment', (attachment: string) => {
      console.log('[useContextReceivedHandler] Received conversation attachment:', attachment)

      addAttachment({
        type: 'audio',
        value: attachment,
        duration: 0,
      })

      console.log('[useContextReceivedHandler] Added attachment:', attachment)
    })

    return () => {
      contextDestroyer()
      attachmentDestroyer()
    }
  }, [promptApp])
}

/**
 * Hook that automatically registers the about me data when the app mounts.
 */
function useAboutMeRegister() {
  const setAboutMe = useStore((state) => state.setAboutMe)

  useEffect(() => {
    const getAboutMe = async () => {
      const aboutMe = await Highlight.user.getFacts()
      if (aboutMe?.length > 0) {
        const aboutMeString = aboutMe.join('\n')
        console.log('About Me:', aboutMeString)
        setAboutMe(aboutMeString)
      }
    }
    getAboutMe()
  }, [])
}

/**
 * The main app component.
 *
 * This should hold all the providers.
 */
export default function App({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  const navigateToNewChat = useCallback(() => {
    if (pathname !== '/') {
      router.push('/')
    }
  }, [pathname, router])

  useEffect(() => {
    if (typeof window !== 'undefined' && !Highlight.isRunningInHighlight()) {
      window.location.href = 'https://highlight.ing/apps/highlightchat'
    }
  }, [])

  useContextReceivedHandler(navigateToNewChat)
  useAboutMeRegister()

  return (
    <>
      {children}
      <ModalContainer />
      <Modals />
    </>
  )
}
