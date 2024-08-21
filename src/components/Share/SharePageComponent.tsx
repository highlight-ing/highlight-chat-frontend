import React from 'react'
import { SharedChat } from '@/types/index'
import ShareMessages from '@/components/Share/ShareMessages'
import DownloadCTA from '@/components/Share/DownloadCTA'

interface SharePageComponentProps {
  chat: SharedChat
}

const SharePageComponent: React.FC<SharePageComponentProps> = ({ chat }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-4 text-2xl font-bold">{chat.title}</h1>
      <div className="rounded-lg bg-white p-6 shadow-md">
        <ShareMessages messages={chat.messages} />
      </div>
      <DownloadCTA />
    </div>
  )
}

export default SharePageComponent
