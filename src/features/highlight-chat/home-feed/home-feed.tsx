'use client'

import React from 'react'
import { ChatHistoryItem } from '@/types'
import { AnimatePresence, motion, Variants } from 'framer-motion'
import { Clock, MessageText, VoiceSquare } from 'iconsax-react'
import { useAtomValue, useSetAtom } from 'jotai'

import { ConversationData } from '@/types/conversations'
import { cn } from '@/lib/utils'
import { trackEvent } from '@/utils/amplitude'
import { formatConversationDuration, formatTitle } from '@/utils/conversations'
import { showHistoryAtom, toggleShowHistoryAtom } from '@/atoms/history'
import { selectedAudioNoteAtom, transcriptOpenAtom } from '@/atoms/transcript-viewer'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MeetingIcon } from '@/components/icons'
import { useStore } from '@/components/providers/store-provider'

import { useAudioNotes, useRecentlyUpdatedHistory } from './hooks'
import { formatUpdatedAtDate, isChatHistoryItem, isConversationData } from './utils'

const FEED_LENGTH_LIMIT = 10

const homeFeedListItemVariants: Variants = {
  hidden: { opacity: 0, y: -5 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', bounce: 0, duration: 0.4 } },
}

type HomeFeedListItemLayoutProps = React.ComponentProps<'div'> & {
  children: React.ReactNode
}

function HomeFeedListItemLayout({ className, children, ...props }: HomeFeedListItemLayoutProps) {
  return (
    <motion.div variants={homeFeedListItemVariants}>
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
    </motion.div>
  )
}

function HomeFeedListLayout(props: { children: React.ReactNode }) {
  return (
    <motion.div initial="hidden" animate="visible" transition={{ staggerChildren: 0.01 }}>
      {props.children}
    </motion.div>
  )
}

function LoadingList() {
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

function EmptyList(props: { label: string }) {
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
        <div className="rounded-xl border border-tertiary bg-hover/10 px-6 py-4 backdrop-blur">
          <p className="text-subtle">{props.label}</p>
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
  const setTranscriptOpen = useSetAtom(transcriptOpenAtom)

  function handleClick() {
    setSelectedAudioNote(props.audioNote)
    setTranscriptOpen(true)

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

  const tenRecentMeetingNotes = React.useMemo(() => {
    return data?.filter((audioNote) => audioNote.meeting).slice(0, FEED_LENGTH_LIMIT) ?? []
  }, [data])

  if (!isLoading && tenRecentMeetingNotes.length === 0) {
    return <EmptyList label="No meeting notes" />
  }

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      {isLoading ? (
        <LoadingList />
      ) : (
        <HomeFeedListLayout>
          {tenRecentMeetingNotes.map((meetingNote) => (
            <AudioNotesListItem key={meetingNote.id} audioNote={meetingNote} />
          ))}
        </HomeFeedListLayout>
      )}
    </AnimatePresence>
  )
}

function AudioNotesTabContent() {
  const { data, isLoading } = useAudioNotes()

  const tenRecentNonMeetingNotes = React.useMemo(() => {
    return data?.filter((audioNote) => !audioNote.meeting).slice(0, FEED_LENGTH_LIMIT) ?? []
  }, [data])

  if (!isLoading && tenRecentNonMeetingNotes.length === 0) {
    return <EmptyList label="No audio notes" />
  }

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      {isLoading ? (
        <LoadingList />
      ) : (
        <HomeFeedListLayout>
          {tenRecentNonMeetingNotes.map((audioNote) => (
            <AudioNotesListItem key={audioNote.id} audioNote={audioNote} />
          ))}
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
  const { data, isLoading } = useRecentlyUpdatedHistory()
  const historySidebarIsOpen = useAtomValue(showHistoryAtom)
  const toggleShowHistory = useSetAtom(toggleShowHistoryAtom)

  const tenRecentChats = React.useMemo(() => data?.slice(0, FEED_LENGTH_LIMIT) ?? [], [data])

  function handleShowMoreClick() {
    toggleShowHistory()
  }

  if (!isLoading && tenRecentChats.length === 0) {
    return <EmptyList label="No chats" />
  }

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      {isLoading ? (
        <LoadingList />
      ) : (
        <HomeFeedListLayout>
          {tenRecentChats.map((chat) => (
            <ChatListItem key={chat.id} chat={chat} />
          ))}
          <motion.button
            variants={homeFeedListItemVariants}
            type="button"
            aria-label="Toggle history sidebar"
            onClick={handleShowMoreClick}
            className="group w-full text-left text-subtle hover:text-primary"
          >
            <HomeFeedListItemLayout className="flex items-center">
              <Clock variant={'Bold'} size={20} />
              <p>{`${historySidebarIsOpen ? 'Hide' : 'View full'} chat history`}</p>
            </HomeFeedListItemLayout>
          </motion.button>
        </HomeFeedListLayout>
      )}
    </AnimatePresence>
  )
}

function RecentActivityTabContent() {
  const { data: historyData, isLoading: isLoadingHistory } = useRecentlyUpdatedHistory()
  const { data: audioNotesData, isLoading: isLoadingAudioNotes } = useAudioNotes()
  const isLoading = isLoadingHistory || isLoadingAudioNotes

  const tenRecentActions = React.useMemo(() => {
    const tenRecentChats =
      historyData
        ?.slice(0, FEED_LENGTH_LIMIT)
        .map((chat) => ({ ...chat, updatedAt: new Date(chat.updated_at).toISOString() })) ?? []
    const tenRecentAudioNotes =
      audioNotesData
        ?.slice(0, FEED_LENGTH_LIMIT)
        .map((audioNote) => ({ ...audioNote, updatedAt: audioNote.endedAt.toISOString() })) ?? []
    const recentActionsSortedByUpdatedAt = [...tenRecentChats, ...tenRecentAudioNotes].sort((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt),
    )

    return recentActionsSortedByUpdatedAt.slice(0, FEED_LENGTH_LIMIT)
  }, [historyData, audioNotesData])

  const renderRecentActions = tenRecentActions.map((action) => {
    if (isConversationData(action)) {
      const audioNote = action
      return <AudioNotesListItem key={audioNote.id} audioNote={audioNote} />
    } else if (isChatHistoryItem(action)) {
      const chat = action
      return <ChatListItem key={chat.id} chat={chat} />
    }
  })

  if (!isLoading && tenRecentActions.length === 0) {
    return <EmptyList label="No recent activity" />
  }

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      {isLoading ? <LoadingList /> : <HomeFeedListLayout>{renderRecentActions}</HomeFeedListLayout>}
    </AnimatePresence>
  )
}

export function HomeFeed() {
  return (
    <Tabs defaultValue="recent-activity">
      <TabsList className="mb-0 w-full">
        <div className="flex w-full items-center justify-start border-b border-subtle py-1.5">
          <div className="flex items-center gap-2">
            <TabsTrigger value="recent-activity">Recent</TabsTrigger>
            <TabsTrigger value="meeting-notes">Meeting Notes</TabsTrigger>
            <TabsTrigger value="audio-notes">Audio Notes</TabsTrigger>
            <TabsTrigger value="chats">Chats</TabsTrigger>
          </div>
        </div>
      </TabsList>
      <TabsContent value="recent-activity">
        <RecentActivityTabContent />
      </TabsContent>
      <TabsContent value="meeting-notes">
        <MeetingNotesTabContent />
      </TabsContent>
      <TabsContent value="audio-notes">
        <AudioNotesTabContent />
      </TabsContent>
      <TabsContent value="chats">
        <ChatsTabContent />
      </TabsContent>
    </Tabs>
  )
}
