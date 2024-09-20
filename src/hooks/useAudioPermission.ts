import { useState, useEffect } from 'react'
import { getAudioSuperpowerEnabled, setAudioSuperpowerEnabled } from '@/utils/highlightService'

export const useAudioPermission = () => {
  const [isAudioPermissionEnabled, setIsAudioPermissionEnabled] = useState<boolean | null>(null)

  useEffect(() => {
    const checkAudioPermission = async () => {
      try {
        const isEnabled = await getAudioSuperpowerEnabled()
        setIsAudioPermissionEnabled(isEnabled)
      } catch (error) {
        console.error('Error checking audio permission:', error)
        setIsAudioPermissionEnabled(false)
      }
    }

    checkAudioPermission()
  }, [])

  const toggleAudioPermission = async (enable: boolean) => {
    try {
      await setAudioSuperpowerEnabled(enable)
      setIsAudioPermissionEnabled(enable)
    } catch (error) {
      console.error('Error toggling audio permission:', error)
    }
  }

  return { isAudioPermissionEnabled, toggleAudioPermission }
}
