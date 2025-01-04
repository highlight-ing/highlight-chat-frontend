'use client'

import React from 'react'
import { useConversations } from '@/context/ConversationContext'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { AnimatePresence, motion, MotionConfig, Variants } from 'framer-motion'
import { Copy, MessageText, Trash, VoiceSquare } from 'iconsax-react'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { ScopeProvider } from 'jotai-scope'
import { toast } from 'sonner'
import { useShallow } from 'zustand/react/shallow'

import { ConversationData } from '@/types/conversations'
import { cn, getDateGroupLengths } from '@/lib/utils'
import { trackEvent } from '@/utils/amplitude'
import { formatTitle } from '@/utils/conversations'
import { homeSidePanelOpenAtom, selectedAudioNoteAtom, sidePanelOpenAtom } from '@/atoms/side-panel'
import { useAudioNotes, useDeleteAudioNote } from '@/hooks/audio-notes'
import { useCopyAudioShareLink, useGenerateAudioShareLink } from '@/hooks/share-link'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import Button from '@/components/Button/Button'
import { MeetingIcon } from '@/components/icons'
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner'
import { useStore } from '@/components/providers/store-provider'

import { GroupedVirtualList, GroupHeaderRow } from '../components/grouped-virtual-list'
import { useInputFocus } from '../../chat-input/chat-input'
import { currentListIndexAtom, isMountedAtom, moreOptionsOpenAtom } from '../atoms'
import { HOME_FEED_LIST_HEIGHT } from '../constants'
import { formatUpdatedAtDate } from '../utils'
import { HomeFeedListItemLayout, HomeFeedListLayout, ListEmptyState, ListLoadingState } from './home-feed'

function ToggleAudioTranscriptButton() {
  const { isAudioTranscripEnabled, setIsAudioTranscriptEnabled } = useConversations()

  function handleToggle() {
    setIsAudioTranscriptEnabled(!isAudioTranscripEnabled)
  }

  return (
    <Button size="small" variant={isAudioTranscripEnabled ? 'ghost-neutral' : 'ghost'} onClick={handleToggle}>
      {`${isAudioTranscripEnabled ? 'Disable' : 'Enable'} Audio Transcription`}
    </Button>
  )
}

function ToggleAudioTranscriptSwitch() {
  const { isAudioTranscripEnabled, setIsAudioTranscriptEnabled } = useConversations()

  function handleToggle() {
    setIsAudioTranscriptEnabled(!isAudioTranscripEnabled)
  }

  return (
    <div className="relative inline-flex items-center gap-2">
      <p className={cn('text-base font-medium text-subtle', isAudioTranscripEnabled && 'text-tertiary')}>
        {`Audio Notes ${isAudioTranscripEnabled ? 'Enabled' : 'Disabled'}`}
      </p>
      <Switch
        id="audio-switch"
        checked={isAudioTranscripEnabled}
        onCheckedChange={handleToggle}
        className="h-[15px] w-[26px] data-[state=checked]:bg-conv-green"
      />
    </div>
  )
}

function ShareLinkAction(props: { audioNote: ConversationData }) {
  const { mutate: generateShareLink, isPending: isGeneratingLink } = useGenerateAudioShareLink()
  const { mutateAsync: copyLink } = useCopyAudioShareLink()
  const shareLinkExsists = props.audioNote?.shareLink && props.audioNote.shareLink !== ''

  async function handleCopyClick() {
    if (!props.audioNote) return

    if (!shareLinkExsists) {
      generateShareLink(props.audioNote)
    } else {
      await copyLink(props.audioNote.shareLink)
      toast('Link copied to clipboard', { icon: <Copy variant="Bold" size={20} /> })
    }
  }

  return (
    <button
      onClick={handleCopyClick}
      disabled={isGeneratingLink}
      className="hidden h-6 place-items-center rounded-lg px-2 text-sm text-tertiary transition-colors hover:bg-light-5 group-hover:grid"
    >
      Share
    </button>
  )
}

function AttachAudioAction(props: { audioNote: ConversationData }) {
  const focusInput = useInputFocus()

  const { clearPrompt, addAttachment, startNewConversation } = useStore(
    useShallow((state) => ({
      clearPrompt: state.clearPrompt,
      addAttachment: state.addAttachment,
      startNewConversation: state.startNewConversation,
    })),
  )

  function handleAttachClick() {
    if (!props.audioNote?.transcript) return

    clearPrompt()
    startNewConversation()
    focusInput()

    addAttachment({
      id: props.audioNote?.id ?? '',
      type: 'conversation',
      title: props.audioNote?.title ?? '',
      value: props.audioNote.transcript,
      startedAt: props.audioNote?.startedAt ?? new Date(),
      endedAt: props.audioNote?.endedAt ?? new Date(),
    })
  }

  return (
    <button
      onClick={handleAttachClick}
      className="flex w-full items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-light-5"
    >
      <MessageText variant="Bold" size={16} />
      <p>Attach to chat</p>
    </button>
  )
}

function CopyShareLinkAction(props: { audioNote: ConversationData }) {
  const {
    mutate: generateShareLink,
    isPending: isGeneratingLink,
    isSuccess: linkGenerated,
  } = useGenerateAudioShareLink()
  const { mutate: copyLink, isSuccess: linkCopied } = useCopyAudioShareLink()
  const shareLinkExsists = props.audioNote?.shareLink && props.audioNote.shareLink !== ''
  const [showSuccessState, setShowSuccessState] = React.useState(false)

  React.useEffect(() => {
    let timeout: NodeJS.Timeout | null
    if (linkCopied || linkGenerated) {
      setShowSuccessState(true)
      timeout = setTimeout(() => {
        setShowSuccessState(false)
      }, 1200)
    }
    return () => {
      if (timeout) clearTimeout(timeout)
      setShowSuccessState(false)
    }
  }, [linkCopied, linkGenerated, setShowSuccessState])

  function handleCopyClick() {
    if (!props.audioNote) return

    if (!shareLinkExsists) {
      generateShareLink(props.audioNote)
    } else {
      copyLink(props.audioNote.shareLink)
    }
  }

  const copyLabelVariants: Variants = {
    initial: { x: 10, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -10, opacity: 0 },
  }

  return (
    <button
      onClick={handleCopyClick}
      disabled={isGeneratingLink}
      className="flex w-full items-center gap-3.5 rounded-xl px-2 py-1.5 transition-colors hover:bg-light-5"
    >
      {isGeneratingLink ? <LoadingSpinner size={'16px'} color="#6e6e6e" /> : <Copy size={16} variant={'Bold'} />}
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          variants={copyLabelVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          key={showSuccessState ? 'true' : 'false'}
          className="w-full text-left"
        >
          {showSuccessState ? 'Copied' : 'Copy Link'}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}

function DeleteAction(props: { audioNoteId: ConversationData['id'] }) {
  const { mutate: deleteAudioNote, isPending } = useDeleteAudioNote()
  const moreOptionsOpen = useAtomValue(moreOptionsOpenAtom)
  const [state, setState] = React.useState<'idle' | 'expanded'>('idle')
  const isExpanded = state === 'expanded'

  React.useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (isExpanded && moreOptionsOpen && e.key === 'Escape') {
        setState('idle')
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isExpanded, moreOptionsOpen])

  function handleDeleteClick() {
    if (!isExpanded) {
      setState('expanded')
    } else {
      setState('idle')
    }
  }

  function handleConfirmDeleteClick() {
    deleteAudioNote(props.audioNoteId)
  }

  const descriptionVariants: Variants = {
    hidden: { opacity: 0, filter: 'blur(2px)' },
    visible: { opacity: 1, filter: 'blur(0px)', transition: { duration: 0.2, delay: 0.1 } },
  }

  return (
    <MotionConfig transition={{ type: 'spring', bounce: 0.05, duration: 0.3 }}>
      <AnimatePresence initial={false}>
        {isExpanded ? (
          <motion.div
            layoutId={`${props.audioNoteId}-wrapper`}
            style={{ borderRadius: 12 }}
            className="space-y-3 bg-light-5 p-2"
          >
            <motion.p variants={descriptionVariants} initial="hidden" animate="visible" exit="hidden">
              Are you sure you want to delete this audio note?
            </motion.p>
            <button
              onClick={handleConfirmDeleteClick}
              disabled={isPending}
              className="flex w-full items-center gap-3 rounded-xl bg-[#ff3333]/10 px-2 py-1.5 text-[#ff3333] transition-colors hover:bg-[#ff3333]/20"
            >
              <motion.span layoutId={`${props.audioNoteId}-icon`}>
                <Trash variant="Bold" size={16} />
              </motion.span>
              <motion.span layoutId={`${props.audioNoteId}-button-text`}>Delete</motion.span>
            </button>
          </motion.div>
        ) : (
          <motion.button
            layoutId={`${props.audioNoteId}-wrapper`}
            onClick={handleDeleteClick}
            disabled={isPending}
            style={{ borderRadius: 12 }}
            className="flex w-full items-center gap-3 px-2 py-1.5 text-[#ff3333] transition-colors hover:bg-light-5"
          >
            <motion.span layoutId={`${props.audioNoteId}-icon`}>
              <Trash variant="Bold" size={16} />
            </motion.span>
            <motion.span layoutId={`${props.audioNoteId}-button-text`}>Delete</motion.span>
          </motion.button>
        )}
      </AnimatePresence>
    </MotionConfig>
  )
}

function AudioNoteActions(props: { audioNote: ConversationData }) {
  const [moreOptionsOpen, setMoreOptionsOpen] = useAtom(moreOptionsOpenAtom)

  return (
    <div className="flex items-center gap-2 font-medium">
      <p
        className={cn('text-sm text-tertiary group-hover:hidden', moreOptionsOpen ? 'translate-x-0' : 'translate-x-7')}
      >
        {formatUpdatedAtDate(props.audioNote.endedAt)}
      </p>
      <ShareLinkAction audioNote={props.audioNote} />
      <Popover open={moreOptionsOpen} onOpenChange={setMoreOptionsOpen}>
        <PopoverTrigger className="size-6 invisible grid place-items-center rounded-lg p-1 transition-colors hover:bg-light-5 group-hover:visible data-[state=open]:visible data-[state=open]:bg-light-5">
          <DotsHorizontalIcon className="size-4 text-tertiary" />
        </PopoverTrigger>
        <PopoverContent className="max-w-52 p-1.5 text-secondary">
          <AttachAudioAction audioNote={props.audioNote} />
          <CopyShareLinkAction audioNote={props.audioNote} />
          <DeleteAction audioNoteId={props.audioNote.id} />
        </PopoverContent>
      </Popover>
    </div>
  )
}

export function AudioNotesListItem(props: { audioNote: ConversationData; listIndex: number }) {
  const formattedTitle = formatTitle(props.audioNote.title)
  const setHomeSidePanelOpen = useSetAtom(homeSidePanelOpenAtom)
  const setSelectedAudioNote = useSetAtom(selectedAudioNoteAtom)
  const setSidePanelOpen = useSetAtom(sidePanelOpenAtom)
  const [currentListIndex, setCurrentListIndex] = useAtom(currentListIndexAtom)
  const isActiveElement = currentListIndex === props.listIndex
  const [isMounted, setIsMounted] = useAtom(isMountedAtom)

  const previewAudioNote = React.useCallback(() => {
    setSelectedAudioNote(props.audioNote)
    setSidePanelOpen(true)
    setHomeSidePanelOpen(true)
    setCurrentListIndex(props.listIndex)
  }, [
    setSelectedAudioNote,
    props.audioNote,
    props.listIndex,
    setSidePanelOpen,
    setHomeSidePanelOpen,
    setCurrentListIndex,
  ])

  const handleClick = React.useCallback(() => {
    previewAudioNote()
    trackEvent('Audio Note Previewed', {
      audioNoteId: props.audioNote.id,
      meetingNote: !!props.audioNote?.meeting,
      source: 'home_feed',
    })
  }, [props.audioNote, previewAudioNote])

  React.useEffect(() => {
    if (isActiveElement && !isMounted) {
      previewAudioNote()
      setIsMounted(true)
    }
  }, [isActiveElement, setIsMounted, isMounted, previewAudioNote])

  React.useEffect(() => {
    function handleEnterKeyPress(e: KeyboardEvent) {
      if (isActiveElement && e.key === 'Enter') {
        handleClick()
      }
    }

    window.addEventListener('keydown', handleEnterKeyPress)
    return () => window.removeEventListener('keydown', handleEnterKeyPress)
  }, [isActiveElement, handleClick])

  return (
    <ScopeProvider atoms={[moreOptionsOpenAtom]}>
      <HomeFeedListItemLayout onClick={handleClick} className={cn('justify-between', isActiveElement && 'bg-hover')}>
        <div className="flex items-center gap-2 font-medium">
          {props.audioNote?.meeting ? (
            <MeetingIcon meeting={props.audioNote.meeting} size={20} />
          ) : (
            <VoiceSquare size={20} variant="Bold" className="text-green" />
          )}
          <h3 className="max-w-64 truncate tracking-tight text-primary">{formattedTitle}</h3>
        </div>
        <AudioNoteActions audioNote={props.audioNote} />
      </HomeFeedListItemLayout>
    </ScopeProvider>
  )
}

export function MeetingNotesTabContent() {
  const { data, isLoading } = useAudioNotes()
  const { recentMeetingNotes, audioGroupCounts, audioGroupLabels } = React.useMemo(() => {
    const recentMeetingNotes = data?.filter((audioNote) => audioNote.meeting) ?? []
    const { groupLengths, groupLabels } = getDateGroupLengths(recentMeetingNotes)
    return { recentMeetingNotes, audioGroupCounts: groupLengths, audioGroupLabels: groupLabels }
  }, [data])

  if (!isLoading && recentMeetingNotes.length === 0) {
    return (
      <ListEmptyState className="flex flex-col items-center gap-2.5">
        <p className="text-subtle">No meeting notes</p>
        <ToggleAudioTranscriptButton />
      </ListEmptyState>
    )
  }

  return (
    <AnimatePresence initial={false}>
      {isLoading ? (
        <ListLoadingState />
      ) : (
        <HomeFeedListLayout>
          <GroupedVirtualList
            style={{ height: HOME_FEED_LIST_HEIGHT }}
            groupCounts={audioGroupCounts}
            groupContent={(index) => (
              <GroupHeaderRow>
                <div className="flex w-full items-center justify-between">
                  <p>{audioGroupLabels[index]}</p>
                  {index === 0 && <ToggleAudioTranscriptSwitch />}
                </div>
              </GroupHeaderRow>
            )}
            itemContent={(index) => {
              const meetingNote = recentMeetingNotes[index]
              return <AudioNotesListItem key={meetingNote.id} audioNote={meetingNote} listIndex={index} />
            }}
          />
        </HomeFeedListLayout>
      )}
    </AnimatePresence>
  )
}

export function AudioNotesTabContent() {
  const { data, isLoading } = useAudioNotes()
  const { recentNonMeetingNotes, audioGroupCounts, audioGroupLabels } = React.useMemo(() => {
    const recentNonMeetingNotes = data?.filter((audioNote) => !audioNote.meeting) ?? []
    const { groupLengths, groupLabels } = getDateGroupLengths(recentNonMeetingNotes)
    return { recentNonMeetingNotes, audioGroupCounts: groupLengths, audioGroupLabels: groupLabels }
  }, [data])

  if (!isLoading && recentNonMeetingNotes.length === 0) {
    return (
      <ListEmptyState>
        <p className="text-subtle">No audio notes</p>
        <ToggleAudioTranscriptButton />
      </ListEmptyState>
    )
  }

  return (
    <AnimatePresence initial={false}>
      {isLoading ? (
        <ListLoadingState />
      ) : (
        <HomeFeedListLayout>
          <GroupedVirtualList
            style={{ height: HOME_FEED_LIST_HEIGHT }}
            groupCounts={audioGroupCounts}
            groupContent={(index) => (
              <GroupHeaderRow>
                <div className="flex w-full items-center justify-between">
                  <p>{audioGroupLabels[index]}</p>
                  {index === 0 && <ToggleAudioTranscriptSwitch />}
                </div>
              </GroupHeaderRow>
            )}
            itemContent={(index) => {
              const audioNote = recentNonMeetingNotes[index]
              return <AudioNotesListItem key={audioNote.id} audioNote={audioNote} listIndex={index} />
            }}
          />
        </HomeFeedListLayout>
      )}
    </AnimatePresence>
  )
}
