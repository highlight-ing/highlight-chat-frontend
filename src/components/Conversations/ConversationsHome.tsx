import React from 'react'
import { useConversations } from '@/hooks/useConversations'
import { ConversationData } from '@/types/conversations'
import { VoiceSquare } from 'iconsax-react'
import AnimatedVoiceSquare from './AnimatedVoiceSquare'

const ConversationsHome: React.FC = () => {
  const conversations = useConversations()

  return (
    <div className="mx-auto w-full rounded-[20px] border border-conv-primary bg-conv-primary p-6">
      <div className="flex flex-col items-center justify-center space-y-4">
        <AnimatedVoiceSquare width={32} height={32} backgroundColor="#4CED9F" lineColor="rgba(15, 15, 15, 0.8)" />
        <p className="text-center text-[13px] text-subtle">Your most recent conversation will show here</p>
        <button className="rounded-[10px] bg-conv-secondary px-4 py-2 text-secondary">Setup Conversations</button>
      </div>
    </div>
  )
}

export default ConversationsHome
