import React from 'react'
import { HighlightIcon } from '@/icons/icons'

interface ShareHeaderTitleProps {
  title: string
  sharedBy?: string
}

const stripQuotes = (str: string): string => {
  // Remove quotes from the beginning
  str = str.replace(/^["']/, '')
  // Remove quotes from the end
  str = str.replace(/["']$/, '')
  return str
}

const ShareHeaderTitle: React.FC<ShareHeaderTitleProps> = ({ title, sharedBy }) => {
  const strippedTitle = stripQuotes(title)

  return (
    <div className="flex items-center space-x-3">
      <HighlightIcon size={24} color="white" />
      <div>
        <h1 className="font-base text-sm text-text-primary">{strippedTitle}</h1>
        <p className="text-xs text-text-tertiary">Shared by {sharedBy || 'Highlight User'}</p>
      </div>
    </div>
  )
}

export default ShareHeaderTitle
