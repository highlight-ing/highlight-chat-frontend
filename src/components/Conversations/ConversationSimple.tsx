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
      window.location.href = 'highlight://app/conversations'
    }
  }

  return (
    <div
      className={`mx-auto flex h-16 w-full items-center justify-between rounded-[20px] px-5 py-2 duration-300 ease-in-out ${
        isAudioPermissionEnabled ? 'border-0 bg-conv-green-20' : 'border border-conv-primary bg-conv-primary'
      }`}
      style={{ transition: 'background-color 300ms ease-in-out' }}
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
        <p className="text-base font-medium">
          {isAudioPermissionEnabled ? 'View Conversations' : 'Enable Conversations'}
        </p>
      </div>
      <div className="flex items-center gap-6">
        <div
          className={`transition-opacity duration-300 ease-in-out ${isAudioPermissionEnabled ? 'opacity-100' : 'invisible opacity-0'}`}
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
            {isAudioPermissionEnabled ? 'ON' : 'OFF'}
          </Label>
          <Switch
            id="audio-switch"
            checked={isAudioPermissionEnabled}
            onCheckedChange={handleToggle}
            className="h-[26px] w-[49px] data-[state=checked]:bg-conv-green"
          />
        </div>
      </div>
    </div>
  )
}
