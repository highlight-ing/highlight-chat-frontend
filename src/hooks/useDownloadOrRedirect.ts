import { useState, useEffect } from 'react'
import { usePlatform } from './usePlatform'
import { buildDownloadURL } from '@/utils/downloadUrl'
import { trackEvent } from '@/utils/amplitude'
import { DownloadPlatformType } from '@/types'

export function useDownloadOrRedirect() {
  const platform = usePlatform()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(platform === 'mobile')
  }, [platform])

  const handleDownload = (macType?: 'intel' | 'silicon') => {
    let downloadType: DownloadPlatformType
    let downloadUrl: string

    if (platform === 'mobile' || platform === 'unsupported' || platform === 'unknown') {
      downloadType = 'unsupported'
      downloadUrl = 'https://highlight.ing/discord'
    } else if (platform === 'mac') {
      downloadType = macType === 'silicon' ? 'mac-silicon' : 'mac-intel'
      downloadUrl = buildDownloadURL(downloadType)
    } else {
      downloadType = 'windows'
      downloadUrl = buildDownloadURL(downloadType)
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
