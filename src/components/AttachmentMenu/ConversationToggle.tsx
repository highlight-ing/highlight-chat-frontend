'use client'
import React from 'react'
import { Switch } from '@/components/ui/switch'
import { useConversations } from '@/context/ConversationContext'
import styles from './attachment-menus.module.scss'

export default function ConversationToggle() {
  const { isAudioTranscripEnabled, setIsAudioTranscriptEnabled } = useConversations()

  const handleToggle = () => {
    setIsAudioTranscriptEnabled(!isAudioTranscripEnabled)
  }

  return (
    <div className={`${styles.menuItem} gap-2`}>
      <Switch
        id="audio-switch"
        checked={isAudioTranscripEnabled}
        onCheckedChange={handleToggle}
        className="h-[24px] w-[45px] data-[state=checked]:bg-conv-green"
      />
      <p>{isAudioTranscripEnabled ? 'Disable Conversations' : 'Enable Conversations'}</p>
    </div>
  )
}
