'use client'

import React from 'react'
import styles from './downloadCTA.module.scss'

const DownloadCTA: React.FC = () => {
  return (
    <button className={styles.floatingCTA} onClick={() => window.open('https://highlight.ing', '_blank')}>
      Start Chatting With Highlight
    </button>
  )
}

export default DownloadCTA
