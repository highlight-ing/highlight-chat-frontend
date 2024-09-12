import React from 'react'
import { useConversations, ConversationData } from '@/hooks/useConversations'
import { VoiceSquare } from 'iconsax-react'

const ConversationsHome: React.FC = () => {
  const conversations = useConversations()

  return (
    <div className="mx-auto w-full rounded-[20px] border border-conv-primary bg-conv-primary p-6">
      <div className="flex flex-col items-center justify-center space-y-4">
        <VoiceSquare variant="Bold" size={24} className="text-conv-green" />
        <p className="text-center text-[13px] text-subtle">Your most recent conversation will show here</p>
        <button className="rounded-[10px] bg-conv-secondary px-4 py-2 text-secondary">Setup Conversations</button>
      </div>
    </div>
  )
}

export default ConversationsHome
