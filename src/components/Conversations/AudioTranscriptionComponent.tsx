import React, { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import EnableConversationsButton from './EnableConversationsButton'
import AnimatedVoiceSquare from './AnimatedVoiceSquare'

type AudioState = 'active' | 'inactive' | 'off' | 'noPermissions'

const ACTIVE_LINE_COLOR = 'rgba(76, 237, 160, 1.0)'
const INACTIVE_LINE_COLOR = 'rgba(72, 72, 72, 1)'

export default function AudioTranscriptionComponent() {
  const [audioState, setAudioState] = useState<AudioState>('active')
  const [duration, setDuration] = useState('4min 30s')
  const [isOn, setIsOn] = useState(true)

  const handleToggle = () => {
    setIsOn(!isOn)
    setAudioState(isOn ? 'off' : 'inactive')
  }

  const cycleState = () => {
    const states: AudioState[] = ['active', 'inactive', 'off', 'noPermissions']
    const currentIndex = states.indexOf(audioState)
    const nextIndex = (currentIndex + 1) % states.length
    setAudioState(states[nextIndex])
    setIsOn(states[nextIndex] !== 'off')
  }

  const getContent = () => {
    switch (audioState) {
      case 'active':
        return (
          <>
            <AnimatedVoiceSquare width={32} height={32} backgroundColor="transparent" lineColor={ACTIVE_LINE_COLOR} />
            <p className="text-[16px] font-medium text-primary">Transcribing | {duration}</p>
          </>
        )
      case 'inactive':
        return (
          <>
            <AnimatedVoiceSquare
              width={32}
              height={32}
              backgroundColor="transparent"
              lineColor={INACTIVE_LINE_COLOR}
              shouldAnimate={false}
            />
            <p className="text-[16px] font-medium text-subtle">No active audio...</p>
          </>
        )
      case 'off':
        return (
          <>
            <AnimatedVoiceSquare
              width={32}
              height={32}
              backgroundColor="transparent"
              lineColor={INACTIVE_LINE_COLOR}
              shouldAnimate={false}
            />
            <p className="text-[16px] font-medium text-subtle">Turn on microphone to transcribe real time audio</p>
          </>
        )
      case 'noPermissions':
        return (
          <>
            <AnimatedVoiceSquare
              width={32}
              height={32}
              backgroundColor={ACTIVE_LINE_COLOR}
              lineColor="transparent"
              shouldAnimate={false}
            />
            <p className="text-[16px] font-medium text-subtle">Magically capture and transcribe audio with Highlight</p>
          </>
        )
    }
  }

  const containerClasses = `
    mx-auto flex w-full items-center justify-between rounded-[20px] p-6
    ${
      audioState === 'active'
        ? 'border border-conv-green bg-conv-green-20'
        : 'border border-conv-primary bg-conv-primary'
    }
    transition-colors duration-300
  `

  return (
    <div className={containerClasses}>
      <div className="flex items-center gap-3">{getContent()}</div>
      {audioState !== 'noPermissions' ? (
        <Switch checked={isOn} onCheckedChange={handleToggle} className="data-[state=checked]:bg-conv-green" />
      ) : (
        <EnableConversationsButton onClick={() => setAudioState('inactive')} />
      )}
    </div>
  )
}
