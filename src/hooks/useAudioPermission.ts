import { useEffect, useState } from 'react'
import Highlight from '@highlight-ai/app-runtime'

export const addAudioPermissionListener = (listener: (event: 'locked' | 'detect' | 'attach') => void): (() => void) => {
  // @ts-ignore
  globalThis.highlight?.internal?.requestAudioPermissionEvents()
  return Highlight.app.addListener('onAudioPermissionUpdate', listener)
}

export const useAudioPermission = () => {
  const [isAudioPermissionEnabled, setIsAudioPermissionEnabled] = useState<boolean>(false)

  const toggleAudioPermission = async (enable: boolean) => {
    // @ts-ignore
    globalThis.highlight?.internal?.setAudioTranscriptEnabled(enable)
  }

  useEffect(() => {
    // Check initial audio permission state
    ;(async () => {
      try {
        // @ts-ignore
        const enabled = await globalThis.highlight?.internal?.isAudioTranscriptEnabled()
        setIsAudioPermissionEnabled(enabled)
      } catch (error) {
        console.error('Error checking initial audio permission:', error)
      }
    })()

    // Set up listener for future changes
    const removeListener = addAudioPermissionListener((event: 'locked' | 'detect' | 'attach') => {
      if (event === 'locked') {
        setIsAudioPermissionEnabled(false)
      } else {
        setIsAudioPermissionEnabled(true)
      }
    })

    return () => removeListener()
  }, [])

  return { isAudioPermissionEnabled, toggleAudioPermission }
}
