import { ConversationData } from '@highlight-ai/app-runtime'
import { getTimeAgo, getWordCountFormatted } from './string'

export const isDefaultTitle = (conversation?: ConversationData): boolean => {
  if (!conversation || typeof conversation.title !== 'string') {
    return false
  }
  return conversation.title.startsWith('Conversation ended at')
}

export const getConversationDisplayTitle = (conversation?: ConversationData): string => {
  if (!conversation) {
    return ''
  }
  if (typeof conversation.title !== 'string' || isDefaultTitle(conversation) || conversation.title === '') {
    return conversation.timestamp instanceof Date ? getTimeAgo(conversation.timestamp) : ''
  }
  return conversation.title
}

export const getConversationSubtitle = (conversation?: ConversationData): string => {
  if (!conversation) {
    return ''
  }
  const wordCount = typeof conversation.transcript === 'string' ? getWordCountFormatted(conversation.transcript) : '0'
  if (isDefaultTitle(conversation)) {
    return `${wordCount} Words`
  }
  const startedAt = conversation.startedAt instanceof Date ? getTimeAgo(conversation.startedAt) : ''
  return `Started ${startedAt} | ${wordCount} Words`
}
