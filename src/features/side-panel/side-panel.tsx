import React from 'react'
import { AnimatePresence, motion, Variants } from 'framer-motion'
import { ArrowRight, ClipboardText, VoiceSquare } from 'iconsax-react'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import useMeasure from 'react-use-measure'

import { cn } from '@/lib/utils'
import { formatTitle } from '@/utils/conversations'
import { isOnHomeAtom, selectedAudioNoteAtom, sidePanelOpenAtom } from '@/atoms/side-panel'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip } from '@/components/ui/tooltip'
import { MeetingIcon } from '@/components/icons'

import { TranscriptMessage } from './types'
import { formatHeaderTimestamp, parseTranscript } from './utils'

const headerHeightAtom = atom(0)
const hoveringCloseAtom = atom(false)

type CloseHoverAnimateLayoutProps = {
  children: React.ReactNode
  className?: string
}

const hoveringCloseVariants: Variants = {
  idle: { translateX: 0, opacity: 1 },
  hover: (hoveringClose: boolean) => (hoveringClose ? { translateX: 12, opacity: 0.5 } : {}),
}

function CloseHoverAnimateLayout(props: CloseHoverAnimateLayoutProps) {
  const hoveringClose = useAtomValue(hoveringCloseAtom)
  return (
    <motion.div
      variants={hoveringCloseVariants}
      custom={hoveringClose}
      initial="idle"
      animate="hover"
      className={cn(props.className)}
    >
      {props.children}
    </motion.div>
  )
}

function CloseTranscriptViewerButton() {
  const setHoveringClose = useSetAtom(hoveringCloseAtom)
  const setTranscriptOpen = useSetAtom(sidePanelOpenAtom)

  function handleClick() {
    setTranscriptOpen(false)
    setHoveringClose(false)
  }

  return (
    <Tooltip content="Close" side="right">
      <div className="absolute -left-8 top-0">
        <motion.button
          onHoverStart={() => setHoveringClose(true)}
          onHoverEnd={() => setHoveringClose(false)}
          aria-label="Close Transcript Viewer"
          onClick={handleClick}
          className="size-8 group relative grid place-items-center border border-t-0 border-tertiary bg-bg-layer-1 transition-colors hover:bg-secondary"
        >
          <ArrowRight size={18} className="text-tertiary transition-colors group-hover:text-primary" />
        </motion.button>
      </div>
    </Tooltip>
  )
}

type HeaderLayoutProps = {
  children: React.ReactNode
}

function HeaderLayout(props: HeaderLayoutProps) {
  const [ref, bounds] = useMeasure()
  const setHeaderHeight = useSetAtom(headerHeightAtom)

  React.useEffect(() => {
    setHeaderHeight(bounds.height)
  }, [bounds, setHeaderHeight])

  return (
    <div ref={ref} className="overflow-x-hidden border-b border-tertiary">
      <CloseHoverAnimateLayout className="space-y-2 p-4">{props.children}</CloseHoverAnimateLayout>
    </div>
  )
}

function HeaderDates() {
  const selectedAudioNote = useAtomValue(selectedAudioNoteAtom)

  if (!selectedAudioNote?.startedAt || !selectedAudioNote?.endedAt) return null

  return (
    <p className="text-[15px] font-medium text-subtle">
      {formatHeaderTimestamp(selectedAudioNote.startedAt, selectedAudioNote.endedAt)}
    </p>
  )
}

function TranscriptViewerHeader() {
  const selectedAudioNote = useAtomValue(selectedAudioNoteAtom)
  const formattedTitle = formatTitle(selectedAudioNote?.title)

  if (!selectedAudioNote?.transcript) {
    return (
      <HeaderLayout>
        <h3 className="line-clamp-1 w-full text-ellipsis text-xl font-semibold tracking-tight">
          No audio note selected
        </h3>
      </HeaderLayout>
    )
  }

  return (
    <HeaderLayout>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="hidden xl:block">
            {selectedAudioNote?.meeting ? (
              <MeetingIcon meeting={selectedAudioNote.meeting} size={32} />
            ) : (
              <VoiceSquare size={32} variant="Bold" className="text-green" />
            )}
          </div>
          <h3 className="line-clamp-1 w-full text-ellipsis text-xl font-semibold tracking-tight">{formattedTitle}</h3>
        </div>
      </div>
      <HeaderDates />
    </HeaderLayout>
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

const transcriptViewerVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 50, transition: { duration: 0.09 } },
}

export function SidePanel() {
  const selectedAudioNote = useAtomValue(selectedAudioNoteAtom)
  const headerHeight = useAtomValue(headerHeightAtom)
  const transcriptMessages = parseTranscript(selectedAudioNote?.transcript)
  const sidePanelOpen = useAtomValue(sidePanelOpenAtom)
  const isOnHome = useAtomValue(isOnHomeAtom)

  return (
    <AnimatePresence mode="popLayout">
      {sidePanelOpen && (
        <motion.div
          variants={transcriptViewerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={cn(
            'sticky top-[104px] z-10 col-span-1 h-[calc(100vh-104px)] border-l border-tertiary text-primary',
            isOnHome && 'top-[48px] h-[calc(100vh-48px)]',
          )}
        >
          <TranscriptViewerHeader />
          <ScrollArea style={{ height: `calc(100% - ${headerHeight}px` }} className="overflow-x-hidden">
            <CloseHoverAnimateLayout className="w-full space-y-6 p-4 pt-6">
              <CopyTranscript />
              {transcriptMessages?.map((message, index) => <TranscriptMessageItem key={index} message={message} />)}
            </CloseHoverAnimateLayout>
          </ScrollArea>
          <CloseTranscriptViewerButton />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
