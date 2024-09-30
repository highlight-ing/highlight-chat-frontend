export const getDurationUnit = (duration: number, unit: 'hours' | 'minutes', abbreviated = false) => {
  if (abbreviated) {
    return duration > 1 ? (unit === 'hours' ? 'hrs' : 'mins') : unit === 'hours' ? 'hr' : 'min'
  } else {
    return duration > 1 ? unit : unit === 'hours' ? 'hour' : 'minute'
  }
}

export const getTimeAgo = (timestamp: Date): string => {
  const now = new Date()
  const date = new Date(timestamp)
  const diffInMilliseconds = now.getTime() - date.getTime()
  const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60))
  const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24))

  if (diffInMinutes < 1) {
    return 'Moments ago'
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} ${getDurationUnit(diffInMinutes, 'minutes')} ago`
  } else if (diffInHours < 24) {
    return `${diffInHours} ${getDurationUnit(diffInHours, 'hours')} ago`
  } else {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
  }
}

export const getWordCount = (text: string): number => text.trim().split(/\s+/).length

export const getWordCountFormatted = (text: string): string => getWordCount(text).toLocaleString()
