'use client'
import React from 'react'
import { useAudioPermission } from '@/hooks/useAudioPermission'
import AnimatedVoiceSquare from './AnimatedVoiceSquare'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import Highlight from '@highlight-ai/app-runtime'

export default function ConversationSimple() {
  const { isAudioPermissionEnabled, toggleAudioPermission } = useAudioPermission()

  const handleToggle = () => {
    toggleAudioPermission(!isAudioPermissionEnabled)
  }

  const handleOpenClick = async () => {
    try {
      await Highlight.app.openApp('conversations')
    } catch (error) {
      console.error('Failed to open conversations app:', error)
      // You can add additional error handling here, such as showing a user-friendly error message
    }
  }

  return (
    <div
      className={`mx-auto flex h-16 w-full items-center justify-between rounded-[20px] px-4 py-2 transition-all duration-300 ease-in-out ${
        isAudioPermissionEnabled
          ? 'border border-conv-green bg-conv-green-20'
          : 'border border-conv-primary bg-conv-primary'
      }`}
    >
      <div className="flex items-center gap-2">
        {isAudioPermissionEnabled ? (
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
        <p className="text-sm font-medium">
          {isAudioPermissionEnabled ? 'View Conversations' : 'Enable Conversations'}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div
          className={`transition-opacity duration-300 ease-in-out ${isAudioPermissionEnabled ? 'opacity-100' : 'invisible opacity-0'}`}
        >
          <Button
            onClick={handleOpenClick}
            className="h-7 w-24 border border-conv-green-40 bg-transparent px-3 py-0 text-xs text-conv-green hover:bg-conv-green-30"
          >
            Open
          </Button>
        </div>
        <div className="flex items-center">
          <Label htmlFor="audio-switch" className="mr-2 w-7 text-right text-xs">
            {isAudioPermissionEnabled ? 'ON' : 'OFF'}
          </Label>
          <Switch
            id="audio-switch"
            checked={isAudioPermissionEnabled}
            onCheckedChange={handleToggle}
            className="h-5 w-9 data-[state=checked]:bg-conv-green"
          />
        </div>
      </div>
    </div>
  )
}
