import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import Highlight, { ConversationData } from '@highlight-ai/app-runtime'
import { useAudioPermission } from '@/hooks/useAudioPermission'

const POLL_MIC_ACTIVITY = 300
const AUDIO_ENABLED_KEY = 'audioEnabled'

interface ConversationContextType {
  conversations: ConversationData[]
  currentConversation: string
  elapsedTime: number
  autoSaveTime: number
  autoClearDays: number
  micActivity: number
  isAudioOn: boolean
  saveCurrentConversation: () => Promise<void>
  addConversation: (conversation: ConversationData) => Promise<void>
  updateConversation: (conversation: ConversationData) => Promise<void>
  deleteConversation: (id: string) => Promise<void>
  deleteAllConversations: () => Promise<void>
  setAutoSaveTime: (time: number) => Promise<void>
  setAutoClearDays: (days: number) => Promise<void>
  setIsAudioOn: (isOn: boolean) => Promise<void>
  isAudioTranscripEnabled: boolean
  setIsAudioTranscriptEnabled: (enabled: boolean) => void
  isSaving: boolean
  getWordCount: (transcript: string) => number
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined)

export const ConversationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<ConversationData[]>([])
  const [currentConversation, setCurrentConversation] = useState<string>('')
  const [elapsedTime, setElapsedTime] = useState<number>(0)
  const [autoSaveTime, setAutoSaveTime] = useState<number>(0)
  const [autoClearDays, setAutoClearDays] = useState<number>(0)
  const [micActivity, setMicActivity] = useState(0)
  const [isAudioOn, setIsAudioOn] = useState(true)
  const [isAudioTranscripEnabled, setIsAudioTranscripEnabled] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const setupListeners = useCallback(() => {
    const removeCurrentConversationListener = Highlight.app.addListener(
      'onCurrentConversationUpdate',
      (conversation: string) => {
        if (isAudioOn) {
          console.log('New current conversation:', conversation)
          setCurrentConversation(conversation)
        }
      },
    )

    const removeConversationsUpdatedListener = Highlight.app.addListener(
      'onConversationsUpdated',
      (updatedConversations: ConversationData[]) => {
        if (isAudioOn) {
          console.log('Updated conversations:', updatedConversations)
          setConversations(updatedConversations)
        }
      },
    )

    const removeElapsedTimeUpdatedListener = Highlight.app.addListener(
      'onConversationsElapsedTimeUpdated',
      (time: number) => {
        if (isAudioOn) {
          setElapsedTime(time)
        }
      },
    )

    const removeAutoSaveUpdatedListener = Highlight.app.addListener(
      'onConversationsAutoSaveUpdated',
      (time: number) => {
        console.log('Updated auto-save time:', time)
        setAutoSaveTime(time)
      },
    )

    const removeAutoClearUpdatedListener = Highlight.app.addListener(
      'onConversationsAutoClearUpdated',
      (days: number) => {
        console.log('Updated auto-clear days:', days)
        setAutoClearDays(days)
      },
    )

    const removeSaveConversationListener = Highlight.app.addListener('onConversationSaved', () => {
      console.log('Saving current conversation')
    })

    const removeConversationSavedListener = Highlight.app.addListener('onConversationSaved', () => {
      setIsSaving(true)
      setTimeout(() => {
        setIsSaving(false)
        setCurrentConversation('')
        setElapsedTime(0)
      }, 1000)
    })

    // @ts-ignore
    globalThis.highlight?.internal?.requestAudioPermissionEvents()
    const removeAudioPermissionListener = Highlight.app.addListener(
      'onAudioPermissionUpdate',
      (permission: 'locked' | 'detect' | 'attach') => {
        console.log('Audio permission updated')
        if (permission === 'locked') {
          setIsAudioTranscripEnabled(false)
        } else {
          setIsAudioTranscripEnabled(true)
        }
      },
    )

    return () => {
      removeCurrentConversationListener()
      removeConversationsUpdatedListener()
      removeElapsedTimeUpdatedListener()
      removeAutoSaveUpdatedListener()
      removeAutoClearUpdatedListener()
      removeSaveConversationListener()
      removeConversationSavedListener()
      removeAudioPermissionListener()
    }
  }, [isAudioOn])

  useEffect(() => {
    const removeListeners = setupListeners()
    return () => removeListeners()
  }, [setupListeners])

  useEffect(() => {
    const getInitialAudioTranscriptEnabled = async () => {
      // @ts-ignore
      const enabled = await globalThis.highlight?.internal?.isAudioTranscriptEnabled()
      setIsAudioTranscripEnabled(enabled)
    }

    getInitialAudioTranscriptEnabled()
  }, [])

  const fetchLatestData = useCallback(async () => {
    const allConversations = await Highlight.conversations.getAllConversations()
    setConversations(allConversations)
    const currentConv = await Highlight.conversations.getCurrentConversation()
    setCurrentConversation(currentConv)
    const elapsedTime = await Highlight.conversations.getElapsedTime()
    setElapsedTime(elapsedTime)
  }, [])

  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchLatestData()
      const autoSaveTime = await Highlight.conversations.getAutoSaveTime()
      setAutoSaveTime(autoSaveTime)
      const autoClearDays = await Highlight.conversations.getAutoClearDays()
      setAutoClearDays(autoClearDays)

      // Load isAudioOn from appStorage, but only if not locked
      const storedIsAudioOn = await Highlight.appStorage.get(AUDIO_ENABLED_KEY)
      setIsAudioOn(storedIsAudioOn)
    }
    fetchInitialData()
  }, [fetchLatestData])

  const pollMicActivity = useCallback(async () => {
    const activity = await Highlight.user.getMicActivity(POLL_MIC_ACTIVITY)
    setMicActivity(activity)
  }, [isAudioOn])

  useEffect(() => {
    const intervalId = setInterval(pollMicActivity, POLL_MIC_ACTIVITY)
    return () => clearInterval(intervalId)
  }, [pollMicActivity])

  const setIsAudioOnAndSave = useCallback(
    async (isOn: boolean) => {
      await setIsAudioTranscripEnabled(isOn)
      setIsAudioOn(isOn)
      await Highlight.appStorage.set(AUDIO_ENABLED_KEY, isOn)

      if (isOn) {
        await fetchLatestData()
      } else {
        setCurrentConversation('')
        setElapsedTime(0)
      }
    },
    [fetchLatestData, setIsAudioTranscripEnabled],
  )

  const getWordCount = useCallback((transcript: string): number => {
    return transcript.trim().split(/\s+/).length
  }, [])

  const toggleAudioEnabled = (isEnabled: boolean) => {
    // @ts-ignore
    globalThis.highlight?.internal?.setAudioTranscriptEnabled(isEnabled)
  }

  const contextValue: ConversationContextType = {
    conversations,
    currentConversation,
    elapsedTime,
    autoSaveTime,
    autoClearDays,
    micActivity,
    isAudioOn,
    saveCurrentConversation: Highlight.conversations.saveCurrentConversation,
    addConversation: Highlight.conversations.addConversation,
    updateConversation: Highlight.conversations.updateConversation,
    deleteConversation: Highlight.conversations.deleteConversation,
    deleteAllConversations: Highlight.conversations.deleteAllConversations,
    setAutoSaveTime: Highlight.conversations.setAutoSaveTime,
    setAutoClearDays: Highlight.conversations.setAutoClearDays,
    setIsAudioOn: setIsAudioOnAndSave,
    isAudioTranscripEnabled,
    setIsAudioTranscriptEnabled: toggleAudioEnabled,
    isSaving,
    getWordCount,
  }

  return <ConversationContext.Provider value={contextValue}>{children}</ConversationContext.Provider>
}

export const useConversations = () => {
  const context = useContext(ConversationContext)
  if (context === undefined) {
    throw new Error('useConversations must be used within a ConversationProvider')
  }
  return context
}
