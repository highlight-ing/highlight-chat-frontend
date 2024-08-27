// import { isDesktop, isMacOs, isWindows } from 'react-device-detect'
// import { useMemo } from 'react'

// export function usePlatform() {
//   const platform = useMemo(() => {
//     if (isDesktop) return 'desktop'
//     if (isWindows) return 'windows'
//     if (isMacOs) return 'mac'
//     return 'other'
//   }, [])

//   return {
//     platform,
//     desktop: isDesktop,
//     windows: isWindows,
//     macOs: isMacOs,
//   }
// }

import { useState, useEffect } from 'react'

export function usePlatform() {
  const [platform, setPlatform] = useState<'windows' | 'mac' | 'mobile' | 'unknown'>('unknown')

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase()
    if (/windows/.test(userAgent)) {
      setPlatform('windows')
    } else if (/macintosh|mac os x/.test(userAgent)) {
      setPlatform('mac')
    } else if (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent)) {
      setPlatform('mobile')
    }
  }, [])

  return platform
}
