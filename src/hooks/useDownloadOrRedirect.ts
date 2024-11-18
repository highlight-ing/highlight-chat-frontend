import { useEffect, useState } from 'react'
import { DownloadPlatformType } from '@/types'
import { trackEvent } from '@/utils/amplitude'
import { buildDownloadURL } from '@/utils/downloadUrl'

import { usePlatform } from './usePlatform'

export function useDownloadOrRedirect() {
  const platform = usePlatform()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(platform === 'mobile')
  }, [platform])

  const handleDownload = (macType?: 'intel' | 'silicon', externalId?: string) => {
    let downloadType: DownloadPlatformType
    let downloadUrl: string

    if (platform === 'mobile' || platform === 'unsupported' || platform === 'unknown') {
      downloadType = 'unsupported'
      downloadUrl = 'https://highlight.ing/discord'
    } else if (platform === 'mac') {
      downloadType = macType === 'silicon' ? 'mac-silicon' : 'mac-intel'
      downloadUrl = buildDownloadURL(downloadType, externalId)
    } else {
      downloadType = 'windows'
      downloadUrl = buildDownloadURL(downloadType, externalId)
    }

    // Track the download event
    trackEvent('Highlight Download Clicked', {
      platform: platform,
      downloadType: downloadType,
    })

    window.open(downloadUrl, '_blank')
  }

  return {
    platform,
    isMobile,
    handleDownload,
  }
}
