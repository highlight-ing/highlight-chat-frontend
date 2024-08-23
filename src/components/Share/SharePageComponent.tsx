'use client'
import React from 'react'
import { Message } from '@/types/index'
import ShareMessages from '@/components/Share/ShareMessages'
import DownloadCTA from '@/components/Share/DownloadCTA'
import sharePageStyles from '@/components/Share/share-page.module.scss'

interface SharePageComponentProps {
  messages: Message[]
}

const SharePageComponent: React.FC<SharePageComponentProps> = ({ messages }) => {
  return (
    <div className={sharePageStyles.page}>
      <div className={`${sharePageStyles.sharePageContainer} ${sharePageStyles.show} shared-chat-container`}>
        <ShareMessages messages={messages} />
      </div>
      <DownloadCTA />
    </div>
  )
}

export default SharePageComponent
