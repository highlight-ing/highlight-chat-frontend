import React from 'react'
import { useAtomValue } from 'jotai'

import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner'

import { transcriptOpenAtom } from './atoms'
import { useTranscript } from './queries'
import { parseTranscript } from './utils'

type TranscriptViewerLayoutProps = {
  children: React.ReactNode
}

function TranscriptViewerLayout(props: TranscriptViewerLayoutProps) {
  const transcriptOpen = useAtomValue(transcriptOpenAtom)

  return (
    <div
      className={cn(
        'sticky top-[56px] col-span-1 h-[calc(100vh-104px)] items-end border-r border-tertiary p-4 text-primary',
        !transcriptOpen && 'hidden',
      )}
    >
      {props.children}
    </div>
  )
}

export function TranscriptViewer() {
  const { data, isLoading } = useTranscript()
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
        <div className="pb-4">
          <h3 className="text-2xl font-semibold tracking-tight">{data?.title}</h3>
        </div>
        <ScrollArea className="h-[calc(100%-56px)] w-full">
          {transcriptMessages?.map((message, index) => (
            <div key={index} className="flex flex-col items-start justify-start gap-1 self-stretch">
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
        </ScrollArea>
      </div>
    </TranscriptViewerLayout>
  )
}
