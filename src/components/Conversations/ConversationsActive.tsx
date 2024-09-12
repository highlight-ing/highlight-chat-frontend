// provide skeleton react component "ConversationsActive"
import React from 'react'
import AnimatedVoiceSquare from './AnimatedVoiceSquare'
import { useConversations } from '@/hooks/useConversations'

const ConversationsActive: React.FC = () => {
  return (
    <div className="mx-auto flex w-full items-center justify-between rounded-[20px] border border-conv-green bg-conv-green-20 p-6">
      <div className="flex items-center gap-3">
        <AnimatedVoiceSquare width={32} height={32} backgroundColor="transparent" lineColor="rgba(76, 237, 160, 1.0)" />
        <p className="text-[16px] font-medium text-primary">Listening | 4min 30s</p>
      </div>
      <button className="h-[24px] w-[77px] rounded-[6px] bg-[#2D4A3C] text-[13px] font-medium text-secondary">
        View
      </button>
    </div>
  )
}

export default ConversationsActive
