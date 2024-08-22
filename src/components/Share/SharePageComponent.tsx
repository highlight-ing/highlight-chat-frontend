'use client'
import React from 'react'
import { Message } from '@/types/index'
import ShareMessages from '@/components/Share/ShareMessages'
import DownloadCTA from '@/components/Share/DownloadCTA'
import styles from '@/main.module.scss'
import chatHomeStyles from '@/components/ChatHome/chathome.module.scss'

interface SharePageComponentProps {
  title: string
  messages: Message[]
}

const SharePageComponent: React.FC<SharePageComponentProps> = ({ title, messages }) => {
  return (
    <div className={`${styles.contents} ${styles.full} flex flex-col`}>
      <div
        className={`${chatHomeStyles.chatHomeContainer} ${chatHomeStyles.show} shared-chat-container mx-auto w-full max-w-4xl py-6`}
      >
        <div className="bg-dark-80 mb-6 max-h-[calc(100vh-200px)] overflow-y-auto rounded-lg p-6 shadow-md">
          <ShareMessages messages={messages} />
        </div>
        <div className={chatHomeStyles.callouts}>
          <DownloadCTA />
        </div>
      </div>
    </div>
  )
}

export default SharePageComponent
