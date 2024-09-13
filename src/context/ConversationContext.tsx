import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { ConversationData, createConversation } from '@/types/conversations'
import {
  saveConversationsInAppStorage,
  deleteAllConversationsInAppStorage,
  fetchMicActivity,
} from '@/utils/highlightService'
import { useConversationsSettings } from './ConversationSettingsContext'
import { useAudioPermission } from '@/hooks/useAudioPermission'
import Highlight from '@highlight-ai/app-runtime'

const POLL_MIC_ACITIVTY = 300

interface ConversationContextType {
  conversations: ConversationData[]
  currentConversation: string
  micActivity: number
  addConversation: (conversation: ConversationData) => void
  updateConversation: (updatedConversation: ConversationData) => void
  deleteConversation: (id: string) => void
  deleteAllConversations: () => Promise<void>
  handleSave: (didTapSaveButton?: boolean) => void
  filteredConversations: ConversationData[]
  searchQuery: string
  setSearchQuery: (query: string) => void
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined)

export const ConversationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<ConversationData[]>([])
  const [currentConversationParts, setCurrentConversationParts] = useState<string[]>([])
  const [micActivity, setMicActivity] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')

  const { autoSaveValue, isAudioOn } = useConversationsSettings()

  const autoSaveValueRef = useRef(autoSaveValue)
  const lastTranscriptTimeRef = useRef<number>(Date.now())
  const isAudioPermissionEnabled = useAudioPermission()

  useEffect(() => {
    autoSaveValueRef.current = autoSaveValue
    console.log(`Auto-save value updated to: ${autoSaveValue} seconds`)
  }, [autoSaveValue])

  const getCurrentConversationString = useCallback(
    (reversed: boolean = true) => {
      return reversed ? currentConversationParts.join(' ') : [...currentConversationParts].reverse().join(' ')
    },
    [currentConversationParts],
  )

  const addConversation = useCallback((newConversation: ConversationData) => {
    setConversations((prev) => {
      const updated = [newConversation, ...prev]
      saveConversationsInAppStorage(updated)
      return updated
    })
  }, [])

  const updateConversation = useCallback((updatedConversation: ConversationData) => {
    setConversations((prev) => {
      const updated = prev.map((conv) => (conv.id === updatedConversation.id ? updatedConversation : conv))
      saveConversationsInAppStorage(updated)
      return updated
    })
  }, [])

  const deleteConversation = useCallback((id: string) => {
    setConversations((prev) => {
      const updated = prev.filter((conv) => conv.id !== id)
      saveConversationsInAppStorage(updated)
      return updated
    })
  }, [])

  const deleteAllConversations = useCallback(async () => {
    await deleteAllConversationsInAppStorage()
    setConversations([])
  }, [])

  const saveCurrentConversation = useCallback(
    (forceSave: boolean = false) => {
      const conversationString = getCurrentConversationString(false)
      console.log('Current conversation string:', conversationString)
      if (forceSave || conversationString.trim().length >= 1) {
        const newConversation = createConversation(conversationString)
        addConversation(newConversation)
        console.log('Saving conversation:', newConversation)
        setCurrentConversationParts([])
        console.log('Cleared currentConversationParts')
      } else {
        console.log('No conversation to save')
      }
    },
    [getCurrentConversationString, addConversation],
  )

  const saveCurrentConversationRef = useRef(saveCurrentConversation)

  useEffect(() => {
    saveCurrentConversationRef.current = saveCurrentConversation
  }, [saveCurrentConversation])

  const handleSave = useCallback(
    (didTapSaveButton: boolean = false) => {
      setCurrentConversationParts(currentConversationParts)
      saveCurrentConversation(didTapSaveButton)
    },
    [saveCurrentConversation, currentConversationParts],
  )

  const pollMicActivity = useCallback(async () => {
    if (!isAudioOn || !isAudioPermissionEnabled) {
      setMicActivity(0)
      return
    }
    const activity = await fetchMicActivity(POLL_MIC_ACITIVTY)
    setMicActivity(activity)
  }, [isAudioOn, isAudioPermissionEnabled])

  useEffect(() => {
    const intervalId = setInterval(pollMicActivity, POLL_MIC_ACITIVTY)
    return () => clearInterval(intervalId)
  }, [pollMicActivity])

  useEffect(() => {
    const handleTranscript = (text: string) => {
      const currentTime = Date.now()
      const timeSinceLastTranscript = currentTime - lastTranscriptTimeRef.current

      console.log(`Time since last transcript: ${timeSinceLastTranscript / 1000} seconds`)
      console.log(`Auto-save threshold: ${autoSaveValueRef.current} seconds`)

      if (timeSinceLastTranscript >= autoSaveValueRef.current * 1000) {
        console.log('Auto-save triggered')
        saveCurrentConversationRef.current()
      } else {
        console.log('Auto-save not triggered')
      }

      const [timestampStr, ...contentParts] = text.split(' - ')
      const content = contentParts.join(' - ').trim()

      const transcriptTime = new Date(`${new Date().toDateString()} ${timestampStr}`)
      console.log(`Transcript timestamp: ${transcriptTime.toISOString()}`)

      setCurrentConversationParts((prevParts) => {
        if (content && (prevParts.length === 0 || content !== prevParts[0])) {
          console.log(`New content added: "${content.substring(0, 50)}..."`)
          console.log('Previous parts:', prevParts)
          const newParts = [content, ...prevParts.filter((part) => part !== content)]
          console.log('New parts:', newParts)
          return newParts
        }
        return prevParts
      })

      lastTranscriptTimeRef.current = transcriptTime.getTime()
      console.log(`Updated lastTranscriptTimeRef: ${new Date(lastTranscriptTimeRef.current).toISOString()}`)
    }

    // @ts-ignore
    const destroy = Highlight.app.addListener('onAsrTranscriptEvent', handleTranscript)

    return () => {
      destroy()
    }
  }, [])
  // TODO: - probably not going to do this in HL Chat
  //   useEffect(() => {
  //     const fetchInitialTranscript = async () => {
  //       try {
  //         const longTranscript = await fetchLongTranscript()
  //         if (longTranscript) {
  //           setCurrentConversationParts(prevParts => {
  //             const trimmedTranscript = longTranscript.trim()
  //             if (prevParts.length === 0 || trimmedTranscript !== prevParts[0]) {
  //               return [trimmedTranscript, ...prevParts.filter(part => part !== trimmedTranscript)]
  //             }
  //             return prevParts
  //           })
  //         }
  //       } catch (error) {
  //         console.error('Error fetching initial long transcript:', error)
  //       }
  //     }

  //     fetchInitialTranscript()
  //   }, [])

  const filteredConversations = conversations.filter((conversation) => {
    const matchTranscript = conversation.transcript.toLowerCase().includes(searchQuery.toLowerCase())
    const matchSummary = conversation.summary.toLowerCase().includes(searchQuery.toLowerCase())
    return matchTranscript || matchSummary
  })

  useEffect(() => {
    console.log('currentConversationParts updated:', currentConversationParts)
  }, [currentConversationParts])

  return (
    <ConversationContext.Provider
      value={{
        conversations,
        currentConversation: getCurrentConversationString(),
        micActivity,
        addConversation,
        updateConversation,
        deleteConversation,
        deleteAllConversations,
        handleSave,
        filteredConversations,
        searchQuery,
        setSearchQuery,
      }}
    >
      {children}
    </ConversationContext.Provider>
  )
}

export const useConversations = () => {
  const context = useContext(ConversationContext)
  if (context === undefined) {
    throw new Error('useConversations must be used within a ConversationProvider')
  }
  return context
}

// TODO: - probably not going to do this in HL Chat, hook for new highlight api get/listen for conversations
/*
import React, { useEffect, useState } from 'react'
import { ConversationData } from '@/types/conversations'
export const useConversations = () => {
  const [conversations, setConversations] = useState<ConversationData[]>([])

  useEffect(() => {
    const fetchConversations = async () => {
      if (typeof window !== 'undefined' && window.highlight?.internal?.getConversations) {
        try {
          const fetchedConversations = await window.highlight.internal.getConversations()
          setConversations(fetchedConversations)
          console.log(fetchedConversations)
        } catch (error) {
          console.error('Error fetching conversations:', error)
        }
      }
    }

    fetchConversations()

    // Set up the listener
    let removeListener: (() => void) | undefined

    if (window.highlight?.internal?.createConversationsStorageListener) {
      removeListener = window.highlight.internal.createConversationsStorageListener(() => {
        console.log('Conversations updated')
        fetchConversations() // Fetch updated conversations when the event is triggered
      })
    }

    // Clean up the listener when the component unmounts
    return () => {
      if (removeListener) {
        removeListener()
      }
    }
  }, [])

  return conversations
}

*/
