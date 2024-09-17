import React, { useState, useEffect } from 'react'
import { Switch } from '@/components/ui/switch'
import EnableConversationsButton from './EnableConversationsButton'
import AnimatedVoiceSquare from './AnimatedVoiceSquare'
import { useConversations } from '@/context/ConversationContext'

type AudioState = 'active' | 'inactive' | 'off' | 'noPermissions'

const ACTIVE_LINE_COLOR = 'rgba(76, 237, 160, 1.0)'
const INACTIVE_LINE_COLOR = 'rgba(72, 72, 72, 1)'

export default function AudioTranscriptionComponent() {
  const [audioState, setAudioState] = useState<AudioState>('active')
  const [isOn, setIsOn] = useState(true)
  const { micActivity, elapsedTime } = useConversations()

  const handleToggle = () => {
    const newIsOn = !isOn
    setIsOn(newIsOn)
    setAudioState(newIsOn ? (micActivity > 0 ? 'active' : 'inactive') : 'off')
  }

  useEffect(() => {
    setAudioState(isOn ? (micActivity > 0 ? 'active' : 'inactive') : 'off')
  }, [micActivity, isOn])

  const formatElapsedTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}s`
    }
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}min ${remainingSeconds}s`
  }

  const getContent = () => {
    const formattedTime = formatElapsedTime(elapsedTime)
    return (
      <>
        <p
          className={`absolute left-[44px] text-[16px] font-medium transition-opacity duration-300 ease-in-out ${audioState === 'active' ? 'opacity-100' : 'opacity-0'}`}
        >
          Transcribing | {formattedTime}
        </p>
        <p
          className={`absolute left-[44px] text-[16px] font-medium text-subtle transition-opacity duration-300 ease-in-out ${audioState === 'inactive' ? 'opacity-100' : 'opacity-0'}`}
        >
          No active audio...
        </p>
        <p
          className={`absolute left-[44px] text-[16px] font-medium text-subtle transition-opacity duration-300 ease-in-out ${audioState === 'off' ? 'opacity-100' : 'opacity-0'}`}
        >
          Turn on microphone to transcribe real time audio
        </p>
        <p
          className={`absolute left-[44px] text-[16px] font-medium text-subtle transition-opacity duration-300 ease-in-out ${audioState === 'noPermissions' ? 'opacity-100' : 'opacity-0'}`}
        >
          Magically capture and transcribe audio with Highlight
        </p>
      </>
    )
  }

  const containerClasses = `
    mx-auto flex w-full items-center justify-between rounded-[20px] p-6
    transition-all duration-300 ease-in-out
    ${
      audioState === 'active'
        ? 'border border-conv-green bg-conv-green-20'
        : 'border border-conv-primary bg-conv-primary'
    }
  `

  return (
    <div className={containerClasses}>
      <div className="relative flex w-full items-center gap-3">
        <AnimatedVoiceSquare
          width={32}
          height={32}
          backgroundColor="transparent"
          lineColor={audioState === 'active' ? ACTIVE_LINE_COLOR : INACTIVE_LINE_COLOR}
          shouldAnimate={audioState === 'active'}
        />
        {getContent()}
      </div>
      {audioState !== 'noPermissions' ? (
        <Switch checked={isOn} onCheckedChange={handleToggle} className="data-[state=checked]:bg-conv-green" />
      ) : (
        <EnableConversationsButton onClick={() => setAudioState('inactive')} />
      )}
    </div>
  )
}
