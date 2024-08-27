import React, { useState, useEffect } from 'react'
import { HighlightIcon } from '@/icons/icons'
import { usePlatform } from '@/hooks/usePlatform'
import { buildDownloadURL } from '@/utils/downloadUrl'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/DropdownMenu/dropdown-menu'
import { trackEvent } from '@/utils/amplitude'
import { PlatformType, DownloadPlatformType } from '@/types'

export default function GetHighlightCTA() {
  const platform = usePlatform()
  const [showMacOptions, setShowMacOptions] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(platform === 'mobile')
  }, [platform])

  const handleDownload = (macType?: 'intel' | 'silicon') => {
    let downloadType: DownloadPlatformType
    let downloadUrl: string

    if (platform === 'mobile' || platform === 'unsupported' || platform === 'unknown') {
      downloadType = 'unsupported'
      downloadUrl = 'https://highlight.ing/'
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

  const renderButton = () => {
    if (isMobile) {
      return (
        <button
          onClick={() => window.open('https://highlight.ing/discord', '_blank')}
          className="duration-250 flex-shrink-0 whitespace-nowrap rounded-[8px] bg-[#5865F2] px-3 py-1.5 text-xs font-bold text-white transition-all ease-in-out hover:bg-[#4752C4]"
        >
          Join the Discord
        </button>
      )
    }

    if (platform === 'mac') {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="duration-250 flex-shrink-0 whitespace-nowrap rounded-[8px] bg-primary px-3 py-1.5 text-xs font-bold text-text-black transition-all ease-in-out hover:bg-primary-60">
              Get Highlight
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="border border-light-10 bg-background-secondary">
            <DropdownMenuItem
              onClick={() => handleDownload('intel')}
              className="px-4 py-2 transition-colors duration-150 ease-in-out hover:bg-light-10"
            >
              Download for Intel Mac
            </DropdownMenuItem>
            <div className="mx-2 my-1 border-t border-light-10"></div>
            <DropdownMenuItem
              onClick={() => handleDownload('silicon')}
              className="px-4 py-2 transition-colors duration-150 ease-in-out hover:bg-light-10"
            >
              Download for Silicon Mac
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }

    return (
      <button
        onClick={() => handleDownload()}
        className="duration-250 flex-shrink-0 whitespace-nowrap rounded-[8px] bg-primary px-3 py-1.5 text-xs font-bold text-text-black transition-all ease-in-out hover:bg-primary-60"
      >
        Get Highlight
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 w-full max-w-[712px] px-8 sm:px-4">
      <div className="flex items-center justify-between rounded-[20px] border border-light-10 bg-background-secondary p-3">
        <div className="flex-shrink-0">
          <HighlightIcon size={24} color="white" />
        </div>
        <p className="font-base mx-3 flex-grow truncate text-center text-[14px] text-text-tertiary sm:text-[16px]">
          {isMobile ? (
            <span>Learn more about Highlight</span>
          ) : (
            <>
              <span className="sm:hidden">Highlight is your personal AI</span>
              <span className="hidden sm:inline">Highlight is your personal AI for getting answers and doing work</span>
            </>
          )}
        </p>
        {renderButton()}
      </div>
    </div>
  )
}
