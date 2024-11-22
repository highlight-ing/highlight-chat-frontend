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
