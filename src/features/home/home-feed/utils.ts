import { format } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'

export function formatUpdatedAtDate(updatedAt: Date | string | number) {
  const updatedAtDate = updatedAt instanceof Date ? updatedAt : new Date(updatedAt)

  if (isNaN(updatedAtDate.getTime())) {
    return null
  }

  const now = new Date()
  const isToday = updatedAtDate.toDateString() === now.toDateString()

  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const formattedDate = format(updatedAtDate, 'MMM d')
  const formattedTime = formatInTimeZone(updatedAtDate, userTimeZone, 'h:mm a')

  if (isToday) {
    return formattedTime
  }

  return `${formattedDate} ${formattedTime}`
}
