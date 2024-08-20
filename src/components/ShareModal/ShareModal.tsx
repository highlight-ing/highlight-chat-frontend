import React from 'react'
import { MessageText, ExportCurve } from 'iconsax-react'
import styles from './share-modal.module.scss'
import variables from '@/variables.module.scss'

interface ShareModalProps {
  onClose: () => void
}

const ShareModal: React.FC<ShareModalProps> = ({ onClose }) => {
  return (
    <div className={styles.shareModalContainer}>
      <div className={styles.shareModal}>
        <div className={`${styles.header} flex flex-col justify-start`}>
          <h3 className="text-md font-regular text-left text-white">Share Chat</h3>
          <p className="mt-2 text-sm font-light text-light-20">
            All contents currently inside of chat will be shared. Share link will expire after 24 hours.
          </p>
        </div>
        <div className={styles.content}>
          <div className={styles.previewBox}>
            <p className="text-sm text-light-60">
              This is where quoted messages or highlighted text from a chat is placed as a way to make sharing more
              useful.
            </p>
            <div className="mt-2 flex items-center gap-2">
              <MessageText size={20} color={variables.light80} />
              <span className="text-sm text-light-80">Life Coach</span>
            </div>
            <p className="text-light-40 text-xs">highlight.ing/life-coach</p>
          </div>
        </div>
        <div className={styles.footer}>
          <button className={styles.disableButton} onClick={onClose}>
            Disable all share links
          </button>
          <button className={styles.copyButton} onClick={onClose}>
            <span>Copy link to chat</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ShareModal
