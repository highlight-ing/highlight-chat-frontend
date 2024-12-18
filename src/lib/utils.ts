import { ChatHistoryItem } from '@/types'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

import { ConversationData } from '@/types/conversations'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

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

export function getChatDateGroupLengths(inputArray: Array<ChatHistoryItem>) {
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

  const groups = [today, lastWeek, lastMonth, older]
  const groupLengths = groups.flatMap((group) => group.length)

  return groupLengths.filter((groupLength) => groupLength > 0)
}

export function sortConversationsByDate(inputArray: Array<ConversationData>) {
  const now = new Date()
  const oneDayAgo = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const today: ConversationData[] = []
  const lastWeek: ConversationData[] = []
  const lastMonth: ConversationData[] = []
  const older: ConversationData[] = []

  inputArray.forEach((item) => {
    const createdAt = new Date(item.endedAt)

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
