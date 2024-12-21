'use client'

import React from 'react'

import { trackEvent } from '@/utils/amplitude'
import { useStore } from '@/components/providers/store-provider'

/**
 * Hook that handles pasting from the clipboard.
 */
export function useClipboardPaste() {
  const addAttachment = useStore((state) => state.addAttachment)

  React.useEffect(() => {
    const onClipboardPaste = (ev: ClipboardEvent) => {
      const clipboardItems = ev.clipboardData?.items
      if (!clipboardItems?.length) {
        return
      }
      for (let i = 0; i < clipboardItems.length; i++) {
        const item = clipboardItems[i]

        if (item.kind === 'file') {
          const file = item.getAsFile()
          if (file) {
            let pasteType = 'unsupported'
            if (file.type.startsWith('image/')) {
              console.log('Pasted image')
              console.log('Image data URL:', URL.createObjectURL(file))
              addAttachment({
                type: 'image',
                value: URL.createObjectURL(file),
                file: file,
              })
              pasteType = 'image'
            } else if (file.type === 'application/pdf') {
              console.log('Pasted PDF')

              addAttachment({
                type: 'pdf',
                value: file,
              })
              pasteType = 'pdf'
            }
            trackEvent('HL Chat Paste', {
              type: pasteType,
              fileType: file.type,
            })
          }
        } else if (item.kind === 'string') {
          trackEvent('HL Chat Paste', { type: 'text' })
        }
      }
    }

    document.addEventListener('paste', onClipboardPaste)

    return () => {
      document.removeEventListener('paste', onClipboardPaste)
    }
  }, [])
}
