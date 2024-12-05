'use client'

import React from 'react'
import { ChatHistoryItem } from '@/types'
import { MessageText, VoiceSquare } from 'iconsax-react'
import { useSetAtom } from 'jotai'

import { ConversationData } from '@/types/conversations'
import { trackEvent } from '@/utils/amplitude'
import { formatConversationDuration, formatTitle } from '@/utils/conversations'
import { selectedAudioNoteAtom, transcriptOpenAtom } from '@/atoms/transcript-viewer'
import { useHistory } from '@/hooks/useHistory'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useStore } from '@/components/providers/store-provider'

import { useAudioNotes } from './hooks'

const FEED_LENGTH_LIMIT = 10

type HomeFeedListItemLayoutProps = React.ComponentProps<'div'> & {
  children: React.ReactNode
}

function HomeFeedListItemLayout({ children, ...props }: HomeFeedListItemLayoutProps) {
  return (
    <div className="cursor-pointer rounded-xl px-3 hover:bg-secondary [&_div]:last:border-transparent" {...props}>
      <div className="flex items-center justify-between gap-2 border-b border-subtle py-3 transition-colors">
        {children}
      </div>
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
        <VoiceSquare size={20} variant="Bold" className="text-green" />
        <h3 className="max-w-64 truncate tracking-tight text-primary">{formattedTitle}</h3>
        <p className="text-sm text-tertiary">3:30pm</p>
      </div>
      <div className="flex items-center gap-2 text-sm font-medium text-subtle">
        <p className="capitalize">{audioNoteDuration}</p>
        <p>{`${wordCount} Words`}</p>
      </div>
    </HomeFeedListItemLayout>
  )
}

type AudioNotesListProps = {
  audioNotes: Array<ConversationData>
}

export function AudioNotesList(props: AudioNotesListProps) {
  if (!props.audioNotes || props.audioNotes.length === 0) {
    return <div>No audio notes.</div>
  }

  return (
    <div>
      {props.audioNotes.map((audioNote) => (
        <AudioNotesListItem key={audioNote.id} audioNote={audioNote} />
      ))}
    </div>
  )
}

function AudioNotesTabContent() {
  const { data, isLoading } = useAudioNotes()

  const { meetingNotes, nonMeetingNotes, allAudioNotes } = React.useMemo(() => {
    const tenRecentMeetingNotes = data?.filter((audioNote) => audioNote.meeting).slice(0, FEED_LENGTH_LIMIT) ?? []
    const tenRecentNonMeetingNotes = data?.filter((audioNote) => !audioNote.meeting).slice(0, FEED_LENGTH_LIMIT) ?? []
    const tenRecentAudioNotes = data?.slice(0, FEED_LENGTH_LIMIT) ?? []

    return {
      meetingNotes: tenRecentMeetingNotes,
      nonMeetingNotes: tenRecentNonMeetingNotes,
      allAudioNotes: tenRecentAudioNotes,
    }
  }, [data])

  if (isLoading) {
    return <div>Loading audio notes...</div>
  }

  return (
    <>
      <TabsContent value="meeting-notes">
        <AudioNotesList audioNotes={meetingNotes} />
      </TabsContent>
      <TabsContent value="audio-notes">
        <AudioNotesList audioNotes={nonMeetingNotes} />
      </TabsContent>
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
      </div>
      <p className="text-sm text-tertiary">{props.chat.updated_at}</p>
    </HomeFeedListItemLayout>
  )
}

function ChatsTabContent() {
  const { data, isLoading } = useHistory()

  const tenRecentChats = React.useMemo(() => data?.slice(0, FEED_LENGTH_LIMIT) ?? [], [data])

  if (isLoading) {
    return <div>Loading audio notes...</div>
  }

  if (tenRecentChats.length === 0) {
    return <div>No recent chats.</div>
  }

  return (
    <TabsContent value="chats">
      {tenRecentChats.map((chat) => (
        <ChatListItem key={chat.id} chat={chat} />
      ))}
    </TabsContent>
  )
}

function RecentActivityTabContent() {
  const { data: historyData, isLoading: isLoadingHistory } = useHistory()
  const { data: audioNotesData, isLoading: isLoadingAudioNotes } = useAudioNotes()

  const tenRecentActions = React.useMemo(() => {
    const tenRecentChats =
      historyData
        ?.slice(0, FEED_LENGTH_LIMIT)
        .map((chat) => ({ ...chat, updatedAt: new Date(chat.updated_at).getTime() })) ?? []

    const tenRecentAudioNotes =
      audioNotesData
        ?.slice(0, FEED_LENGTH_LIMIT)
        .map((audioNote) => ({ ...audioNote, updatedAt: audioNote.endedAt.getTime() })) ?? []

    const recentActionsSortedByUpdatedAt = [...tenRecentChats, ...tenRecentAudioNotes].sort(
      (a, b) => b.updatedAt - a.updatedAt,
    )

    console.log(recentActionsSortedByUpdatedAt)

    return recentActionsSortedByUpdatedAt.slice(0, FEED_LENGTH_LIMIT)
  }, [historyData, audioNotesData])

  if (isLoadingHistory || isLoadingAudioNotes) {
    return <div>Loading recent activity...</div>
  }

  if (tenRecentActions.length === 0) {
    return <div>No recent activity.</div>
  }

  const renderRecentActions = tenRecentActions.map((action: unknown) => {
    if (action?.transcript) {
      const audioNote = action as ConversationData
      return <AudioNotesListItem key={audioNote.id} audioNote={audioNote} />
    } else {
      const chat = action as ChatHistoryItem
      return <ChatListItem key={chat.id} chat={chat} />
    }
  })

  return <TabsContent value="recent-activity">{renderRecentActions}</TabsContent>
}

export function HomeFeed() {
  return (
    <Tabs defaultValue="recent-activity">
      <TabsList className="mb-0 w-full">
        <div className="flex w-full items-center justify-between border-b border-subtle py-1.5">
          <div className="flex items-center gap-2">
            <TabsTrigger value="recent-activity">Recent Activity</TabsTrigger>
            <TabsTrigger value="chats">Chats</TabsTrigger>
            <TabsTrigger value="meeting-notes">Meeting Notes</TabsTrigger>
            <TabsTrigger value="audio-notes">Audio Notes</TabsTrigger>
          </div>
          <div>Search</div>
        </div>
      </TabsList>
      <RecentActivityTabContent />
      <ChatsTabContent />
      <AudioNotesTabContent />
    </Tabs>
  )
}
