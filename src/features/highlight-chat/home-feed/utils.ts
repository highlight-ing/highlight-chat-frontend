import { ChatHistoryItem } from '@/types'

import { ConversationData } from '@/types/conversations'

export function isConversationData(action: unknown): action is ConversationData {
  return typeof action === 'object' && action !== null && 'endedAt' in action
}

export function isChatHistoryItem(action: unknown): action is ChatHistoryItem {
  return typeof action === 'object' && action !== null && 'updated_at' in action
}
