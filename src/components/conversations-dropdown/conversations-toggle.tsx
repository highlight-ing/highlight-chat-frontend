'use client'
import React from 'react'
import { Switch } from '@/components/ui/switch'
import { useConversations } from '@/context/ConversationContext'
import { Label } from '../ui/label'

export default function ConversationToggle() {
  const { isAudioTranscripEnabled, setIsAudioTranscriptEnabled } = useConversations()

  const handleToggle = () => {
    setIsAudioTranscriptEnabled(!isAudioTranscripEnabled)
  }

  return (
    <div className="flex justify-between">
      <p className="text-base font-medium text-tertiary">Audio Notes</p>
      <div className="flex items-center gap-1">
        <Label className="text-xs font-normal text-tertiary">{isAudioTranscripEnabled ? 'On' : 'Off'}</Label>
        <Switch
          id="audio-switch"
          checked={isAudioTranscripEnabled}
          onCheckedChange={handleToggle}
          className="h-[15px] w-[26px] data-[state=checked]:bg-conv-green"
        />
      </div>
    </div>
  )
}
