import React, { useState } from 'react'
import { HighlightIcon } from '@/icons/icons'
import { usePlatform } from '@/hooks/usePlatform'
import { buildDownloadURL } from '@/utils/downloadUrl'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/DropdownMenu/dropdown-menu'

export default function GetHighlightCTA() {
  const platform = usePlatform()
  const [showMacOptions, setShowMacOptions] = useState(false)

  const handleDownload = (macType?: 'intel' | 'silicon') => {
    if (platform === 'mobile') {
      window.open('https://highlight.ing/', '_blank')
      return
    }

    let downloadUrl: string
    if (platform === 'mac') {
      downloadUrl = buildDownloadURL(macType === 'silicon' ? 'mac-silicon' : 'mac-intel')
    } else {
      downloadUrl = buildDownloadURL('windows')
    }

    window.open(downloadUrl, '_blank')
  }

  const renderButton = () => {
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
    <div className="fixed bottom-4 left-1/2 w-full max-w-[712px] -translate-x-1/2 transform px-4">
      <div className="flex items-center justify-between rounded-[20px] border border-light-10 bg-background-secondary p-3">
        <div className="flex-shrink-0">
          <HighlightIcon size={24} color="white" />
        </div>
        <p className="font-base mx-3 flex-grow truncate text-center text-[16px] text-text-tertiary">
          Highlight is your personal AI for getting answers and doing work
        </p>
        {renderButton()}
      </div>
    </div>
  )
}
