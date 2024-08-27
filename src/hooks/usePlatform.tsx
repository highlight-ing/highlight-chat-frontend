import { useState, useEffect } from 'react'
import { PlatformType } from '@/types'

export function usePlatform() {
  const [platform, setPlatform] = useState<PlatformType>('unknown')

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase()
    if (/windows/.test(userAgent)) {
      setPlatform('windows')
    } else if (/macintosh|mac os x/.test(userAgent)) {
      setPlatform('mac')
    } else if (/linux/.test(userAgent)) {
      setPlatform('unsupported')
    } else if (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent)) {
      setPlatform('mobile')
    } else {
      setPlatform('unknown')
    }
  }, [])

  return platform
}
