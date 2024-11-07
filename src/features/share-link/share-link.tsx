'use client'

import Button from '@/components/Button/Button'
import { ChatHistoryItem } from '@/types'
import { ArrowDown2, Send2 } from 'iconsax-react'
import { useCopyLink, useGenerateShareLink } from './hooks'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import React from 'react'
import { cn } from '@/lib/utils'
import styles from './share-modal.module.scss'

function CopyLinkButton(props: { shareLink: string }) {
  const { mutate: copyLink, isPending } = useCopyLink(props.shareLink)

  function handleCopyLinkClick() {
    copyLink()
  }

  console.log(isPending)

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

  const formattedTitle = props.conversation?.title.replace(/^["']|["']$/g, '')

  const noShareLink = props.conversation?.shared_conversations && props.conversation.shared_conversations.length > 0

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
                    {noShareLink ? 'Public Chat' : 'Private Chat'}
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

        <Button
          size={'medium'}
          variant={'ghost-neutral'}
          style={{ width: '100%' }}
          disabled={!props.conversation || noShareLink}
        >
          Disable All Share Links
        </Button>
      </PopoverContent>
    </Popover>
  )
}

export function ShareLink(props: { conversation: ChatHistoryItem | null }) {
  const {
    mutate: generateShareLink,
    data: generatedShareLink,
    isPending,
  } = useGenerateShareLink(props.conversation?.id)
  const mostRecentShareLinkId = props.conversation?.shared_conversations?.[0]?.id

  const shareLink = mostRecentShareLinkId ?? generatedShareLink

  function handleGenerateShareLinkClick() {
    generateShareLink()
  }

  if (!props.conversation) return null

  if (!shareLink) {
    return (
      <Button
        variant="accent"
        size="small"
        onClick={handleGenerateShareLinkClick}
        disabled={isPending}
        className="gap-2"
      >
        Share
        <Send2 size={18} variant={'Bold'} />
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-0.5">
      <CopyLinkButton shareLink={shareLink} />
      <ShareLinkModal conversation={props.conversation} />
    </div>
  )
}
