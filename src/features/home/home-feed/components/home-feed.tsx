'use client'

import React from 'react'
import { ChatHistoryItem } from '@/types'
import { AnimatePresence, motion, Variants } from 'framer-motion'
import { Copy, Export, Eye, EyeSlash, MessageText, VoiceSquare } from 'iconsax-react'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { ScopeProvider } from 'jotai-scope'
import { toast } from 'sonner'
import { useShallow } from 'zustand/react/shallow'

import { ConversationData } from '@/types/conversations'
import { cn, getDateGroupLengths } from '@/lib/utils'
import { trackEvent } from '@/utils/amplitude'
import { formatTitle } from '@/utils/conversations'
import { selectedAudioNoteAtom, selectedChatIdAtom, sidePanelOpenAtom } from '@/atoms/side-panel'
import { useHistory, useHistoryByChatId } from '@/hooks/chat-history'
import { useCopyLink, useGenerateShareLink } from '@/hooks/share-link'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip } from '@/components/ui/tooltip'
import Button from '@/components/Button/Button'
import { MeetingIcon } from '@/components/icons'
import { useStore } from '@/components/providers/store-provider'

import { GroupedVirtualList, GroupHeaderRow } from '../components/grouped-virtual-list'
import { useInputFocus } from '../../chat-input/chat-input'
import { currentListIndexAtom, feedHiddenAtom, isMountedAtom, toggleFeedVisibilityAtom } from '../atoms'
import { useAudioNotes, useRecentActions } from '../hooks'
import { formatUpdatedAtDate } from '../utils'

const HOME_FEED_LIST_HEIGHT = 'calc(100vh - 192px)'

type HomeFeedListItemLayoutProps = React.ComponentPropsWithRef<'div'>

function HomeFeedListItemLayout({ className, children, ...props }: HomeFeedListItemLayoutProps) {
  return (
    <div
      className={cn(
        'group rounded-xl px-3 transition-colors hover:bg-secondary focus-visible:bg-hover lg:cursor-pointer [&_div]:last:border-transparent',
        className,
      )}
      {...props}
    >
      <div className="flex items-center justify-between gap-2 border-b border-subtle py-3 transition-colors">
        {children}
      </div>
    </div>
  )
}

function HomeFeedListLayout(props: { children: React.ReactNode }) {
  const homeFeedListVariants: Variants = {
    hidden: { opacity: 0, y: -5 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', bounce: 0, duration: 0.4 } },
  }

  return (
    <motion.div variants={homeFeedListVariants} initial="hidden" animate="visible">
      {props.children}
    </motion.div>
  )
}

function ListLoadingState() {
  return (
    <div>
      <HomeFeedListItemLayout className="cursor-default [&:nth-child(2)]:opacity-70 [&:nth-child(3)]:opacity-40">
        <div className="flex items-center gap-2 font-medium">
          <Skeleton className="size-5" />
          <Skeleton className="h-5 w-64" />
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-subtle">
          <Skeleton className="h-5 w-16" />
        </div>
      </HomeFeedListItemLayout>
      <HomeFeedListItemLayout className="cursor-default [&:nth-child(2)]:opacity-70 [&:nth-child(3)]:opacity-40">
        <div className="flex items-center gap-2 font-medium">
          <Skeleton className="size-5" />
          <Skeleton className="h-5 w-64" />
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-subtle">
          <Skeleton className="h-5 w-16" />
        </div>
      </HomeFeedListItemLayout>
      <HomeFeedListItemLayout className="cursor-default [&:nth-child(2)]:opacity-70 [&:nth-child(3)]:opacity-40">
        <div className="flex items-center gap-2 font-medium">
          <Skeleton className="size-5" />
          <Skeleton className="h-5 w-64" />
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-subtle">
          <Skeleton className="h-5 w-16" />
        </div>
      </HomeFeedListItemLayout>
    </div>
  )
}

function ListEmptyState(props: { label: string }) {
  return (
    <div className="relative">
      <div>
        <HomeFeedListItemLayout>
          <div className="flex items-center gap-2 font-medium">
            <div className="size-5 rounded-md bg-hover" />
            <div className="h-5 w-64 rounded-md bg-hover" />
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-subtle">
            <div className="h-5 w-16 rounded-md bg-hover" />
          </div>
        </HomeFeedListItemLayout>
        <HomeFeedListItemLayout className="opacity-60">
          <div className="flex items-center gap-2 font-medium">
            <div className="size-5 rounded-md bg-hover" />
            <div className="h-5 w-64 rounded-md bg-hover" />
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-subtle">
            <div className="h-5 w-16 rounded-md bg-hover" />
          </div>
        </HomeFeedListItemLayout>
        <HomeFeedListItemLayout className="opacity-30">
          <div className="flex items-center gap-2 font-medium">
            <div className="size-5 rounded-md bg-hover" />
            <div className="h-5 w-64 rounded-md bg-hover" />
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-subtle">
            <div className="h-5 w-16 rounded-md bg-hover" />
          </div>
        </HomeFeedListItemLayout>
      </div>
      <div className="size-full left-o absolute top-0 flex flex-col items-center justify-center">
        <div className="rounded-xl border border-tertiary/50 bg-hover/10 px-6 py-4 backdrop-blur">
          <p className="text-subtle">{props.label}</p>
        </div>
      </div>
    </div>
  )
}

function FeedHiddenState() {
  const toggleFeedVisibility = useSetAtom(toggleFeedVisibilityAtom)

  function handleClick() {
    toggleFeedVisibility()
  }

  return (
    <div className="relative">
      <div className="blur-sm">
        <HomeFeedListItemLayout>
          <div className="flex items-center gap-2 font-medium">
            <div className="size-5 rounded-md bg-hover" />
            <div className="h-5 w-64 rounded-md bg-hover" />
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-subtle">
            <div className="h-5 w-16 rounded-md bg-hover" />
          </div>
        </HomeFeedListItemLayout>
        <HomeFeedListItemLayout className="opacity-60">
          <div className="flex items-center gap-2 font-medium">
            <div className="size-5 rounded-md bg-hover" />
            <div className="h-5 w-64 rounded-md bg-hover" />
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-subtle">
            <div className="h-5 w-16 rounded-md bg-hover" />
          </div>
        </HomeFeedListItemLayout>
        <HomeFeedListItemLayout className="opacity-30">
          <div className="flex items-center gap-2 font-medium">
            <div className="size-5 rounded-md bg-hover" />
            <div className="h-5 w-64 rounded-md bg-hover" />
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-subtle">
            <div className="h-5 w-16 rounded-md bg-hover" />
          </div>
        </HomeFeedListItemLayout>
      </div>
      <div className="size-full left-o absolute top-0 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-3 rounded-xl border border-tertiary/50 bg-hover/10 px-6 py-4 backdrop-blur">
          <p className="text-subtle">Home activity hidden</p>
          <Button variant="ghost" size="medium" onClick={handleClick}>
            Show activity
          </Button>
        </div>
      </div>
    </div>
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
    <Tooltip content="Chat">
      <button
        onClick={handleAttachClick}
        className="size-6 hidden place-items-center rounded-lg p-1 transition-colors hover:bg-light-5 group-hover:grid"
      >
        <MessageText variant="Bold" size={16} className="text-tertiary" />
      </button>
    </Tooltip>
  )
}

function AudioNotesListItem(props: { audioNote: ConversationData; listIndex: number }) {
  const formattedTitle = formatTitle(props.audioNote.title)
  const setSelectedAudioNote = useSetAtom(selectedAudioNoteAtom)
  const setSidePanelOpen = useSetAtom(sidePanelOpenAtom)
  const [currentListIndex, setCurrentListIndex] = useAtom(currentListIndexAtom)
  const isActiveElement = currentListIndex === props.listIndex
  const [isMounted, setIsMounted] = useAtom(isMountedAtom)

  const handleClick = React.useCallback(() => {
    setSelectedAudioNote(props.audioNote)
    setSidePanelOpen(true)
    setCurrentListIndex(props.listIndex)

    trackEvent('Audio Note Previewed', {
      audioNoteId: props.audioNote.id,
      meetingNote: !!props.audioNote?.meeting,
      source: 'home_feed',
    })
  }, [props.audioNote, setCurrentListIndex, props.listIndex, setSelectedAudioNote, setSidePanelOpen])

  React.useEffect(() => {
    if (isActiveElement && !isMounted) {
      setSelectedAudioNote(props.audioNote)
      setSidePanelOpen(true)
      setCurrentListIndex(props.listIndex)
      setIsMounted(true)
    }
  }, [
    isActiveElement,
    props.audioNote,
    props.listIndex,
    setCurrentListIndex,
    setSelectedAudioNote,
    setIsMounted,
    setSidePanelOpen,
    isMounted,
  ])

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
    <HomeFeedListItemLayout onClick={handleClick} className={cn('justify-between', isActiveElement && 'bg-hover')}>
      <div className="flex items-center gap-2 font-medium">
        {props.audioNote?.meeting ? (
          <MeetingIcon meeting={props.audioNote.meeting} size={20} />
        ) : (
          <VoiceSquare size={20} variant="Bold" className="text-green" />
        )}
        <h3 className="max-w-64 truncate tracking-tight text-primary">{formattedTitle}</h3>
      </div>
      <div className="flex items-center gap-2 font-medium">
        <p className="text-sm text-tertiary">{formatUpdatedAtDate(props.audioNote.endedAt)}</p>
        <AttachAudioAction audioNote={props.audioNote} />
      </div>
    </HomeFeedListItemLayout>
  )
}

function MeetingNotesTabContent() {
  const { data, isLoading } = useAudioNotes()
  const { recentMeetingNotes, audioGroupCounts, audioGroupLabels } = React.useMemo(() => {
    const recentMeetingNotes = data?.filter((audioNote) => audioNote.meeting) ?? []
    const { groupLengths, groupLabels } = getDateGroupLengths(recentMeetingNotes)
    return { recentMeetingNotes, audioGroupCounts: groupLengths, audioGroupLabels: groupLabels }
  }, [data])

  if (!isLoading && recentMeetingNotes.length === 0) {
    return <ListEmptyState label="No meeting notes" />
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
            groupContent={(index) => <GroupHeaderRow>{audioGroupLabels[index]}</GroupHeaderRow>}
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

function AudioNotesTabContent() {
  const { data, isLoading } = useAudioNotes()
  const { recentNonMeetingNotes, audioGroupCounts, audioGroupLabels } = React.useMemo(() => {
    const recentNonMeetingNotes = data?.filter((audioNote) => !audioNote.meeting) ?? []
    const { groupLengths, groupLabels } = getDateGroupLengths(recentNonMeetingNotes)
    return { recentNonMeetingNotes, audioGroupCounts: groupLengths, audioGroupLabels: groupLabels }
  }, [data])

  if (!isLoading && recentNonMeetingNotes.length === 0) {
    return <ListEmptyState label="No audio notes" />
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
            groupContent={(index) => <GroupHeaderRow>{audioGroupLabels[index]}</GroupHeaderRow>}
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

function ChatAction(props: { chat: ChatHistoryItem }) {
  const { clearPrompt, startNewConversation, addOrUpdateOpenConversation, setConversationId } = useStore(
    useShallow((state) => ({
      setConversationId: state.setConversationId,
      addOrUpdateOpenConversation: state.addOrUpdateOpenConversation,
      clearPrompt: state.clearPrompt,
      startNewConversation: state.startNewConversation,
    })),
  )

  function handleChatClick() {
    if (!props.chat) return

    clearPrompt()
    startNewConversation()
    addOrUpdateOpenConversation(props.chat)
    setConversationId(props.chat?.id)

    trackEvent('HL Chat Opened', {
      chatId: props.chat.id,
      source: 'home_feed',
    })
  }

  return (
    <Tooltip content="Chat">
      <button
        onClick={handleChatClick}
        className="size-6 hidden place-items-center rounded-lg p-1 transition-colors hover:bg-light-5 group-hover:grid"
      >
        <MessageText variant="Bold" size={16} className="text-tertiary" />
      </button>
    </Tooltip>
  )
}

function ChatShareLinkCopyButton(props: { chat: ChatHistoryItem }) {
  const mostRecentShareLinkId = props.chat?.shared_conversations?.[0]?.id
  const { mutate: generateShareLink, isPending: isGeneratingLink } = useGenerateShareLink()
  const { mutateAsync: copyLink } = useCopyLink()

  async function handleCopyClick() {
    if (!props.chat) return

    if (!mostRecentShareLinkId) {
      generateShareLink(props.chat)
    } else {
      await copyLink(mostRecentShareLinkId)
      toast('Link copied to clipboard', { icon: <Copy variant="Bold" size={20} /> })
    }
  }

  return (
    <Tooltip content="Share">
      <button
        onClick={handleCopyClick}
        disabled={isGeneratingLink}
        className="size-6 hidden place-items-center rounded-lg p-1 transition-colors hover:bg-light-5 group-hover:grid"
      >
        <Export variant="Bold" size={16} className={cn('text-tertiary', isGeneratingLink && 'opacity-50')} />
      </button>
    </Tooltip>
  )
}

function ChatListItem(props: { chat: ChatHistoryItem; listIndex: number }) {
  const setSelectedChatId = useSetAtom(selectedChatIdAtom)
  const [currentListIndex, setCurrentListIndex] = useAtom(currentListIndexAtom)
  const isActiveElement = currentListIndex === props.listIndex
  const [isMounted, setIsMounted] = useAtom(isMountedAtom)

  const handleClick = React.useCallback(() => {
    function handleClick() { }
    setSelectedChatId(props.chat.id)
    setCurrentListIndex(props.listIndex)

    if (isMounted) {
      trackEvent('HL Chat Previewed', {
        chatId: props.chat.id,
        source: 'home_feed',
      })
    }
  }, [props.chat, isMounted, setSelectedChatId, props.listIndex, setCurrentListIndex])

  React.useEffect(() => {
    if (isActiveElement && !isMounted) {
      setSelectedChatId(props.chat.id)
      setCurrentListIndex(props.listIndex)
      setIsMounted(true)
    }
  }, [props.chat.id, props.listIndex, setCurrentListIndex, setSelectedChatId, isActiveElement, isMounted, setIsMounted])

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
    <HomeFeedListItemLayout onClick={handleClick} className={cn('justify-between', isActiveElement && 'bg-hover')}>
      <div className="flex items-center gap-2 font-medium">
        <MessageText variant={'Bold'} size={20} className="text-subtle" />
        <h3 className="max-w-sm truncate tracking-tight text-primary">{props.chat.title}</h3>
      </div>
      <div className="flex items-center gap-2 font-medium">
        <p className="text-sm text-tertiary">{formatUpdatedAtDate(props.chat.updated_at)}</p>
        <ChatAction chat={props.chat} />
        <ChatShareLinkCopyButton chat={props.chat} />
      </div>
    </HomeFeedListItemLayout>
  )
}

function ChatsTabContent() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useHistory()
  const { chats, chatGroupCounts, chatGroupLabels } = React.useMemo(() => {
    const chats = data ? data.pages.flat() : []
    const { groupLengths, groupLabels } = getDateGroupLengths(chats)
    return { chats, chatGroupCounts: groupLengths, chatGroupLabels: groupLabels }
  }, [data])

  function handleFetchMore() {
    if (hasNextPage) fetchNextPage()
  }

  if (!isLoading && !data) {
    return <ListEmptyState label="No chats" />
  }

  return (
    <AnimatePresence initial={false}>
      {isLoading ? (
        <ListLoadingState />
      ) : (
        <HomeFeedListLayout>
          <GroupedVirtualList
            endReached={handleFetchMore}
            style={{ height: HOME_FEED_LIST_HEIGHT }}
            groupCounts={chatGroupCounts}
            groupContent={(index) => <GroupHeaderRow>{chatGroupLabels[index]}</GroupHeaderRow>}
            itemContent={(index) => {
              const chat = chats[index]
              return <ChatListItem key={chat.id} chat={chat} listIndex={index} />
            }}
            components={{
              Footer: () =>
                isFetchingNextPage && (
                  <HomeFeedListItemLayout>
                    <div className="flex items-center gap-2 font-medium">
                      <MessageText variant={'Bold'} size={20} className="animate-pulse text-subtle/50" />
                      <p className="animate-pulse text-subtle">Loading more chats...</p>
                    </div>
                  </HomeFeedListItemLayout>
                ),
            }}
          />
        </HomeFeedListLayout>
      )}
    </AnimatePresence>
  )
}

function RecentActivityTabContent() {
  const { data: recentActivity, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = useRecentActions()
  const { recentActivityGroupCounts, recentActivityGroupLabels } = React.useMemo(() => {
    const { groupLengths, groupLabels } = getDateGroupLengths(recentActivity ?? [])
    return { recentActivityGroupCounts: groupLengths, recentActivityGroupLabels: groupLabels }
  }, [recentActivity])

  function handleFetchMore() {
    if (hasNextPage) fetchNextPage()
  }

  if (!isLoading && (!recentActivity || recentActivity?.length === 0)) {
    return <ListEmptyState label="No recent activity" />
  }

  return (
    <AnimatePresence initial={false}>
      {isLoading ? (
        <ListLoadingState />
      ) : (
        <HomeFeedListLayout>
          <GroupedVirtualList
            endReached={handleFetchMore}
            style={{ height: HOME_FEED_LIST_HEIGHT }}
            groupCounts={recentActivityGroupCounts}
            groupContent={(index) => <GroupHeaderRow>{recentActivityGroupLabels[index]}</GroupHeaderRow>}
            itemContent={(index) => {
              const activity = recentActivity?.[index]
              if (!activity) return null
              if (activity.type === 'audio-note') {
                return <AudioNotesListItem key={activity.id} audioNote={activity} listIndex={index} />
              } else {
                return <ChatListItem key={activity.id} chat={activity} listIndex={index} />
              }
            }}
            components={{
              Footer: () =>
                isFetchingNextPage && (
                  <HomeFeedListItemLayout>
                    <div className="flex items-center gap-2 font-medium">
                      <MessageText variant={'Bold'} size={20} className="animate-pulse text-subtle/50" />
                      <p className="animate-pulse text-subtle">Loading more activity...</p>
                    </div>
                  </HomeFeedListItemLayout>
                ),
            }}
          />
        </HomeFeedListLayout>
      )}
    </AnimatePresence>
  )
}

function HomeFeedVisibilityToggle() {
  const feedHidden = useAtomValue(feedHiddenAtom)
  const toggleFeedVisibility = useSetAtom(toggleFeedVisibilityAtom)

  function handleClick() {
    toggleFeedVisibility()
  }

  return (
    <button type="button" aria-label="Toggle feed visibility" onClick={handleClick}>
      <Tooltip content={feedHidden ? 'Show activity' : 'Hide activity'}>
        {feedHidden ? <Eye size={20} /> : <EyeSlash size={20} />}
      </Tooltip>
    </button>
  )
}

function HomeFeedTabContent(props: { value: string; children: React.ReactNode }) {
  const feedHidden = useAtomValue(feedHiddenAtom)

  return (
    <ScopeProvider key={props.value} atoms={[currentListIndexAtom]}>
      <TabsContent value={props.value}>{feedHidden ? <FeedHiddenState /> : props.children}</TabsContent>
    </ScopeProvider>
  )
}

export function HomeFeed() {
  return (
    <Tabs defaultValue="recent">
      <TabsList className="mb-0 w-full">
        <div className="flex w-full items-center justify-between border-b border-subtle py-1.5">
          <div className="flex items-center gap-2">
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="meeting">Meeting Notes</TabsTrigger>
            <TabsTrigger value="audio">Audio Notes</TabsTrigger>
            <TabsTrigger value="chats">Chats</TabsTrigger>
          </div>
          <HomeFeedVisibilityToggle />
        </div>
      </TabsList>
      <HomeFeedTabContent value="recent">
        <RecentActivityTabContent />
      </HomeFeedTabContent>
      <HomeFeedTabContent value="meeting">
        <MeetingNotesTabContent />
      </HomeFeedTabContent>
      <HomeFeedTabContent value="audio">
        <AudioNotesTabContent />
      </HomeFeedTabContent>
      <HomeFeedTabContent value="chats">
        <ChatsTabContent />
      </HomeFeedTabContent>
    </Tabs>
  )
}
