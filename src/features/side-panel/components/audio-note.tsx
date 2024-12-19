import { ClipboardText, VoiceSquare } from 'iconsax-react'
import { useAtomValue } from 'jotai'

import { cn } from '@/lib/utils'
import { formatTitle } from '@/utils/conversations'
import { selectedAudioNoteAtom } from '@/atoms/side-panel'
import { Tooltip } from '@/components/ui/tooltip'
import { MeetingIcon } from '@/components/icons'

import { TranscriptMessage } from '../types'
import { formatHeaderTimestamp, parseTranscript } from '../utils'
import { SidePanelContent, SidePanelHeader } from './side-panel'

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

function AudioNoteHeaderDates() {
  const selectedAudioNote = useAtomValue(selectedAudioNoteAtom)

  if (!selectedAudioNote?.startedAt || !selectedAudioNote?.endedAt) return null

  return (
    <p className="text-[15px] font-medium text-subtle">
      {formatHeaderTimestamp(selectedAudioNote.startedAt, selectedAudioNote.endedAt)}
    </p>
  )
}

function TranscriptMessageItem(props: { message: TranscriptMessage }) {
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

export function AudioNoteSidePanelHeader() {
  const selectedAudioNote = useAtomValue(selectedAudioNoteAtom)
  const formattedTitle = formatTitle(selectedAudioNote?.title)

  if (!selectedAudioNote?.transcript) {
    return (
      <SidePanelHeader>
        <h3 className="line-clamp-1 w-full text-ellipsis text-xl font-semibold tracking-tight">
          No audio note selected
        </h3>
      </SidePanelHeader>
    )
  }

  return (
    <SidePanelHeader>
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
      <AudioNoteHeaderDates />
    </SidePanelHeader>
  )
}

export function AudioNoteSidePanelContent() {
  const selectedAudioNote = useAtomValue(selectedAudioNoteAtom)
  const transcriptMessages = parseTranscript(selectedAudioNote?.transcript)

  return (
    <SidePanelContent>
      <CopyTranscript />
      {transcriptMessages?.map((message, index) => <TranscriptMessageItem key={index} message={message} />)}
    </SidePanelContent>
  )
}
