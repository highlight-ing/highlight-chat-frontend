import { useGetAllConversations } from './hooks'

export function ConversationsFeed() {
  const { data: conversations } = useGetAllConversations()

  return <div>{conversations?.map((conversation) => <div>{conversation.title}</div>)}</div>
}
