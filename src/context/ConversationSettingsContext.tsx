import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  saveBooleanInAppStorage,
  saveNumberInAppStorage,
  getBooleanFromAppStorage,
  getNumberFromAppStorage,
  AUDIO_ENABLED_KEY,
  AUTO_CLEAR_VALUE_KEY,
  AUTO_SAVE_SEC_KEY,
} from '@/utils/highlightService'

export const MIN_CHARACTER_COUNT = 1
export const AUTO_SAVE_SEC = 10
export const AUTO_CLEAR_DAYS = 7

interface ConversationsSettingsContextType {
  isAudioOn: boolean
  setIsAudioOn: (isOn: boolean) => Promise<void>
  autoClearValue: number
  setAutoClearValue: (value: number) => Promise<void>
  autoSaveValue: number
  setAutoSaveValue: (value: number) => Promise<void>
}

const ConversationsSettingsContext = createContext<ConversationsSettingsContextType | undefined>(undefined)

export const ConversationsSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAudioOn, setIsAudioOn] = useState(true)
  const [autoClearValue, setAutoClearValue] = useState(AUTO_CLEAR_DAYS)
  const [autoSaveValue, setAutoSaveValue] = useState(AUTO_SAVE_SEC)

  useEffect(() => {
    const loadSettings = async () => {
      const audioEnabled = await getBooleanFromAppStorage(AUDIO_ENABLED_KEY, true)
      const storedAutoClearValue = await getNumberFromAppStorage(AUTO_CLEAR_VALUE_KEY, AUTO_CLEAR_DAYS)
      const storedAutoSaveValue = await getNumberFromAppStorage(AUTO_SAVE_SEC_KEY, AUTO_SAVE_SEC)

      setIsAudioOn(audioEnabled)
      setAutoClearValue(storedAutoClearValue)
      setAutoSaveValue(storedAutoSaveValue)
    }

    loadSettings()
  }, [])

  const setIsAudioOnAndSave = async (isOn: boolean) => {
    setIsAudioOn(isOn)
    await saveBooleanInAppStorage(AUDIO_ENABLED_KEY, isOn)
  }

  const setAutoClearValueAndSave = async (value: number) => {
    setAutoClearValue(value)
    await saveNumberInAppStorage(AUTO_CLEAR_VALUE_KEY, value)
  }

  const setAutoSaveValueAndSave = async (value: number) => {
    setAutoSaveValue(value)
    await saveNumberInAppStorage(AUTO_SAVE_SEC_KEY, value)
  }

  return (
    <ConversationsSettingsContext.Provider
      value={{
        isAudioOn,
        setIsAudioOn: setIsAudioOnAndSave,
        autoClearValue,
        setAutoClearValue: setAutoClearValueAndSave,
        autoSaveValue,
        setAutoSaveValue: setAutoSaveValueAndSave,
      }}
    >
      {children}
    </ConversationsSettingsContext.Provider>
  )
}

export const useConversationsSettings = () => {
  const context = useContext(ConversationsSettingsContext)
  if (context === undefined) {
    throw new Error('useConversationsSettings must be used within an ConversationsSettingsProvider')
  }
  return context
}
