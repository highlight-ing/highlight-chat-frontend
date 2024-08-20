import React, { useRef, useEffect } from 'react'
import { MessageText } from 'iconsax-react'
import styles from './share-modal.module.scss'
import variables from '@/variables.module.scss'
import { ChatHistoryItem } from '@/types'

interface ShareModalProps {
  isVisible: boolean
  conversation: ChatHistoryItem | null
  onClose: () => void
  onCopyLink: () => void
  onDisableLink: () => void
}

const ShareModal: React.FC<ShareModalProps> = ({ isVisible, conversation, onClose, onCopyLink, onDisableLink }) => {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClose])

  return (
    <>
      <div className={`${styles.modalOverlay} ${isVisible ? styles.visible : ''}`} />
      <div className={`${styles.shareModalContainer} ${isVisible ? styles.visible : ''}`}>
        <div className={styles.shareModal} ref={modalRef}>
          <div className={`${styles.header} flex flex-col justify-start`}>
            <h3 className="text-md font-regular text-left text-white">Share Chat</h3>
            <p className="mt-2 text-sm font-light text-light-20">
              All contents currently inside of chat will be shared. Share link will expire after 24 hours.
            </p>
          </div>
          <div className={styles.content}>
            {conversation ? (
              <div className={styles.previewBox}>
                <p className="text-sm font-light text-light-60">
                  {`This is where quoted messages or highlighted text from a chat is placed as a way to make sharing more
                  useful.`}
                </p>
                <div className={`${styles.separator} my-2`}></div>
                <div className="flex items-center gap-3">
                  <MessageText size={20} color={variables.light60} />
                  <div className="flex flex-col">
                    <p className="text-sm text-white">{`${conversation.title}`}</p>
                    <p className="text-xs font-light text-light-40">{`highlight.ing/550e8400-e29b-41d4-a716`}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm font-light text-light-60">
                You haven't selected a conversation yet. Please select one and try sharing again.
              </p>
            )}
          </div>
          <div className={styles.footer}>
            <button className={styles.disableButton} onClick={onDisableLink} disabled={!conversation}>
              Disable all share links
            </button>
            <button className={styles.copyButton} onClick={onCopyLink} disabled={!conversation}>
              <span>Copy link to chat</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default ShareModal
