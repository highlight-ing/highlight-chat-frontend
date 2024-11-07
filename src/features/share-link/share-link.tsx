'use client'

import Button from '@/components/Button/Button'
import { ChatHistoryItem } from '@/types'
import { ArrowDown2, Send2 } from 'iconsax-react'
import { useCopyLink, useDisableLink, useGenerateShareLink } from './hooks'
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import React from 'react'
import { cn } from '@/lib/utils'
import styles from './share-modal.module.scss'

function GenerateShareLinkButton(props: { conversationId: string }) {
  const { mutate: generateShareLink, isPending } = useGenerateShareLink()

  function handleGenerateShareLinkClick() {
    generateShareLink(props.conversationId)
  }

  return (
    <Button variant="accent" size="small" onClick={handleGenerateShareLinkClick} disabled={isPending} className="gap-2">
      Share
      <Send2 size={18} variant={'Bold'} />
    </Button>
  )
}

function CopyLinkButton(props: { shareLinkId: string }) {
  const { mutate: copyLink, isPending } = useCopyLink()

  function handleCopyLinkClick() {
    copyLink(props.shareLinkId)
  }

  return (
    <Button
      variant="accent"
      size="small"
      onClick={handleCopyLinkClick}
      style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
      disabled={isPending}
    >
      Copy Link
    </Button>
  )
}

export function ShareLinkModal(props: { conversation: ChatHistoryItem }) {
  const [open, setOpen] = React.useState(false)
  const { mutate: disableLink, isPending: isDisableLinkPending } = useDisableLink()

  const formattedTitle = props.conversation?.title.replace(/^["']|["']$/g, '')

  const mostRecentShareLinkId = props.conversation?.shared_conversations?.[0]?.id

  console.log({ mostRecentShareLinkId })

  function handleDisableLinkClick() {
    disableLink(props.conversation.id)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="accent"
          size="small"
          style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0, paddingLeft: 8, paddingRight: 8 }}
        >
          <ArrowDown2
            size={20}
            variant={'Linear'}
            className={cn('transition-transform', { 'rotate-180 text-pink': open })}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[400px] space-y-2">
        <div className={`${styles.header} flex flex-col justify-start`}>
          <h3 className="text-md font-regular text-left text-white">Share Chat</h3>
        </div>
        <div className={styles.content}>
          {props.conversation ? (
            <div className={styles.previewBox}>
              <div className={styles.previewContent}>
                <div className={styles.textContent}>
                  <p className={styles.title}>{formattedTitle}</p>
                  <p className="text-[13px] font-medium leading-[16px] text-light-40">
                    {mostRecentShareLinkId ? 'Public Chat' : 'Private Chat'}
                  </p>
                </div>
              </div>
              <div className={styles.previewFooter}>
                {props.conversation.shared_conversations && props.conversation.shared_conversations.length > 0
                  ? `https://highlightai.com/share/${props.conversation.shared_conversations[0].id}`
                  : 'All currently inside the chat will be shared. contents'}
              </div>
            </div>
          ) : (
            <p className="text-[13px] font-medium text-subtle">
              You haven&apos;t selected a props.conversation yet. Please select one and try sharing again.
            </p>
          )}
        </div>

        <PopoverClose asChild>
          <Button
            size={'medium'}
            variant={'ghost-neutral'}
            style={{ width: '100%' }}
            disabled={!props.conversation || !mostRecentShareLinkId || isDisableLinkPending}
            onClick={handleDisableLinkClick}
          >
            Disable All Share Links
          </Button>
        </PopoverClose>
      </PopoverContent>
    </Popover>
  )
}

export function ShareLink(props: { conversation: ChatHistoryItem | null }) {
  const mostRecentShareLinkId = props.conversation?.shared_conversations?.[0]?.id

  if (!props.conversation) return null

  if (!mostRecentShareLinkId) {
    return <GenerateShareLinkButton conversationId={props.conversation.id} />
  }

  return (
    <div className="flex items-center gap-0.5">
      <CopyLinkButton shareLinkId={mostRecentShareLinkId} />
      <ShareLinkModal conversation={props.conversation} />
    </div>
  )
}
