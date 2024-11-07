'use client'

import Button from '@/components/Button/Button'
import { ChatHistoryItem } from '@/types'
import { ArrowDown2, EmojiHappy, Send2 } from 'iconsax-react'
import { useCopyLink, useDisableLink, useGenerateShareLink } from './hooks'
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import React from 'react'
import { cn } from '@/lib/utils'

function GenerateShareLinkButton(props: { conversationId: string }) {
  const { mutate: generateShareLink, isPending } = useGenerateShareLink()

  return (
    <Button
      variant="accent"
      size="small"
      disabled={isPending}
      onClick={() => generateShareLink(props.conversationId)}
      className="gap-2"
    >
      Share
      <Send2 size={18} variant={'Bold'} />
    </Button>
  )
}

function CopyLinkButton(props: { shareLinkId: string }) {
  const { mutate: copyLink, isPending } = useCopyLink()

  return (
    <Button
      variant="accent"
      size="small"
      disabled={isPending}
      onClick={() => copyLink(props.shareLinkId)}
      style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
      className="border-r border-r-dark"
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
      <PopoverContent align="end" className="w-[400px] space-y-3">
        <div className="flex flex-col justify-start">
          <h3 className="text-md font-regular text-left text-white">Share Chat</h3>
        </div>
        {props.conversation ? (
          <div className="relative rounded-2xl bg-tertiary">
            <div className="flex items-center gap-3 border-b border-b-light-5 p-3">
              <EmojiHappy size={24} variant="Bold" color="#712FFF" />
              <div className="flex flex-col justify-center text-sm font-medium text-light-40">
                <p className="text-light">{formattedTitle}</p>
                <p className="text-[13px] font-medium leading-[16px] text-light-40">
                  {mostRecentShareLinkId ? 'Public Chat' : 'Private Chat'}
                </p>
              </div>
            </div>
            <div className="p-3 text-sm font-medium text-light-20">
              {mostRecentShareLinkId
                ? `https://highlightai.com/share/${mostRecentShareLinkId}`
                : 'All currently inside the chat will be shared. contents'}
            </div>
          </div>
        ) : (
          <p className="text-sm font-medium text-subtle">
            You haven&apos;t selected a props.conversation yet. Please select one and try sharing again.
          </p>
        )}

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
    <div className="flex items-center">
      <CopyLinkButton shareLinkId={mostRecentShareLinkId} />
      <ShareLinkModal conversation={props.conversation} />
    </div>
  )
}

// const { data: numbers, isLoading } = useNumbers()

// <div>{isLoading ? 'Loading numbers...' : numbers?.toString()}</div>
