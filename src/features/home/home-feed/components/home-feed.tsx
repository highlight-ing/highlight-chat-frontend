'use client'

import React from 'react'
import { AnimatePresence, motion, Variants } from 'framer-motion'
import { Eye, EyeSlash, MessageText } from 'iconsax-react'
import { useAtomValue, useSetAtom } from 'jotai'
import { ScopeProvider } from 'jotai-scope'

import { cn, getDateGroupLengths } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip } from '@/components/ui/tooltip'
import Button from '@/components/Button/Button'

import { GroupedVirtualList, GroupHeaderRow } from '../components/grouped-virtual-list'
import { currentListIndexAtom, feedHiddenAtom, toggleFeedVisibilityAtom } from '../atoms'
import { HOME_FEED_LIST_HEIGHT } from '../constants'
import { useRecentActions } from '../hooks'
import { AudioNotesListItem, AudioNotesTabContent, MeetingNotesTabContent } from './audio-note'
import { ChatListItem, ChatsTabContent } from './chats'

type HomeFeedListItemLayoutProps = React.ComponentPropsWithRef<'div'>

export function HomeFeedListItemLayout({ className, children, ...props }: HomeFeedListItemLayoutProps) {
  return (
    <div
      className={cn(
        'group mr-2 rounded-xl px-3 transition-colors hover:bg-secondary focus-visible:bg-hover lg:cursor-pointer [&_div]:last:border-transparent',
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

export function HomeFeedListLayout(props: { children: React.ReactNode }) {
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

export function ListLoadingState() {
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

export function ListEmptyState(props: { children: React.ReactNode; className?: string }) {
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
        <div
          className={cn('rounded-xl border border-tertiary/50 bg-hover/10 px-6 py-4 backdrop-blur', props.className)}
        >
          {props.children}
        </div>
      </div>
    </div>
  )
}

export function FeedHiddenState() {
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
    return (
      <ListEmptyState>
        <p className="text-subtle">No recent activity</p>
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
