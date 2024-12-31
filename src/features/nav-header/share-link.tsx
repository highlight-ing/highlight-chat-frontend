'use client'

import React, { useEffect } from 'react'
import { ChatHistoryItem } from '@/types'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDown2, EmojiHappy, Send2 } from 'iconsax-react'

import { useCopyLink, useDisableLink, useGenerateShareLink } from '@/hooks/share-link'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import Button from '@/components/Button/Button'
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner'
import { SharePopoverContent } from '@/components/share-popover'

function GenerateShareLinkButton(props: { conversation: ChatHistoryItem }) {
  const { mutate: generateShareLink, isPending } = useGenerateShareLink()

  return (
    <Button
      variant="accent"
      size="small"
      disabled={isPending}
      onClick={() => generateShareLink(props.conversation)}
      style={{ gap: 8 }}
    >
      Share
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={isPending ? 'true' : 'false'}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
        >
          {isPending ? <LoadingSpinner size={'18px'} /> : <Send2 size={18} variant={'Bold'} />}
        </motion.span>
      </AnimatePresence>
    </Button>
  )
}

function CopyLinkButton(props: { shareLinkId: string }) {
  const { mutate: copyLink, isPending, isSuccess } = useCopyLink()
  const [showSuccessState, setShowSuccessState] = React.useState(false)

  useEffect(() => {
    let timeout: NodeJS.Timeout | null
    if (isSuccess) {
      setShowSuccessState(true)
      timeout = setTimeout(() => {
        setShowSuccessState(false)
      }, 1200)
    }
    return () => {
      if (timeout) clearTimeout(timeout)
      setShowSuccessState(false)
    }
  }, [isSuccess, setShowSuccessState])

  return (
    <Button
      variant="accent"
      size="small"
      disabled={isPending}
      onClick={() => copyLink(props.shareLinkId)}
      style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0, width: 100 }}
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={showSuccessState ? 'true' : 'false'}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
        >
          {showSuccessState ? 'Copied' : 'Copy Link'}
        </motion.span>
      </AnimatePresence>
    </Button>
  )
}

type DisableShareLinkButtonProps = {
  conversationId: string
}

function DisableShareLinkButton(props: DisableShareLinkButtonProps) {
  const { mutate: disableShareLink, isPending } = useDisableLink()

  return (
    <Button
      size={'medium'}
      variant={'tertiary'}
      style={{ width: '100%' }}
      disabled={isPending}
      onClick={() => disableShareLink(props.conversationId)}
    >
      {isPending && <LoadingSpinner size={'20px'} />}
      <span className="pl-2">{isPending ? 'Disabling links...' : 'Disable All Share Links'}</span>
    </Button>
  )
}

function ShareLinkPopover(props: { conversation: ChatHistoryItem }) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="accent"
          size="small"
          style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0, paddingLeft: 8, paddingRight: 8 }}
        >
          <motion.span
            initial={{ rotate: 0 }}
            animate={open ? { rotate: 180 } : {}}
            transition={{ type: 'spring', bounce: 0, duration: 0.15 }}
          >
            <ArrowDown2 size={20} variant={'Linear'} />
          </motion.span>
        </Button>
      </PopoverTrigger>
      <SharePopoverContent conversation={props.conversation} />
    </Popover>
  )
}

export function ShareLink(props: { conversation: ChatHistoryItem | null }) {
  const mostRecentShareLinkId = props.conversation?.shared_conversations?.[0]?.id

  if (!props.conversation) return null

  if (!mostRecentShareLinkId) {
    return <GenerateShareLinkButton conversation={props.conversation} />
  }

  return (
    <div className="flex items-center gap-px">
      <CopyLinkButton shareLinkId={mostRecentShareLinkId} />
      <ShareLinkPopover conversation={props.conversation} />
    </div>
  )
}
