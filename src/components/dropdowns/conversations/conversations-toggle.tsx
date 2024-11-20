'use client'

import React from 'react'
import { useConversations } from '@/context/ConversationContext'

import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

export default function ConversationToggle() {
  const { isAudioTranscripEnabled, setIsAudioTranscriptEnabled } = useConversations()

  const handleToggle = () => {
    setIsAudioTranscriptEnabled(!isAudioTranscripEnabled)
  }

  return (
<div className="flex items-center justify-between">
  <p className="text-base font-medium text-tertiary">Audio Notes</p>
  <div className="relative inline-flex items-center">
    <Switch
      id="audio-switch"
      checked={isAudioTranscripEnabled}
      onCheckedChange={handleToggle}
      className="h-[15px] w-[26px] data-[state=checked]:bg-conv-green"
    />
    <Label
      className="text-xs font-normal text-tertiary absolute left-[-20px] top-1/2 transform -translate-y-1/2"
    >
      {isAudioTranscripEnabled ? 'On' : 'Off'}
    </Label>
  </div>
</div>

  )
}
