import { format } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'

type TranscriptMessage = {
  time: string
  sender: string
  text: string
}

export function parseTranscript(transcript: string | undefined) {
  if (typeof transcript !== 'string') {
    console.error('Invalid transcript provided to parseTranscript:', transcript)
    return []
  }

  const transcriptMessages = transcript
    .split('\n')
    .map((line): TranscriptMessage | null => {
      const regex = /^(\d{2}:\d{2}:\d{2}\s+(?:AM|PM))\s+-\s+(.+?)(?:\s*:\s*|\s+-\s+)(.*)$/
      const match = line.match(regex)

      if (match) {
        const [, time, sender, text] = match
        return {
          time,
          sender: sender.trim(),
          text: text.trim() || '.',
        }
      }
      return null
    })
    .filter((message): message is TranscriptMessage => message !== null)

  return transcriptMessages
}

export function formatHeaderTimestamp(startDate: Date | string | number, endDate: Date | string | number) {
  const startDateObj = startDate instanceof Date ? startDate : new Date(startDate)
  const endDateObj = endDate instanceof Date ? endDate : new Date(endDate)

  // check if dates are valid
  if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
    console.error('Invalid date input:', { startDate, endDate })
    return 'Invalid date range'
  }

  // get the user's time zone
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

  // format the date part
  const datePart = format(startDateObj, 'MMM d')

  const startTimePart = formatInTimeZone(startDateObj, userTimeZone, 'h:mma')
  const endTimePart = formatInTimeZone(endDateObj, userTimeZone, 'h:mma')

  const timeZoneAbbr = formatInTimeZone(startDateObj, userTimeZone, 'zzz')

  return `${datePart} ${startTimePart} - ${endTimePart} ${timeZoneAbbr}`
}

export function formatTranscriptTitle(originalTitle: string) {
  if (!originalTitle) return 'Audio Note'

  if (originalTitle.startsWith('Audio Notes from')) {
    return 'Audio Note'
  }

  return originalTitle
}
