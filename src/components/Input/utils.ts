import { differenceInMinutes, format, formatDuration, intervalToDuration, isThisHour, isToday } from 'date-fns'

export function formatConversationEndDate(date: Date) {
  if (isThisHour(date)) {
    const mins = differenceInMinutes(new Date(), date)
    if (mins < 2) {
      return 'moments ago'
    }
    return `${mins} minutes ago`
  } else if (isToday(date)) {
    const hours = format(date, 'H:mm a')
    return hours
  }

  return format(date, 'MMM d, yyyy - H:mm a')
}

export function formatConversationDuration(conversationDurationInMilliseconds: number) {
  const conversationDuration = intervalToDuration({ start: 0, end: conversationDurationInMilliseconds })
  const formattedConversationDuration = formatDuration(conversationDuration, { format: ['hours', 'minutes'] })
  return formattedConversationDuration
}
