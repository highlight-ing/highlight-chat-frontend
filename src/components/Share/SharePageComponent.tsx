'use client'
import React from 'react'
import { Message } from '@/types/index'
import ShareMessages from '@/components/Share/ShareMessages'
import DownloadCTA from '@/components/Share/DownloadCTA'
import styles from '@/main.module.scss'
import sharePageStyles from '@/components/Share/share-page.module.scss'
import Header from '@/components/Share/Header'
import Footer from '@/components/Share/Footer'

interface SharePageComponentProps {
  title: string
  messages: Message[]
}

const SharePageComponent: React.FC<SharePageComponentProps> = ({ title, messages }) => {
  return (
    <div className={sharePageStyles.page}>
      <div
        className={`${sharePageStyles.sharePageContainer} ${sharePageStyles.show} shared-chat-container mx-auto w-full max-w-4xl py-6`}
      >
        <Header title={title} />
        <ShareMessages messages={messages} />
        <Footer />
      </div>
      <DownloadCTA />
    </div>
  )
}

export default SharePageComponent
