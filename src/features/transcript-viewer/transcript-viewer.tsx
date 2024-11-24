import React from 'react'
import { AnimatePresence, motion, Variants } from 'framer-motion'
import { ArrowLeft, ClipboardText, VoiceSquare } from 'iconsax-react'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import useMeasure from 'react-use-measure'

import { cn } from '@/lib/utils'
import { isOnHomeAtom, selectedAudioNoteAtom, transcriptOpenAtom } from '@/atoms/transcript-viewer'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip } from '@/components/ui/tooltip'

import { TranscriptMessage } from './types'
import { formatHeaderTimestamp, formatTranscriptTitle, parseTranscript } from './utils'

const headerHeightAtom = atom(0)
const hoveringCloseAtom = atom(false)

const hoveringCloseVariants: Variants = {
  idle: { x: 0, opacity: 1 },
  hover: (hoveringClose: boolean) => (hoveringClose ? { x: -12, opacity: 0.5 } : {}),
}

function CloseTranscriptViewerButton() {
  const setHoveringClose = useSetAtom(hoveringCloseAtom)
  const setTranscriptOpen = useSetAtom(transcriptOpenAtom)

  function handleClick() {
    setTranscriptOpen(false)
    setHoveringClose(false)
  }

  return (
    <Tooltip content="Close" side="left">
      <div className="absolute -right-8 top-0">
        <motion.button
          onHoverStart={() => setHoveringClose(true)}
          onHoverEnd={() => setHoveringClose(false)}
          aria-label="Close Transcript Viewer"
          onClick={handleClick}
          className="size-8 group relative grid place-items-center border border-t-0 border-tertiary bg-bg-layer-1 transition-colors hover:bg-secondary"
        >
          <ArrowLeft size={18} className="text-tertiary transition-colors group-hover:text-primary" />
        </motion.button>
      </div>
    </Tooltip>
  )
}

type TranscriptViewerLayoutProps = {
  children: React.ReactNode
}

const transcriptViewerVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50, transition: { duration: 0.09 } },
}

function TranscriptViewerLayout(props: TranscriptViewerLayoutProps) {
  const transcriptOpen = useAtomValue(transcriptOpenAtom)
  const isOnHome = useAtomValue(isOnHomeAtom)

  return (
    <AnimatePresence mode="popLayout">
      {transcriptOpen && (
        <motion.div
          variants={transcriptViewerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={cn(
            'sticky top-[104px] z-10 col-span-1 h-[calc(100vh-104px)] items-end border-r border-tertiary text-primary',
            isOnHome && 'top-[48px] h-[calc(100vh-48px)]',
          )}
        >
          <CloseTranscriptViewerButton />
          {props.children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

type TranscriptViewerHeaderLayoutProps = {
  children: React.ReactNode
}

function TranscriptViewerHeaderLayout(props: TranscriptViewerHeaderLayoutProps) {
  const hoveringClose = useAtomValue(hoveringCloseAtom)
  const [ref, bounds] = useMeasure()
  const setHeaderHeight = useSetAtom(headerHeightAtom)

  React.useEffect(() => {
    setHeaderHeight(bounds.height)
  }, [bounds, setHeaderHeight])

  return (
    <div ref={ref} className="border-b border-tertiary">
      <motion.div
        variants={hoveringCloseVariants}
        custom={hoveringClose}
        initial="idle"
        animate="hover"
        className="space-y-2 p-4"
      >
        {props.children}
      </motion.div>
    </div>
  )
}

function TranscriptViewerHeader() {
  const selectedAudioNote = useAtomValue(selectedAudioNoteAtom)
  const formattedTitle = formatTranscriptTitle(selectedAudioNote?.title)
  const hasValidDates = selectedAudioNote?.startedAt && selectedAudioNote?.endedAt

  if (!selectedAudioNote?.transcript) {
    return (
      <TranscriptViewerHeaderLayout>
        <h3 className="line-clamp-1 w-full text-ellipsis text-xl font-semibold tracking-tight">
          No audio note selected
        </h3>
      </TranscriptViewerHeaderLayout>
    )
  }

  return (
    <TranscriptViewerHeaderLayout>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <VoiceSquare size={32} variant="Bold" className="hidden text-green xl:block" />
          <h3 className="line-clamp-1 w-full text-ellipsis text-xl font-semibold tracking-tight">{formattedTitle}</h3>
        </div>
      </div>
      {hasValidDates && (
        <p className="text-[15px] font-medium text-subtle">
          {formatHeaderTimestamp(selectedAudioNote.startedAt!, selectedAudioNote.endedAt!)}
        </p>
      )}
    </TranscriptViewerHeaderLayout>
  )
}

function CopyTranscript() {
  const selectedAudioNote = useAtomValue(selectedAudioNoteAtom)

  async function handleCopyClick() {
    if (!selectedAudioNote?.transcript) return
    await window.navigator.clipboard.writeText(selectedAudioNote.transcript)
  }

  return (
    <div className="flex items-center gap-3">
      <p>Transcript</p>
      <Tooltip side="right" content="Copy">
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
  const hoveringClose = useAtomValue(hoveringCloseAtom)
  const selectedAudioNote = useAtomValue(selectedAudioNoteAtom)
  const headerHeight = useAtomValue(headerHeightAtom)
  const transcriptMessages = parseTranscript(selectedAudioNote?.transcript)

  return (
    <TranscriptViewerLayout>
      <div className="h-full">
        <TranscriptViewerHeader />
        <ScrollArea style={{ height: `calc(100% - ${headerHeight}px` }}>
          <motion.div
            variants={hoveringCloseVariants}
            custom={hoveringClose}
            initial="idle"
            animate="hover"
            className="w-full space-y-6 p-4 pt-6"
          >
            <CopyTranscript />
            {transcriptMessages?.map((message, index) => <TranscriptMessageItem key={index} message={message} />)}
          </motion.div>
        </ScrollArea>
      </div>
    </TranscriptViewerLayout>
  )
}
