import { useState, useEffect, useCallback } from 'react'
import Highlight from '@highlight-ai/app-runtime'

type AudioTranscriptState = 'attach' | 'detect' | 'locked'

const POLL_INTERVAL = 500 // 500ms

export const useAudioPermission = () => {
  const [audioTranscriptState, setAudioTranscriptState] = useState<AudioTranscriptState>('detect')
  const [isAudioPermissionEnabled, setIsAudioPermissionEnabled] = useState<boolean>(false)

  const checkAudioPermission = useCallback(async () => {
    console.log('Checking audio permission...') // Log when check starts
    try {
      const isEnabled = await window.highlight.internal.isAudioTranscriptEnabled()
      console.log('Audio permission check result:', isEnabled) // Log the result
      setAudioTranscriptState(isEnabled ? 'attach' : 'detect')
      setIsAudioPermissionEnabled(isEnabled)
    } catch (error) {
      console.error('Error checking audio permission:', error)
      setIsAudioPermissionEnabled(false)
    }
  }, [])

  useEffect(() => {
    console.log('Setting up audio permission polling') // Log when effect runs
    checkAudioPermission() // Initial check

    const intervalId = setInterval(() => {
      console.log('Polling audio permission...') // Log each time the interval fires
      checkAudioPermission()
    }, POLL_INTERVAL)

    return () => {
      console.log('Clearing audio permission polling') // Log when cleaning up
      clearInterval(intervalId)
    }
  }, [checkAudioPermission])

  const toggleAudioPermission = async (enable: boolean) => {
    if (audioTranscriptState === 'locked') {
      console.warn('Cannot change audio state when locked')
      return
    }

    console.log('Toggling audio permission:', enable) // Log toggle attempt
    try {
      await window.highlight.internal.setAudioTranscriptEnabled(enable)
      setIsAudioPermissionEnabled(enable)
      setAudioTranscriptState(enable ? 'attach' : 'detect')
      console.log('Audio permission toggled successfully') // Log successful toggle
    } catch (error) {
      console.error('Error toggling audio permission:', error)
    }
  }

  return {
    isAudioPermissionEnabled,
    toggleAudioPermission,
    audioTranscriptState,
    checkAudioPermission,
  }
}
