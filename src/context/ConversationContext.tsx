import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import Highlight from '@highlight-ai/app-runtime'
import { useQueryClient } from '@tanstack/react-query'

import { ConversationData } from '@/types/conversations'

const POLL_MIC_ACTIVITY = 300

interface ConversationContextType {
  conversations: ConversationData[]
  currentConversation: string
  elapsedTime: number
  autoSaveTime: number
  autoClearDays: number
  micActivity: number
  saveCurrentConversation: () => Promise<void>
  addConversation: (conversation: ConversationData) => Promise<void>
  updateConversation: (conversation: ConversationData) => Promise<void>
  deleteConversation: (id: string) => Promise<void>
  deleteAllConversations: () => Promise<void>
  setAutoSaveTime: (time: number) => Promise<void>
  setAutoClearDays: (days: number) => Promise<void>
  isAudioTranscripEnabled: boolean
  setIsAudioTranscriptEnabled: (enabled: boolean) => void
  isSaving: boolean
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined)

export const ConversationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<ConversationData[]>([])
  const [currentConversation, setCurrentConversation] = useState<string>('')
  const [elapsedTime, setElapsedTime] = useState<number>(0)
  const [autoSaveTime, setAutoSaveTime] = useState<number>(0)
  const [autoClearDays, setAutoClearDays] = useState<number>(0)
  const [micActivity, setMicActivity] = useState(0)
  const [isAudioTranscripEnabled, setIsAudioTranscripEnabled] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const queryClient = useQueryClient()

  const fetchLatestData = useCallback(async () => {
    const allConversations = await Highlight.conversations.getAllConversations()
    setConversations(allConversations)
    const currentConv = await Highlight.conversations.getCurrentConversation()
    setCurrentConversation(currentConv)
    const elapsedTime = await Highlight.conversations.getElapsedTime()
    setElapsedTime(elapsedTime)
  }, [])

  const setupListeners = useCallback(() => {
    const removeCurrentConversationListener = Highlight.app.addListener(
      'onCurrentConversationUpdate',
      (conversation: string) => {
        if (isAudioTranscripEnabled) {
          setCurrentConversation(conversation)
        }
      },
    )

    const removeConversationsUpdatedListener = Highlight.app.addListener(
      'onConversationsUpdated',
      (updatedConversations: ConversationData[]) => {
        setConversations(updatedConversations)
        queryClient.setQueryData(['audio-notes'], () => updatedConversations)
      },
    )

    const removeElapsedTimeUpdatedListener = Highlight.app.addListener(
      'onConversationsElapsedTimeUpdated',
      (time: number) => {
        if (isAudioTranscripEnabled) {
          setElapsedTime(time)
        }
      },
    )

    const removeAutoSaveUpdatedListener = Highlight.app.addListener(
      'onConversationsAutoSaveUpdated',
      (time: number) => {
        setAutoSaveTime(time)
      },
    )

    const removeAutoClearUpdatedListener = Highlight.app.addListener(
      'onConversationsAutoClearUpdated',
      (days: number) => {
        setAutoClearDays(days)
      },
    )

    const removeSaveConversationListener = Highlight.app.addListener('onConversationSaved', async () => {
      fetchLatestData()
      queryClient.invalidateQueries({ queryKey: ['audio-notes'] })
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
  }, [isAudioTranscripEnabled, queryClient, fetchLatestData])

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

  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchLatestData()
      const autoSaveTime = await Highlight.conversations.getAutoSaveTime()
      setAutoSaveTime(autoSaveTime)
      const autoClearDays = await Highlight.conversations.getAutoClearDays()
      setAutoClearDays(autoClearDays)
    }
    fetchInitialData()
  }, [fetchLatestData])

  const pollMicActivity = useCallback(async () => {
    const activity = await Highlight.user.getMicActivity(POLL_MIC_ACTIVITY)
    setMicActivity(activity)
  }, [])

  useEffect(() => {
    const intervalId = setInterval(pollMicActivity, POLL_MIC_ACTIVITY)
    return () => clearInterval(intervalId)
  }, [pollMicActivity])

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
    saveCurrentConversation: Highlight.conversations.saveCurrentConversation,
    addConversation: Highlight.conversations.addConversation,
    updateConversation: Highlight.conversations.updateConversation,
    deleteConversation: Highlight.conversations.deleteConversation,
    deleteAllConversations: Highlight.conversations.deleteAllConversations,
    setAutoSaveTime: Highlight.conversations.setAutoSaveTime,
    setAutoClearDays: Highlight.conversations.setAutoClearDays,
    isAudioTranscripEnabled,
    setIsAudioTranscriptEnabled: toggleAudioEnabled,
    isSaving,
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
