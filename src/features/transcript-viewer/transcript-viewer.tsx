import { useAtom, useAtomValue } from 'jotai'

import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'

import { selectedTranscriptAtom, selectedTranscriptQueryAtom, transcriptOpenAtom } from './atoms'
import { parseTranscript } from './utils'

export function TranscriptViewer() {
  const [{ data, isLoading }] = useAtom(selectedTranscriptQueryAtom)
  console.log({ isLoading, data })

  const selectedTranscript = useAtomValue(selectedTranscriptAtom)
  const transcriptOpen = useAtomValue(transcriptOpenAtom)
  const transcriptMessages = parseTranscript(selectedTranscript?.transcript)

  return (
    <div
      key={selectedTranscript?.id}
      className={cn(
        'sticky top-[56px] col-span-1 h-[calc(100vh-104px)] items-end border-r border-tertiary p-4 text-primary',
        !transcriptOpen && 'hidden',
      )}
    >
      <div className="h-full">
        <div className="pb-4">
          <h3 className="text-2xl font-semibold tracking-tight">{selectedTranscript?.title}</h3>
        </div>
        <ScrollArea className="h-[calc(100%-56px)] w-full">
          {transcriptMessages.map((message, index) => (
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
    </div>
  )
}
