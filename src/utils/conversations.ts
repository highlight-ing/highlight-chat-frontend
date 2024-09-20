import { ConversationData } from '@highlight-ai/app-runtime'
import { getTimeAgo } from './string'

export const isDefaultTitle = (conversation: ConversationData): boolean =>
  conversation?.title.startsWith('Conversation ended at')

export const getConversationDisplayTitle = (conversation: ConversationData): string =>
  isDefaultTitle(conversation) || conversation?.title === '' ? getTimeAgo(conversation.timestamp) : conversation?.title
