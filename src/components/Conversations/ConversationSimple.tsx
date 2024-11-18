'use client'

import React from 'react'
import { useConversations } from '@/context/ConversationContext'
import Highlight from '@highlight-ai/app-runtime'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

import AnimatedVoiceSquare from './AnimatedVoiceSquare'

export default function ConversationSimple() {
  const { isAudioTranscripEnabled, setIsAudioTranscriptEnabled } = useConversations()

  const handleToggle = () => {
    setIsAudioTranscriptEnabled(!isAudioTranscripEnabled)
  }

  const handleOpenClick = async () => {
    try {
      await Highlight.app.openApp('conversations')
    } catch (error) {
      console.error('Failed to open conversations app:', error)
      window.location.href = 'highlight://app/conversations'
    }
  }

  return (
    <div
      className={`mx-auto flex h-16 w-full items-center justify-between rounded-[20px] px-5 py-2 duration-300 ease-in-out ${
        isAudioTranscripEnabled ? 'border-0 bg-conv-green-20' : 'border border-conv-primary bg-conv-primary'
      }`}
      style={{ transition: 'background-color 300ms ease-in-out' }}
    >
      <div className="flex items-center gap-2">
        {isAudioTranscripEnabled ? (
          <AnimatedVoiceSquare
            width={24}
            height={24}
            backgroundColor="transparent"
            lineColor="rgba(76, 237, 160, 1.0)"
            shouldAnimate={true}
            transitionDuration={2500}
          />
        ) : (
          <AnimatedVoiceSquare
            width={24}
            height={24}
            backgroundColor="transparent"
            lineColor="rgba(76, 237, 160, 1.0)"
            shouldAnimate={false}
            transitionDuration={0}
          />
        )}
        <p className="text-base font-medium">
          {isAudioTranscripEnabled ? 'View Conversations' : 'Enable Conversations'}
        </p>
      </div>
      <div className="flex items-center gap-6">
        <div
          className={`transition-opacity duration-300 ease-in-out ${isAudioTranscripEnabled ? 'opacity-100' : 'invisible opacity-0'}`}
        >
          <Button
            onClick={handleOpenClick}
            className="h-7 w-[77px] border border-conv-green-40 bg-transparent px-3 py-0 text-xs text-conv-green hover:bg-conv-green-20"
          >
            Open
          </Button>
        </div>
        <div className="flex items-center">
          <Label htmlFor="audio-switch" className="mr-1.5 text-right text-xs font-normal text-light-40">
            {isAudioTranscripEnabled ? 'ON' : 'OFF'}
          </Label>
          <Switch
            id="audio-switch"
            checked={isAudioTranscripEnabled}
            onCheckedChange={handleToggle}
            className="h-[26px] w-[49px] data-[state=checked]:bg-conv-green"
          />
        </div>
      </div>
    </div>
  )
}
