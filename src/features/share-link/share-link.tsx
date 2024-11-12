'use client'

import Button from '@/components/Button/Button'
import { ChatHistoryItem } from '@/types'
import { ArrowDown2, EmojiHappy, Send2 } from 'iconsax-react'
import { useCopyLink, useDisableLink, useGenerateShareLink } from './hooks'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import React, { useEffect } from 'react'
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner'
import { AnimatePresence, motion } from 'framer-motion'

function GenerateShareLinkButton(props: { conversationId: string }) {
  const { mutate: generateShareLink, isPending } = useGenerateShareLink()

  return (
    <Button
      variant="accent"
      size="small"
      disabled={isPending}
      onClick={() => generateShareLink(props.conversationId)}
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
          initial={{ y: 10, opacity: 0, filter: 'blur(4px)' }}
          animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
          exit={{ y: -10, opacity: 0, filter: 'blur(4px)' }}
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

function ShareLinkModal(props: { conversation: ChatHistoryItem }) {
  const [open, setOpen] = React.useState(false)

  const formattedTitle = props.conversation?.title.replace(/^["']|["']$/g, '')

  const mostRecentShareLinkId = props.conversation?.shared_conversations?.[0]?.id

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
      <PopoverContent align="end" sideOffset={8} className="w-[400px] space-y-3">
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
            You haven&apos;t selected a conversation yet. Please select one and try sharing again.
          </p>
        )}

        {mostRecentShareLinkId && <DisableShareLinkButton conversationId={props.conversation.id} />}
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
