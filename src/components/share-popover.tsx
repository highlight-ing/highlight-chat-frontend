import React from 'react'
import { ChatHistoryItem } from '@/types'
import { AnimatePresence, motion, Variants } from 'framer-motion'
import { EmojiHappy } from 'iconsax-react'

import { ConversationData } from '@/types/conversations'
import {
  useCopyAudioShareLink,
  useCopyChatShareLink,
  useDisableAudioShareLink,
  useDisableChatShareLink,
} from '@/hooks/share-link'
import { PopoverContent } from '@/components/ui/popover'

import Button from './Button/Button'
import LoadingSpinner from './LoadingSpinner/LoadingSpinner'

function CopyChatShareLinkButton(props: { shareLinkId: string | undefined }) {
  const [showSuccessState, setShowSuccessState] = React.useState(false)
  const { mutate: copyLink, isPending, isSuccess: linkCopied } = useCopyChatShareLink()

  React.useEffect(() => {
    let timeout: NodeJS.Timeout | null
    if (linkCopied) {
      setShowSuccessState(true)
      timeout = setTimeout(() => {
        setShowSuccessState(false)
      }, 1200)
    }
    return () => {
      if (timeout) clearTimeout(timeout)
      setShowSuccessState(false)
    }
  }, [linkCopied, setShowSuccessState])

  function handleCopyClick() {
    if (!props.shareLinkId) return
    copyLink(props.shareLinkId)
  }

  const copyLabelVariants: Variants = {
    initial: { x: 10, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -10, opacity: 0 },
  }

  if (!props.shareLinkId) return null

  return (
    <Button
      size={'medium'}
      variant={'primary'}
      style={{ width: '100%' }}
      disabled={isPending}
      onClick={handleCopyClick}
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          variants={copyLabelVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          key={showSuccessState ? 'true' : 'false'}
        >
          {showSuccessState ? 'Copied' : 'Copy Link'}
        </motion.span>
      </AnimatePresence>
    </Button>
  )
}

function DisableChatShareLinkButton(props: { conversationId: string }) {
  const { mutate: disableShareLink, isPending } = useDisableChatShareLink()

  function handleClick() {
    disableShareLink(props.conversationId)
  }

  return (
    <Button size={'medium'} variant={'tertiary'} style={{ width: '100%' }} disabled={isPending} onClick={handleClick}>
      {isPending && <LoadingSpinner size={'20px'} />}
      <span className="pl-2">{isPending ? 'Disabling links...' : 'Disable All Share Links'}</span>
    </Button>
  )
}

export function ShareChatPopoverContent(props: { conversation: ChatHistoryItem }) {
  const mostRecentShareLinkId = props.conversation?.shared_conversations?.[0]?.id
  const formattedTitle = props.conversation?.title?.replace(/^["']|["']$/g, '')

  return (
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
              : 'All chats will be shared.'}
          </div>
        </div>
      ) : (
        <p className="text-sm font-medium text-subtle">
          You haven&apos;t selected a conversation yet. Please select one and try sharing again.
        </p>
      )}

      <CopyChatShareLinkButton shareLinkId={mostRecentShareLinkId} />
      {mostRecentShareLinkId && <DisableChatShareLinkButton conversationId={props.conversation.id} />}
    </PopoverContent>
  )
}

function CopyAudioShareLinkButton(props: { shareLinkId: string | undefined }) {
  const [showSuccessState, setShowSuccessState] = React.useState(false)
  const { mutate: copyLink, isPending, isSuccess: linkCopied } = useCopyAudioShareLink()

  React.useEffect(() => {
    let timeout: NodeJS.Timeout | null
    if (linkCopied) {
      setShowSuccessState(true)
      timeout = setTimeout(() => {
        setShowSuccessState(false)
      }, 1200)
    }
    return () => {
      if (timeout) clearTimeout(timeout)
      setShowSuccessState(false)
    }
  }, [linkCopied, setShowSuccessState])

  function handleCopyClick() {
    if (!props?.shareLinkId) return
    copyLink(props.shareLinkId)
  }

  const copyLabelVariants: Variants = {
    initial: { x: 10, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -10, opacity: 0 },
  }

  if (!props.shareLinkId) return null

  return (
    <Button
      size={'medium'}
      variant={'primary'}
      style={{ width: '100%' }}
      disabled={isPending}
      onClick={handleCopyClick}
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          variants={copyLabelVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          key={showSuccessState ? 'true' : 'false'}
        >
          {showSuccessState ? 'Copied' : 'Copy Link'}
        </motion.span>
      </AnimatePresence>
    </Button>
  )
}

function DisableAudioShareLinkButton(props: { audioNote: ConversationData }) {
  const { mutate: disableShareLink, isPending } = useDisableAudioShareLink()

  function handleClick() {
    disableShareLink(props.audioNote)
  }

  return (
    <Button size={'medium'} variant={'tertiary'} style={{ width: '100%' }} disabled={isPending} onClick={handleClick}>
      {isPending && <LoadingSpinner size={'20px'} />}
      <span className="pl-2">{isPending ? 'Disabling links...' : 'Disable All Share Links'}</span>
    </Button>
  )
}

export function ShareAudioPopoverContent(props: { audioNote: ConversationData }) {
  return (
    <PopoverContent align="end" sideOffset={8} className="w-[400px] space-y-3">
      <div className="flex flex-col justify-start">
        <h3 className="text-md font-regular text-left text-white">Share Chat</h3>
      </div>
      {props.audioNote ? (
        <div className="relative rounded-2xl bg-tertiary">
          <div className="flex items-center gap-3 border-b border-b-light-5 p-3">
            <EmojiHappy size={24} variant="Bold" color="#712FFF" />
            <div className="flex flex-col justify-center text-sm font-medium text-light-40">
              <p className="text-light">{props.audioNote.title}</p>
              <p className="text-[13px] font-medium leading-[16px] text-light-40">
                {props.audioNote.shareLink ? 'Public Chat' : 'Private Chat'}
              </p>
            </div>
          </div>
          <div className="p-3 text-sm font-medium text-light-20">
            {props.audioNote.shareLink ? props.audioNote.shareLink : 'Audio note will be shared.'}
          </div>
        </div>
      ) : (
        <p className="text-sm font-medium text-subtle">
          You haven&apos;t selected a conversation yet. Please select one and try sharing again.
        </p>
      )}

      <CopyAudioShareLinkButton shareLinkId={props.audioNote.shareLink} />
      {props.audioNote.shareLink && <DisableAudioShareLinkButton audioNote={props.audioNote} />}
    </PopoverContent>
  )
}
