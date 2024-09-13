import { v4 as uuidv4 } from 'uuid'
export interface ConversationData {
  id: string // UUID
  title: string
  summary: string
  timestamp: Date
  topic: string
  transcript: string
  summarized: boolean
  shareLink: string
  userId: string
}

export type FormatType = 'CardTranscript' | 'DialogueTranscript'

export const createConversation = (transcript: string): ConversationData => {
  let uuid = uuidv4()
  return {
    id: uuid,
    title: '',
    summary: '',
    topic: '',
    transcript: transcript,
    timestamp: new Date(),
    summarized: false,
    shareLink: '',
    userId: '',
  }
}

const cleanTranscript = (text: string): string => {
  const lines = text.split('\n')
  return lines
    .filter((line) => {
      const match = line.match(/^(\d{2}:\d{2}:\d{2} [AP]M) - ([^:]+): (.*)$/)
      if (!match) return true // Keep lines that don't match the expected format

      const [, , , content] = match
      const trimmedContent = content.trim()

      // Remove lines with only empty brackets (including multiple brackets and whitespace)
      if (/^(\[[\s]*\][\s]*)+$/.test(trimmedContent)) return false

      // Remove lines with single-word responses
      if (trimmedContent.split(/\s+/).length === 1) return false

      return true
    })
    .join('\n')
}

const removeDuplicateLines = (text: string): string => {
  const lines = text.split('\n')
  const seenLines = new Map<string, Set<string>>()

  return lines
    .filter((line) => {
      const match = line.match(/^(\d{2}:\d{2}:\d{2} [AP]M) - ([^:]+): (.*)$/)
      if (!match) return true // Keep lines that don't match the expected format

      const [, timestamp, speaker, content] = match
      const key = `${timestamp}-${speaker}`

      if (!seenLines.has(key)) {
        seenLines.set(key, new Set())
      }

      const contentSet = seenLines.get(key)!
      if (contentSet.has(content)) {
        return false // Duplicate found, remove this line
      } else {
        contentSet.add(content)
        return true // New content for this timestamp-speaker combination, keep the line
      }
    })
    .join('\n')
}

const removeThankYouLines = (text: string): string => {
  const lines = text.split('\n')
  return lines
    .filter((line) => {
      const match = line.match(/^(\d{2}:\d{2}:\d{2} [AP]M) - ([^:]+): (.*)$/)
      if (!match) return true // Keep lines that don't match the expected format

      const [, , , content] = match
      const trimmedContent = content.trim().toLowerCase()

      // Remove lines with only "Thank you" or "Thank you." (case-insensitive)
      if (trimmedContent === 'thank you' || trimmedContent === 'thank you.') return false

      return true
    })
    .join('\n')
}

export const formatTranscript = (transcript: string, formatType: FormatType): string => {
  // Step 1: Remove extra newlines and spaces
  let formattedTranscript = transcript.replace(/\s+/g, ' ').trim()

  // Step 2: Add newlines after each timestamp
  const regex = /(\d{2}:\d{2}:\d{2} [AP]M - [^:]+:)/g
  formattedTranscript = formattedTranscript.replace(regex, '\n$1')

  // Step 3: Remove leading newline if present
  formattedTranscript = formattedTranscript.replace(/^\n/, '')

  // Step 4: Clean the transcript (remove single-word responses and empty brackets)
  formattedTranscript = cleanTranscript(formattedTranscript)

  // Step 5: Remove duplicate lines
  formattedTranscript = removeDuplicateLines(formattedTranscript)

  // Step 6: Remove "Thank you" lines
  formattedTranscript = removeThankYouLines(formattedTranscript)

  // Step 7: Apply format-specific adjustments
  switch (formatType) {
    case 'CardTranscript':
    case 'DialogueTranscript':
      // Keep single newlines
      return formattedTranscript
    default:
      // Add an extra newline for paragraph-style formatting
      return formattedTranscript.replace(/\n/g, '\n\n')
  }
}
