'use client'

import React from 'react'
import { trackEvent } from '@/utils/amplitude'

const shareButtonClass =
  'px-4 py-[6px] inline-flex items-center border border-tertiary rounded-[10px] text-[9px] md:text-sm font-medium text-secondary hover:text-primary hover:border-primary transition-colors transition-border duration-300 ease-in-out'

const ShareHeaderButtonLinks: React.FC = () => {
  const handleLinkClick = (linkName: string) => {
    trackEvent('HL Chat Share Header Link Clicked', { linkName })
  }

  return (
    <div className="flex space-x-3">
      <a
        href="https://highlight.ing/apps"
        target="_blank"
        rel="noopener noreferrer"
        className={shareButtonClass}
        onClick={() => handleLinkClick('Explore Apps')}
      >
        Explore Apps
      </a>
      <a
        href="https://highlight.ing/"
        target="_blank"
        rel="noopener noreferrer"
        className={shareButtonClass}
        onClick={() => handleLinkClick('Learn More')}
      >
        Learn More
      </a>
    </div>
  )
}

export default ShareHeaderButtonLinks
