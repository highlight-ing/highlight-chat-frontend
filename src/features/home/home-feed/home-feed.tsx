'use client'

import React from 'react'
import { ChatHistoryItem } from '@/types'
import { AnimatePresence, motion, Variants } from 'framer-motion'
import { Eye, EyeSlash, MessageText, VoiceSquare } from 'iconsax-react'
import { useAtomValue, useSetAtom } from 'jotai'
import { GroupedVirtuoso, Virtuoso } from 'react-virtuoso'

import { ConversationData } from '@/types/conversations'
import { cn, getAudioDateGroupLengths, getChatDateGroupLengths } from '@/lib/utils'
import { trackEvent } from '@/utils/amplitude'
import { formatConversationDuration, formatTitle } from '@/utils/conversations'
import { selectedAudioNoteAtom, sidePanelOpenAtom } from '@/atoms/side-panel'
import { useHistory } from '@/hooks/chat-history'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip } from '@/components/ui/tooltip'
import Button from '@/components/Button/Button'
import { OpenAppButton } from '@/components/buttons/open-app-button'
import { MeetingIcon } from '@/components/icons'
import { useStore } from '@/components/providers/store-provider'

import { feedHiddenAtom, toggleFeedVisibilityAtom } from './atoms'
import { useAudioNotes, useRecentActions } from './hooks'
import { formatUpdatedAtDate } from './utils'

type HomeFeedListItemLayoutProps = React.ComponentPropsWithRef<'div'>

function HomeFeedListItemLayout({ className, children, ...props }: HomeFeedListItemLayoutProps) {
  return (
    <div>
      <div
        className={cn(
          'cursor-pointer rounded-xl px-3 transition-colors hover:bg-secondary [&_div]:last:border-transparent',
          className,
        )}
        {...props}
      >
        <div className="flex items-center justify-between gap-2 border-b border-subtle py-3 transition-colors">
          {children}
        </div>
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

function AudioNotesListItem(props: { audioNote: ConversationData }) {
  const formattedTitle = formatTitle(props.audioNote.title)
  const audioNoteDuration = formatConversationDuration(props.audioNote)
  const wordCount = props.audioNote?.transcript.split(' ').length
  const setSelectedAudioNote = useSetAtom(selectedAudioNoteAtom)
  const setSidePanelOpen = useSetAtom(sidePanelOpenAtom)

  function handleClick() {
    setSelectedAudioNote(props.audioNote)
    setSidePanelOpen(true)

    trackEvent('Audio Note Previewed', {
      audioNoteId: props.audioNote.id,
      meetingNote: !!props.audioNote?.meeting,
      source: 'home_feed',
    })
  }

  return (
    <HomeFeedListItemLayout onClick={handleClick}>
      <div className="flex items-center gap-2 font-medium">
        {props.audioNote?.meeting ? (
          <MeetingIcon meeting={props.audioNote.meeting} size={20} />
        ) : (
          <VoiceSquare size={20} variant="Bold" className="text-green" />
        )}
        <h3 className="max-w-64 truncate tracking-tight text-primary">{formattedTitle}</h3>
        <p className="text-sm text-tertiary">{formatUpdatedAtDate(props.audioNote.endedAt)}</p>
      </div>
      <div className="flex items-center gap-2 text-sm font-medium text-subtle">
        <p className="capitalize">{audioNoteDuration}</p>
        <p>{`${wordCount} Words`}</p>
      </div>
    </HomeFeedListItemLayout>
  )
}

function MeetingNotesTabContent() {
  const { data, isLoading } = useAudioNotes()

  const { recentMeetingNotes, audioGroupCounts, audioGroupLabels } = React.useMemo(() => {
    const recentMeetingNotes = data?.filter((audioNote) => audioNote.meeting) ?? []
    const { groupLengths, groupLabels } = getAudioDateGroupLengths(recentMeetingNotes)

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
          <GroupedVirtuoso
            style={{ height: 'calc(100vh - 200px)' }}
            groupCounts={audioGroupCounts}
            groupContent={(index) => (
              <div className="w-full bg-primary px-5 py-3 shadow-md">
                <p className="font-medium text-subtle">{audioGroupLabels[index]}</p>
              </div>
            )}
            itemContent={(index) => {
              const meetingNote = recentMeetingNotes[index]
              return <AudioNotesListItem key={meetingNote.id} audioNote={meetingNote} />
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
    const recentNonMeetingNotes = data?.filter((audioNote) => audioNote.meeting) ?? []
    const { groupLengths, groupLabels } = getAudioDateGroupLengths(recentNonMeetingNotes)

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
          <GroupedVirtuoso
            style={{ height: 'calc(100vh - 200px)' }}
            groupCounts={audioGroupCounts}
            groupContent={(index) => (
              <div className="w-full bg-primary px-5 py-3 shadow-md">
                <p className="font-medium text-subtle">{audioGroupLabels[index]}</p>
              </div>
            )}
            itemContent={(index) => {
              const audioNote = recentNonMeetingNotes[index]
              return <AudioNotesListItem key={audioNote.id} audioNote={audioNote} />
            }}
          />
        </HomeFeedListLayout>
      )}
    </AnimatePresence>
  )
}

function ChatListItem(props: { chat: ChatHistoryItem }) {
  const addOrUpdateOpenConversation = useStore((store) => store.addOrUpdateOpenConversation)
  const setConversationId = useStore((store) => store.setConversationId)

  function handleClick() {
    addOrUpdateOpenConversation(props.chat)
    setConversationId(props.chat.id)

    trackEvent('HL Chat Opened', {
      chatId: props.chat.id,
      source: 'home_feed',
    })
  }

  return (
    <HomeFeedListItemLayout onClick={handleClick}>
      <div className="flex items-center gap-2 font-medium">
        <MessageText variant={'Bold'} size={20} className="text-subtle" />
        <h3 className="max-w-sm truncate tracking-tight text-primary">{props.chat.title}</h3>
        <p className="text-sm text-tertiary">{formatUpdatedAtDate(props.chat.updated_at)}</p>
      </div>
    </HomeFeedListItemLayout>
  )
}

function ChatsTabContent() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useHistory()
  const { allChatRows, chatGroupCounts, chatGroupLabels } = React.useMemo(() => {
    const allChatRows = data ? data.pages.flat() : []
    const { groupLengths, groupLabels } = getChatDateGroupLengths(allChatRows)

    return { allChatRows, chatGroupCounts: groupLengths, chatGroupLabels: groupLabels }
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
          <GroupedVirtuoso
            endReached={handleFetchMore}
            style={{ height: 'calc(100vh - 200px)' }}
            groupCounts={chatGroupCounts}
            groupContent={(index) => (
              <div className="w-full bg-primary px-5 py-3 shadow-md">
                <p className="font-medium text-subtle">{chatGroupLabels[index]}</p>
              </div>
            )}
            itemContent={(index) => {
              const chat = allChatRows[index]
              return <ChatListItem key={chat.id} chat={chat} />
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
  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = useRecentActions()

  function handleFetchMore() {
    if (hasNextPage) fetchNextPage()
  }

  if (!isLoading && (!data || data?.length === 0)) {
    return <ListEmptyState label="No recent activity" />
  }

  return (
    <AnimatePresence initial={false}>
      {isLoading ? (
        <ListLoadingState />
      ) : (
        <HomeFeedListLayout>
          <Virtuoso
            data={data ?? []}
            endReached={handleFetchMore}
            style={{ height: 'calc(100vh - 200px)' }}
            itemContent={(_, action) => {
              if (action.type === 'audio-note') {
                return <AudioNotesListItem key={action.id} audioNote={action} />
              } else {
                return <ChatListItem key={action.id} chat={action} />
              }
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

  return <TabsContent value={props.value}>{feedHidden ? <FeedHiddenState /> : props.children}</TabsContent>
}

export function HomeFeed() {
  return (
    <Tabs defaultValue="recent-activity">
      <TabsList className="mb-0 w-full">
        <div className="flex w-full items-center justify-between border-b border-subtle py-1.5">
          <div className="flex items-center gap-2">
            <TabsTrigger value="recent-activity">Recent</TabsTrigger>
            <TabsTrigger value="meeting-notes">Meeting Notes</TabsTrigger>
            <TabsTrigger value="audio-notes">Audio Notes</TabsTrigger>
            <TabsTrigger value="chats">Chats</TabsTrigger>
          </div>
          <HomeFeedVisibilityToggle />
        </div>
      </TabsList>
      <HomeFeedTabContent value="recent-activity">
        <RecentActivityTabContent />
      </HomeFeedTabContent>
      <HomeFeedTabContent value="meeting-notes">
        <MeetingNotesTabContent />
      </HomeFeedTabContent>
      <HomeFeedTabContent value="audio-notes">
        <AudioNotesTabContent />
      </HomeFeedTabContent>
      <HomeFeedTabContent value="chats">
        <ChatsTabContent />
      </HomeFeedTabContent>
    </Tabs>
  )
}
