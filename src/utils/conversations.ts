import { ConversationData } from '@highlight-ai/app-runtime'
import { getTimeAgo, getWordCountFormatted } from './string'

export const isDefaultTitle = (conversation: ConversationData): boolean =>
  conversation?.title.startsWith('Conversation ended at')

export const getConversationDisplayTitle = (conversation: ConversationData): string =>
  isDefaultTitle(conversation) || conversation?.title === '' ? getTimeAgo(conversation.timestamp) : conversation?.title

export const getConversationSubtitle = (conversation: ConversationData): string =>
  isDefaultTitle(conversation)
    ? `${getWordCountFormatted(conversation.transcript)} Words`
    : `Started ${getTimeAgo(conversation.startedAt)} | ${getWordCountFormatted(conversation.transcript)} Words`
