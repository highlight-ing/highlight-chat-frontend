import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Switch } from '@/components/ui/switch'
import EnableConversationsButton from './EnableConversationsButton'
import AnimatedVoiceSquare from './AnimatedVoiceSquare'
import { useConversations } from '@/context/ConversationContext'
import { useDebouncedCallback } from 'use-debounce'

type AudioState = 'active' | 'inactive' | 'off' | 'noPermissions' | 'saving'

const ACTIVE_LINE_COLOR = 'rgba(76, 237, 160, 1.0)'
const INACTIVE_LINE_COLOR = 'rgba(72, 72, 72, 1)'

export default function AudioTranscriptionComponent() {
  const [audioState, setAudioState] = useState<AudioState>('active')
  const [isOn, setIsOn] = useState(true)
  const { micActivity, elapsedTime, currentConversation, isSaving } = useConversations()

  const [isActive, setIsActive] = useState(false)

  const slowDebounce = useDebouncedCallback(
    (newState: AudioState) => {
      setAudioState(newState)
    },
    2500, // 2.5 seconds debounce for going to inactive
  )

  const fastDebounce = useDebouncedCallback(
    (newState: AudioState) => {
      setAudioState(newState)
    },
    100, // 100ms debounce for going to active
  )

  const updateAudioState = useCallback(() => {
    if (!isOn) {
      setAudioState('off')
      setIsActive(false)
      return
    }

    if (isSaving) {
      setAudioState('saving')
      return
    }

    if (micActivity > 0) {
      fastDebounce('active')
      setIsActive(true)
      slowDebounce.cancel() // Cancel any pending slow debounce
    } else {
      slowDebounce('inactive')
      setIsActive(false)
    }
  }, [isOn, micActivity, isSaving, fastDebounce, slowDebounce])

  useEffect(() => {
    updateAudioState()
  }, [updateAudioState])

  const handleToggle = () => {
    const newIsOn = !isOn
    setIsOn(newIsOn)
    setAudioState(newIsOn ? (micActivity > 0 ? 'active' : 'inactive') : 'off')
  }

  const formatElapsedTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}s`
    }
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}min ${remainingSeconds}s`
  }

  const currentConversationPreview = useMemo(() => {
    if (!currentConversation) return 'Waiting for transcript...'

    // Remove timestamp and diarization
    const parts = currentConversation.split(':')
    const content = parts.slice(3).join(':').trim()

    // Take first 100 characters
    const preview = content.length > 100 ? content.slice(0, 100) + '...' : content

    return preview
  }, [currentConversation])

  const getContent = () => {
    const formattedTime = formatElapsedTime(elapsedTime)

    return (
      <>
        <div
          className={`absolute left-[44px] transition-opacity duration-300 ease-in-out ${audioState === 'active' || audioState === 'saving' ? 'opacity-100' : 'opacity-0'}`}
        >
          <div className="flex items-center">
            <p className="w-[190px] overflow-hidden text-[16px] font-medium">
              <span
                className="inline-block transition-all duration-300 ease-in-out"
                style={{
                  transform: audioState === 'saving' ? 'translateY(-100%)' : 'translateY(0)',
                  opacity: audioState === 'saving' ? 0 : 1,
                }}
              >
                Transcribing | {formattedTime}
              </span>
              <span
                className="absolute left-0 top-0 inline-block transition-all duration-300 ease-in-out"
                style={{
                  transform: audioState === 'saving' ? 'translateY(0)' : 'translateY(100%)',
                  opacity: audioState === 'saving' ? 1 : 0,
                }}
              >
                Saving Transcript
              </span>
            </p>
            {audioState !== 'saving' && (
              <p className="w-[400px] truncate text-[14px] text-conv-current-preview transition-opacity duration-300 ease-in-out">
                {currentConversationPreview}
              </p>
            )}
          </div>
        </div>
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
      isActive || (audioState === 'saving' && isActive)
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
          lineColor={isActive || (audioState === 'saving' && isActive) ? ACTIVE_LINE_COLOR : INACTIVE_LINE_COLOR}
          shouldAnimate={isActive || (audioState === 'saving' && isActive)}
          transitionDuration={2500}
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
