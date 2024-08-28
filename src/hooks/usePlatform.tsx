import { useState, useEffect } from 'react'
import { PlatformType } from '@/types'
import { isWindows, isMacOs, isIOS, isAndroid, isMobile, isDesktop } from 'react-device-detect'

export function usePlatform() {
  const [platform, setPlatform] = useState<PlatformType>('unknown')

  useEffect(() => {
    if (isWindows) {
      setPlatform('windows')
    } else if (isMacOs) {
      setPlatform('mac')
    } else if (isIOS || isAndroid || isMobile) {
      setPlatform('mobile')
    } else if (isDesktop) {
      setPlatform('unsupported')
    } else {
      setPlatform('unknown')
    }
  }, [])

  return platform
}
