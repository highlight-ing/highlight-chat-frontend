import { ConversationData } from '@highlight-ai/app-runtime'

import { getTimeAgo, getWordCountFormatted } from './string'

//Making sure that properties in conversation are not undefined
export const isDefaultTitle = (conversation?: ConversationData): boolean => {
  if (!conversation || typeof conversation.title !== 'string') {
    return false
  }
  return conversation.title.startsWith('Conversation ended at')
}

export const getConversationDisplayTitle = (conversation?: ConversationData): string => {
  let title = ''
  if (!conversation) {
    return 'Conversation'
  }

  // if (
  //   conversation.startedAt &&
  //   (typeof conversation.title !== 'string' || isDefaultTitle(conversation) || conversation.title === '')
  // ) {
  //   title = getTimeAgo(conversation.startedAt)
  // }

  if (title === '') {
    title = conversation.title
  }

  return title
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

export const getConversationWordCount = (conversation?: ConversationData): string => {
  if (!conversation) {
    return ''
  }
  const wordCount = typeof conversation.transcript === 'string' ? getWordCountFormatted(conversation.transcript) : '0'
  if (isDefaultTitle(conversation)) {
    return `${wordCount} Words`
  }
  return `${wordCount} Words`
}
