'use client'

import React from 'react'
import { ChatHistoryItem } from '@/types'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowRight, Clock, MessageText, VoiceSquare } from 'iconsax-react'
import { useAtomValue, useSetAtom } from 'jotai'

import { ConversationData } from '@/types/conversations'
import { cn } from '@/lib/utils'
import { trackEvent } from '@/utils/amplitude'
import { formatConversationDuration, formatTitle } from '@/utils/conversations'
import { showHistoryAtom, toggleShowHistoryAtom } from '@/atoms/history'
import { selectedAudioNoteAtom, transcriptOpenAtom } from '@/atoms/transcript-viewer'
import { usePaginatedHistory } from '@/hooks/history'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MeetingIcon } from '@/components/icons'
import { useStore } from '@/components/providers/store-provider'

import { useAudioNotes, useRecentlyUpdatedHistory } from './hooks'
import { formatUpdatedAtDate, isChatHistoryItem, isConversationData } from './utils'

const FEED_LENGTH_LIMIT = 10

type HomeFeedListItemLayoutProps = React.ComponentProps<'div'> & {
  children: React.ReactNode
}

function HomeFeedListItemLayout({ className, children, ...props }: HomeFeedListItemLayoutProps) {
  return (
    <div
      className={cn('cursor-pointer rounded-xl px-3 hover:bg-secondary [&_div]:last:border-transparent', className)}
      {...props}
    >
      <div className="flex items-center justify-between gap-2 border-b border-subtle py-3 transition-colors">
        {children}
      </div>
    </div>
  )
}

function HomeFeedLoadingListItem() {
  return (
    <HomeFeedListItemLayout className="cursor-default [&:nth-child(2)]:opacity-70 [&:nth-child(3)]:opacity-40">
      <div className="flex items-center gap-2 font-medium">
        <Skeleton className="size-5" />
        <Skeleton className="h-5 w-64" />
      </div>
      <div className="flex items-center gap-2 text-sm font-medium text-subtle">
        <Skeleton className="h-5 w-16" />
      </div>
    </HomeFeedListItemLayout>
  )
}

function HomeFeedLoadingList() {
  return (
    <div>
      <HomeFeedLoadingListItem />
      <HomeFeedLoadingListItem />
      <HomeFeedLoadingListItem />
    </div>
  )
}

type AudioNotesListItemProps = {
  audioNote: ConversationData
}

export function AudioNotesListItem(props: AudioNotesListItemProps) {
  const formattedTitle = formatTitle(props.audioNote.title)
  const audioNoteDuration = formatConversationDuration(props.audioNote)
  const wordCount = props.audioNote?.transcript.split(' ').length
  const setSelectedAudioNote = useSetAtom(selectedAudioNoteAtom)
  const setTranscriptOpen = useSetAtom(transcriptOpenAtom)

  function handleClick() {
    setSelectedAudioNote(props.audioNote)
    setTranscriptOpen(true)
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

  if (isLoading) {
    return <HomeFeedLoadingList />
  }

  if (tenRecentMeetingNotes.length === 0) {
    return <div>No meeting notes.</div>
  }

  return (
    <>
      {tenRecentMeetingNotes.map((meetingNote) => (
        <AudioNotesListItem key={meetingNote.id} audioNote={meetingNote} />
      ))}
    </>
  )
}

function AudioNotesTabContent() {
  const { data, isLoading } = useAudioNotes()

  const tenRecentNonMeetingNotes = React.useMemo(() => {
    return data?.filter((audioNote) => !audioNote.meeting).slice(0, FEED_LENGTH_LIMIT) ?? []
  }, [data])

  if (isLoading) {
    return <HomeFeedLoadingList />
  }

  if (tenRecentNonMeetingNotes.length === 0) {
    return <div>No audio notes.</div>
  }

  return (
    <>
      {tenRecentNonMeetingNotes.map((audioNote) => (
        <AudioNotesListItem key={audioNote.id} audioNote={audioNote} />
      ))}
    </>
  )
}

type ChatListItemProps = {
  chat: ChatHistoryItem
}

export function ChatListItem(props: ChatListItemProps) {
  const addOrUpdateOpenConversation = useStore((store) => store.addOrUpdateOpenConversation)
  const setConversationId = useStore((store) => store.setConversationId)

  function handleClick() {
    addOrUpdateOpenConversation(props.chat)
    setConversationId(props.chat.id)

    trackEvent('HL Chat Opened', {
      chatId: props.chat.id,
      source: 'home_feed_recent_chat',
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

  if (isLoading) {
    return <HomeFeedLoadingList />
  }

  if (tenRecentChats.length === 0) {
    return <div>No recent chats.</div>
  }

  return (
    <>
      {tenRecentChats.map((chat) => (
        <ChatListItem key={chat.id} chat={chat} />
      ))}
      <button
        type="button"
        aria-label="Toggle history sidebar"
        onClick={handleShowMoreClick}
        className="group w-full text-left text-subtle hover:text-primary"
      >
        <HomeFeedListItemLayout className="flex items-center">
          <Clock variant={'Bold'} size={20} />
          <p>{`${historySidebarIsOpen ? 'Hide' : 'View full'} chat history`}</p>
          <ArrowRight
            size={20}
            strokeWidth={4}
            className={cn(
              'transition-transform group-hover:translate-x-1',
              historySidebarIsOpen && 'translate-x-1 -rotate-180 group-hover:translate-x-0',
            )}
          />
        </HomeFeedListItemLayout>
      </button>
    </>
  )
}

function RecentActivityTabContent() {
  const { data: historyData, isLoading: isLoadingHistory } = usePaginatedHistory()
  const { data: audioNotesData, isLoading: isLoadingAudioNotes } = useAudioNotes()

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

    console.log(recentActionsSortedByUpdatedAt)

    return recentActionsSortedByUpdatedAt.slice(0, FEED_LENGTH_LIMIT)
  }, [historyData, audioNotesData])

  if (isLoadingHistory || isLoadingAudioNotes) {
    return <HomeFeedLoadingList />
  }

  if (tenRecentActions.length === 0) {
    return <div>No recent activity.</div>
  }

  const renderRecentActions = tenRecentActions.map((action) => {
    if (isConversationData(action)) {
      const audioNote = action
      return <AudioNotesListItem key={audioNote.id} audioNote={audioNote} />
    } else if (isChatHistoryItem(action)) {
      const chat = action
      return <ChatListItem key={chat.id} chat={chat} />
    }
  })

  return renderRecentActions
}

export function HomeFeed() {
  return (
    <Tabs defaultValue="recent-activity">
      <TabsList className="mb-0 w-full">
        <div className="flex w-full items-center justify-between border-b border-subtle py-1.5">
          <div className="flex items-center gap-2">
            <TabsTrigger value="recent-activity">Recent Activity</TabsTrigger>
            <TabsTrigger value="meeting-notes">Meeting Notes</TabsTrigger>
            <TabsTrigger value="audio-notes">Audio Notes</TabsTrigger>
            <TabsTrigger value="chats">Chats</TabsTrigger>
          </div>
          <div>Search</div>
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
