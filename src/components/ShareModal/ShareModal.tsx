import React, { useRef, useEffect, useState } from 'react'
import { EmojiHappy } from 'iconsax-react'
import styles from './share-modal.module.scss'
import variables from '@/variables.module.scss'
import { ChatHistoryItem } from '@/types'
import { useShareConversation, useDeleteConversation } from '@/hooks/useShareConversation'
import { useStore } from '@/providers/store-provider'
import Button from '@/components/Button/Button'
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner'
import { trackEvent } from '@/utils/amplitude'

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
  const [isCopying, setIsCopying] = useState(false)
  const { getShareLink } = useShareConversation()
  const { deleteSharedConversation } = useDeleteConversation()
  const addToast = useStore((state) => state.addToast)
  const [chatVisibilityLabel, setChatVisibilityLabel] = useState<string>('Private Chat')

  useEffect(() => {
    setChatVisibilityLabel(
      conversation?.shared_conversations && conversation.shared_conversations.length > 0
        ? 'Public Chat'
        : 'Private Chat',
    )
  }, [conversation?.shared_conversations])

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

    const isExistingShare = conversation.shared_conversations?.length ?? 0 > 0
    const setLoadingState = isExistingShare ? setIsCopying : setIsGenerating

    setLoadingState(true)
    try {
      const shareLink = await getShareLink(conversation.id)
      await navigator.clipboard.writeText(`https://chat.hl.ing/share/${shareLink}`)

      if (!isExistingShare) {
        setShareId(conversation.id, shareLink)
        trackEvent('HL Chat Copy Link', {
          conversation_id: conversation.id,
          share_link: `https://chat.hl.ing/share/${shareLink}`,
        })
      }

      addToast({
        title: 'Snapshot shared and copied to your clipboard',
        description: `https://chat.hl.ing/share/${shareLink}`,
        type: 'success',
        timeout: 4000,
      })
    } catch (error) {
      console.error('Failed to copy link:', error)
      trackEvent('HL Chat Copy Link Error', { conversation_id: conversation.id, error })

      addToast({
        title: 'Failed to Copy Link',
        description: 'An error occurred while generating the share link.',
        type: 'error',
      })
    } finally {
      setLoadingState(false)
      onClose()
    }
  }

  const onDisableLink = async () => {
    if (!conversation) return
    setIsDisabling(true)
    try {
      await deleteSharedConversation(conversation.id)

      // Update the shared_conversations in the store
      setShareId(conversation.id, null)
      trackEvent('HL Chat Disable Link', { conversation_id: conversation.id })
      addToast({
        title: 'Share Link Disabled',
        description: 'All share links for this conversation have been disabled.',
        type: 'success',
        timeout: 4000,
      })
    } catch (error) {
      console.error('Failed to disable link:', error)
      trackEvent('HL Chat Disable Link Error', { conversation_id: conversation.id, error: error })
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
                  <EmojiHappy size={24} color={variables.purple100} variant="Bold" />
                  <div className={styles.textContent}>
                    <p className={styles.title}>{processedTitle}</p>
                    <p className="text-[13px] font-medium leading-[16px] text-light-40">{chatVisibilityLabel}</p>
                  </div>
                </div>
                <div className={styles.previewFooter}>
                  {conversation.shared_conversations && conversation.shared_conversations.length > 0
                    ? `https://chat.hl.ing/share/${conversation.shared_conversations[0].id}`
                    : 'All contents currently inside the chat will be shared.'}
                </div>
              </div>
            ) : (
              <p className="text-[13px] font-medium text-subtle">
                You haven&apos;t selected a conversation yet. Please select one and try sharing again.
              </p>
            )}
          </div>

          <Button
            size={'medium'}
            variant={'primary'}
            onClick={onCopyLink}
            disabled={!conversation || isGenerating || isCopying}
            style={{
              width: '100%',
            }}
          >
            {isGenerating ? (
              <>
                <LoadingSpinner size={'20px'} /> Generating...
              </>
            ) : isCopying ? (
              <>
                <LoadingSpinner size={'20px'} /> Copying...
              </>
            ) : (
              'Copy Share Link'
            )}
          </Button>
          <Button
            size={'medium'}
            variant={'ghost-neutral'}
            style={{ width: '100%' }}
            disabled={
              !conversation ||
              isDisabling ||
              !(conversation.shared_conversations && conversation.shared_conversations.length > 0)
            }
            onClick={onDisableLink}
          >
            {isDisabling ? (
              <>
                <LoadingSpinner size={'20px'} /> Disabling...
              </>
            ) : (
              'Disable All Share Links'
            )}
          </Button>
        </div>
      </div>
    </>
  )
}

export default ShareModal
