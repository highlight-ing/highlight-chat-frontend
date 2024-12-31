import { ChatHistoryItem } from '.'

export type HistoryResponseData = {
  conversations: Array<ChatHistoryItem>
}

export type HistoryByIdResponseData = {
  conversation: ChatHistoryItem
}
