'use client'

import React from 'react'
import { Setting } from 'iconsax-react'
import variables from '@/variables.module.scss'
import chatHomeStyles from '@/components/ChatHome/chathome.module.scss'

const DownloadCTA: React.FC = () => {
  return (
    <div className={chatHomeStyles.homeCallout} onClick={() => window.open('https://highlight.io', '_blank')}>
      <div className={chatHomeStyles.header}>
        <Setting color={variables.primary100} variant={'Bold'} />
        Download Highlight
      </div>
      <p>Experience the full power of Highlight Chat on your desktop.</p>
    </div>
  )
}

export default DownloadCTA
