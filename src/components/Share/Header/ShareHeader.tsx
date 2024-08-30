import React from 'react'
import ShareHeaderTitle from './ShareHeaderTitle'
import ShareHeaderButtonLinks from './ShareHeaderButtonLinks'

interface ShareHeaderProps {
  title: string
  sharedBy?: string
}

const ShareHeader: React.FC<ShareHeaderProps> = ({ title, sharedBy }) => {
  return (
    <header className="border-b border-black bg-primary">
      <div className="container mx-auto flex items-center justify-between px-6 py-2">
        <ShareHeaderTitle title={title} sharedBy={sharedBy} />
        <ShareHeaderButtonLinks />
      </div>
    </header>
  )
}

export default ShareHeader