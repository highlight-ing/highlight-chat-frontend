import React from 'react'
import { HighlightIcon } from '@/icons/icons'

interface ShareHeaderTitleProps {
  title: string
  sharedBy?: string
}

const ShareHeaderTitle: React.FC<ShareHeaderTitleProps> = ({ title, sharedBy }) => {
  return (
    <div className="flex items-center space-x-3">
      <HighlightIcon size={24} color="white" />
      <div>
        <h1 className="font-base text-sm text-text-primary">{title}</h1>
        <p className="text-xs text-text-tertiary">Shared by {sharedBy || 'Anonymous'}</p>
      </div>
    </div>
  )
}

export default ShareHeaderTitle
