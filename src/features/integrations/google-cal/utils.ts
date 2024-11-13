export function extractDateAndTime(isoString: string | undefined) {
  if (!isoString) return { date: new Date(), time: '00:00' }

  const dateObj = new Date(isoString)

  // Get date by setting time to midnight
  const date = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate())

  // Get time as string in HH:mm format
  const time = dateObj.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
  })

  return { date, time }
}
