import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ClipboardText, VoiceSquare } from 'iconsax-react'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import useMeasure from 'react-use-measure'

import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner'
import Tooltip from '@/components/Tooltip/Tooltip'

import { isOnHomeAtom, transcriptOpenAtom } from './atoms'
import { useTranscript } from './queries'
import { TranscriptMessage } from './types'
import { formatHeaderTimestamp, formatTranscriptTitle, parseTranscript } from './utils'

const headerHeightAtom = atom(0)
const hoveringCloseAtom = atom(false)

function CloseTranscriptViewerButton() {
  const [hoveringClose, setHoveringClose] = useAtom(hoveringCloseAtom)
  const setTranscriptOpen = useSetAtom(transcriptOpenAtom)

  function handleClick() {
    setTranscriptOpen(false)
    setHoveringClose(false)
  }

  return (
    <div className="absolute -right-8 top-0">
      <motion.button
        onHoverStart={() => setHoveringClose(true)}
        onHoverEnd={() => setHoveringClose(false)}
        aria-label="Close Transcript Viewer"
        onClick={handleClick}
        className="size-8 group relative grid place-items-center border border-t-0 border-tertiary bg-bg-layer-1 transition-colors hover:bg-secondary"
      >
        <ArrowLeft size={18} className="text-tertiary transition-colors group-hover:text-primary" />
        <AnimatePresence>
          {hoveringClose && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ type: 'spring', duration: 0.2, bounce: 0 }}
              className="absolute -left-16 rounded-lg bg-hover px-2.5 py-1 text-sm"
            >
              Close
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  )
}

type TranscriptViewerLayoutProps = {
  children: React.ReactNode
}

function TranscriptViewerLayout(props: TranscriptViewerLayoutProps) {
  const transcriptOpen = useAtomValue(transcriptOpenAtom)
  const isOnHome = useAtomValue(isOnHomeAtom)
  const hoveringClose = useAtomValue(hoveringCloseAtom)

  return (
    <AnimatePresence mode="popLayout">
      {transcriptOpen && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50, transition: { duration: 0.09 } }}
          className={cn(
            'sticky top-[104px] z-10 col-span-1 h-[calc(100vh-104px)] items-end border-r border-tertiary text-primary',
            !transcriptOpen && 'hidden',
            isOnHome && 'top-[48px] h-[calc(100vh-48px)]',
          )}
        >
          <CloseTranscriptViewerButton />
          <motion.div
            initial={{ x: 0, opacity: 1, filter: 'blur(0px)' }}
            animate={hoveringClose ? { x: -12, opacity: 0.6, filter: 'blur(1px)' } : {}}
            className="h-full"
          >
            {props.children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function TranscriptViewerHeader() {
  const { data } = useTranscript()
  const setHeaderHeight = useSetAtom(headerHeightAtom)
  const [ref, bounds] = useMeasure()

  React.useEffect(() => {
    setHeaderHeight(bounds.height)
  }, [bounds, setHeaderHeight])

  if (!data) return null

  const formattedTitle = formatTranscriptTitle(data.title)

  return (
    <div ref={ref} className="space-y-2 border-b border-tertiary p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <VoiceSquare size={32} variant="Bold" className="hidden text-green xl:block" />
          <h3 className="line-clamp-1 w-full text-ellipsis text-xl font-semibold tracking-tight">{formattedTitle}</h3>
        </div>
      </div>
      <p className="text-[15px] font-medium text-subtle">{formatHeaderTimestamp(data.startedAt, data.endedAt)}</p>
    </div>
  )
}

function CopyTranscript() {
  const { data } = useTranscript()

  async function handleCopyClick() {
    if (!data?.transcript) return
    await window.navigator.clipboard.writeText(data?.transcript)
  }

  return (
    <div className="flex items-center gap-3">
      <p>Transcript</p>
      <Tooltip position="top" tooltip="Copy">
        <button aria-label="Copy Transcript" onClick={handleCopyClick} className="transition-transform active:scale-90">
          <ClipboardText variant="Bold" size={20} className="text-subtle" />
        </button>
      </Tooltip>
    </div>
  )
}

type TranscriptMessageItemProps = {
  message: TranscriptMessage
}

function TranscriptMessageItem(props: TranscriptMessageItemProps) {
  return (
    <div className="space-y-1.5">
      <div
        className={cn(
          'select-text text-[13px] font-medium leading-tight',
          props.message.sender === 'Me' || props.message.sender.toLowerCase().includes('self')
            ? 'text-[#4ceda0]/40'
            : 'text-white opacity-20',
        )}
      >
        {props.message.time} - {props.message.sender}
      </div>
      <p>{props.message.text}</p>
    </div>
  )
}

export function TranscriptViewer() {
  const { data, isLoading } = useTranscript()
  const headerHeight = useAtomValue(headerHeightAtom)
  const transcriptMessages = parseTranscript(data?.transcript)

  if (isLoading) {
    return (
      <TranscriptViewerLayout>
        <LoadingSpinner size="20px" />
      </TranscriptViewerLayout>
    )
  }

  return (
    <TranscriptViewerLayout>
      <div className="h-full">
        <TranscriptViewerHeader />
        <ScrollArea style={{ height: `calc(100% - ${headerHeight}px` }}>
          <div className="w-full space-y-6 p-4 pt-6">
            <CopyTranscript />
            {transcriptMessages?.map((message, index) => <TranscriptMessageItem key={index} message={message} />)}
          </div>
        </ScrollArea>
      </div>
    </TranscriptViewerLayout>
  )
}
