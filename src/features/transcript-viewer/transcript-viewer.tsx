import React from 'react'
import { ArrowLeft, ClipboardText, VoiceSquare } from 'iconsax-react'
import { useAtomValue, useSetAtom } from 'jotai'
import useMeasure from 'react-use-measure'

import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner'
import Tooltip from '@/components/Tooltip/Tooltip'

import { headerHeightAtom, isOnHomeAtom, transcriptOpenAtom } from './atoms'
import { useTranscript } from './queries'
import { formatHeaderTimestamp, formatTranscriptTitle, parseTranscript } from './utils'

function CloseTranscriptViewerButton() {
  const setTranscriptOpen = useSetAtom(transcriptOpenAtom)

  function handleClick() {
    setTranscriptOpen(false)
  }

  return (
    <button
      aria-label="Close Transcript Viewer"
      onClick={handleClick}
      className="size-8 group absolute -right-8 top-0 grid place-items-center border border-t-0 border-tertiary bg-bg-layer-1 transition-colors hover:bg-secondary"
    >
      <ArrowLeft size={18} className="text-tertiary transition-colors group-hover:text-primary" />
    </button>
  )
}

type TranscriptViewerLayoutProps = {
  children: React.ReactNode
}

function TranscriptViewerLayout(props: TranscriptViewerLayoutProps) {
  const transcriptOpen = useAtomValue(transcriptOpenAtom)
  const isOnHome = useAtomValue(isOnHomeAtom)

  return (
    <div
      className={cn(
        'sticky top-[56px] col-span-1 h-[calc(100vh-104px)] items-end border-r border-tertiary text-primary',
        !transcriptOpen && 'hidden',
        isOnHome && 'top-0 h-[calc(100vh-48px)]',
      )}
    >
      <CloseTranscriptViewerButton />
      {props.children}
    </div>
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
        <ScrollArea style={{ height: `calc(100% - ${headerHeight}px` }} className="w-full p-4 pt-6">
          <div className="space-y-6">
            <CopyTranscript />

            {transcriptMessages?.map((message, index) => (
              <div key={index} className="space-y-1.5">
                <div
                  className={cn(
                    'select-text text-[13px] font-medium leading-tight',
                    message.sender === 'Me' || message.sender.toLowerCase().includes('self')
                      ? 'text-[#4ceda0]/40'
                      : 'text-white opacity-20',
                  )}
                >
                  {message.time} - {message.sender}
                </div>
                <p>{message.text}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </TranscriptViewerLayout>
  )
}
