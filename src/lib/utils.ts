import { ChatHistoryItem } from '@/types'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

import { ConversationData } from '@/types/conversations'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const DATE_GROUP_LABELS = ['Today', 'Past 7 days', 'Past 30 days', 'Older than 30 days'] as const

export function sortChatsByDate(inputArray: Array<ChatHistoryItem>) {
  const now = new Date()
  const oneDayAgo = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const today: ChatHistoryItem[] = []
  const lastWeek: ChatHistoryItem[] = []
  const lastMonth: ChatHistoryItem[] = []
  const older: ChatHistoryItem[] = []

  inputArray.forEach((item) => {
    const createdAt = new Date(item.updated_at)

    if (createdAt >= oneDayAgo) {
      today.push(item)
    } else if (createdAt >= oneWeekAgo) {
      lastWeek.push(item)
    } else if (createdAt >= oneMonthAgo) {
      lastMonth.push(item)
    } else {
      older.push(item)
    }
  })

  return {
    today,
    lastWeek,
    lastMonth,
    older,
  }
}

type DateGroupItem = ChatHistoryItem | ConversationData

function isChatHistoryItem(item: DateGroupItem): item is ChatHistoryItem {
  return 'updated_at' in item
}

export function getDateGroupLengths(inputArray: DateGroupItem[]) {
  const now = new Date()
  const oneDayAgo = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const today: DateGroupItem[] = []
  const lastWeek: DateGroupItem[] = []
  const lastMonth: DateGroupItem[] = []
  const older: DateGroupItem[] = []

  inputArray.forEach((item) => {
    const dateValue = isChatHistoryItem(item) ? item.updated_at : item.endedAt
    const createdAt = new Date(dateValue)

    if (createdAt >= oneDayAgo) {
      today.push(item)
    } else if (createdAt >= oneWeekAgo) {
      lastWeek.push(item)
    } else if (createdAt >= oneMonthAgo) {
      lastMonth.push(item)
    } else {
      older.push(item)
    }
  })

  const groups = [today, lastWeek, lastMonth, older]
  const groupLengths = groups.flatMap((group) => group.length)
  const groupLabels = groupLengths.map((groupLength, index) => (groupLength > 0 ? DATE_GROUP_LABELS[index] : undefined))

  return {
    groupLengths: groupLengths.filter((groupLength) => groupLength > 0),
    groupLabels: groupLabels.filter((groupLabel) => !!groupLabel),
  }
}
