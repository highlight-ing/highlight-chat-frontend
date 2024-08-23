import React, { useRef, useEffect, useState } from 'react'
import { MessageText } from 'iconsax-react'
import styles from './share-modal.module.scss'
import variables from '@/variables.module.scss'
import { ChatHistoryItem } from '@/types'
import { useShareConversation, useDeleteConversation } from '@/hooks/useShareConversation'

interface ShareModalProps {
  isVisible: boolean
  conversation: ChatHistoryItem | null
  onClose: () => void
}

const ShareModal: React.FC<ShareModalProps> = ({ isVisible, conversation, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const { getShareLink } = useShareConversation()
  const { deleteSharedConversation } = useDeleteConversation()

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

  const onCopyLink = async () => {
    if (!conversation) return
    setIsGenerating(true)
    try {
      const shareLink = await getShareLink(conversation.id)
      await navigator.clipboard.writeText(shareLink)
      // You might want to show a success message here
    } catch (error) {
      console.error('Failed to copy link:', error)
      // You might want to show an error message here
    } finally {
      setIsGenerating(false)
    }
  }

  const onDisableLink = async () => {
    if (!conversation) return
    try {
      await deleteSharedConversation(conversation.id)
      // You might want to show a success message here
    } catch (error) {
      console.error('Failed to disable link:', error)
      // You might want to show an error message here
    }
  }

  return (
    <>
      <div className={`${styles.modalOverlay} ${isVisible ? styles.visible : ''}`} />
      <div className={`${styles.shareModalContainer} ${isVisible ? styles.visible : ''}`}>
        <div className={styles.shareModal} ref={modalRef}>
          <div className={`${styles.header} flex flex-col justify-start`}>
            <h3 className="text-md font-regular text-left text-white">Share Chat</h3>
            <p className="mt-2 text-sm font-light text-light-20">
              All contents currently inside of chat will be shared.
            </p>
          </div>
          <div className={styles.content}>
            {conversation ? (
              <div className={styles.previewBox}>
                <div className="flex items-center gap-3">
                  <MessageText size={20} color={variables.light60} />
                  <div className="flex flex-col pb-2 pt-2">
                    <p className="text-base text-white">{`${conversation.title}`}</p>
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
            <button className={styles.copyButton} onClick={onCopyLink} disabled={!conversation || isGenerating}>
              {isGenerating ? (
                <>
                  <span>Generating...</span>
                  <div className="ml-2 h-4 w-4 animate-spin rounded-full border-2 border-dark border-t-transparent"></div>{' '}
                </>
              ) : (
                <span>Copy link to chat</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default ShareModal
