import React, { useRef, useEffect, useState } from 'react'
import { EmojiHappy } from 'iconsax-react'
import styles from './share-modal.module.scss'
import variables from '@/variables.module.scss'
import { ChatHistoryItem } from '@/types'
import { useShareConversation, useDeleteConversation } from '@/hooks/useShareConversation'
import { useStore } from '@/providers/store-provider'

interface ShareModalProps {
  isVisible: boolean
  conversation: ChatHistoryItem | null
  onClose: () => void
  setShareId: (conversationId: string, shareId: string | null) => void
}

const ShareModal: React.FC<ShareModalProps> = ({ isVisible, conversation, onClose, setShareId }) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isDisabling, setIsDisabling] = useState(false)
  const { getShareLink } = useShareConversation()
  const { deleteSharedConversation } = useDeleteConversation()
  const addToast = useStore((state) => state.addToast)
  const [chatVisibilityLabel, setChatVisibilityLabel] = useState<string>('Private Chat')

  useEffect(() => {
    setChatVisibilityLabel(conversation?.shared_id ? 'Public Chat' : 'Private Chat')
  }, [conversation?.shared_id])

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

      // Update the shared_id in the store
      setShareId(conversation.id, shareLink)

      addToast({
        title: 'Snapshot shared and copied to your clipboard',
        description: `${shareLink}`,
        type: 'success',
        timeout: 4000,
      })
    } catch (error) {
      console.error('Failed to copy link:', error)

      addToast({
        title: 'Failed to Copy Link',
        description: 'An error occurred while generating the share link.',
        type: 'error',
      })
    } finally {
      setIsGenerating(false)
      onClose()
    }
  }

  const onDisableLink = async () => {
    if (!conversation) return
    setIsDisabling(true)
    try {
      await deleteSharedConversation(conversation.id)

      // Update the shared_id in the store
      setShareId(conversation.id, null)

      addToast({
        title: 'Share Link Disabled',
        description: 'All share links for this conversation have been disabled.',
        type: 'success',
        timeout: 4000,
      })
    } catch (error) {
      console.error('Failed to disable link:', error)
      addToast({
        title: 'Failed to Disable Link',
        description: 'An error occurred while disabling the share link.',
        type: 'error',
      })
    } finally {
      setIsDisabling(false)
      onClose()
    }
  }

  const processedTitle = conversation?.title.replace(/^["']|["']$/g, '')
  const fakeUrl = 'Private Chat'

  return (
    <>
      <div className={`${styles.modalOverlay} ${isVisible ? styles.visible : ''}`} />
      <div className={`${styles.shareModalContainer} ${isVisible ? styles.visible : ''}`}>
        <div className={styles.shareModal} ref={modalRef}>
          <div className={`${styles.header} flex flex-col justify-start`}>
            <h3 className="text-md font-regular text-left text-white">Share Chat</h3>
          </div>
          <div className={styles.content}>
            {conversation ? (
              <div className={styles.previewBox}>
                <div className={styles.previewContent}>
                  <div className={styles.iconWrapper}>
                    <EmojiHappy size={30} color={variables.purple100} variant="Bold" />
                  </div>
                  <div className={styles.textContent}>
                    <p className="mb-1 text-[13px] font-medium leading-[16px] text-white">{processedTitle}</p>
                    <p className="text-[13px] font-medium leading-[16px] text-light-40">{chatVisibilityLabel}</p>
                  </div>
                </div>
                <div className={styles.separator} />
                <div className={styles.previewFooter}>
                  <p className="text-[13px] font-semibold text-subtle">
                    {conversation.shared_id
                      ? `${conversation.shared_id}`
                      : 'All contents currently inside the chat will be shared.'}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-[13px] font-medium text-subtle">
                You haven't selected a conversation yet. Please select one and try sharing again.
              </p>
            )}
          </div>
          <div className={styles.footer}>
            <button
              className={styles.disableButton}
              onClick={onDisableLink}
              disabled={!conversation || isDisabling || !conversation.shared_id}
            >
              {isDisabling ? (
                <>
                  <span>Disabling...</span>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-dark border-t-transparent"></div>
                </>
              ) : (
                <span>Disable all share links</span>
              )}
            </button>
            <button className={styles.copyButton} onClick={onCopyLink} disabled={!conversation || isGenerating}>
              {isGenerating ? (
                <>
                  <span>Generating...</span>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-dark border-t-transparent"></div>
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
