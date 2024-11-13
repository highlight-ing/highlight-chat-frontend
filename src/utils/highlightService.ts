import Highlight from '@highlight-ai/app-runtime'
import { LLMMessage } from '@/types'
import { ConversationData } from '@highlight-ai/app-runtime'

export const CONVERSATIONS_STORAGE_KEY = 'conversations'
export const AUTO_CLEAR_VALUE_KEY = 'autoClearValue'
export const AUTO_SAVE_SEC_KEY = 'autoSaveSec'
export const AUDIO_ENABLED_KEY = 'audioEnabled'

const isBrowser = typeof window !== 'undefined'
const getAppStorage = () => (isBrowser ? window.highlight.appStorage : null)

declare global {
  interface Window {
    highlight: {
      version: string
      internal: {
        getConversations: () => Promise<ConversationData[]>
        createConversationsStorageListener: (callback: () => void) => () => void
        getAudioSuperpowerEnabled: () => Promise<boolean>
        setAudioSuperpowerEnabled: (enabled: boolean) => Promise<void>
        getTextPrediction: (messages: LLMMessage[]) => Promise<string>
        openApp: (appId: string) => void
        sendConversationAsAttachment: (targetAppId: string, attachment: string) => Promise<void>
        requestAudioPermissionEvents: () => Promise<void>
        sendExternalMessage: (appSlug: string, message: any) => Promise<void>
      }
      appStorage: {
        isHydrated: () => boolean
        whenHydrated: () => Promise<boolean>
        all: () => Record<string, any>
        get: (key: string) => any
        set: (key: string, value: any) => void
        setAll: (value: Record<string, any>) => void
        delete: (key: string) => void
        clear: () => void
      }
      user: {
        getEmail: () => Promise<string>
      }
    }
  }
}

export const sendExternalMessage = async (appSlug: string, message: any) => {
  try {
    // pretty print message here
    console.log('Sending external message:', JSON.stringify(message, null, 2))
    await window.highlight.internal.sendExternalMessage(appSlug, message)
    console.log('Message sent successfully')
  } catch (error) {
    console.error('Error sending external message:', error)
  }
}

export const openApp = async (appId: string) => {
  try {
    await Highlight.app.openApp(appId)
  } catch (error) {
    console.error('Error opening app:', error)
  }
}

export const fetchMicActivity = async (lastNumMs: number = 300): Promise<number> => {
  let activity = await Highlight.user.getMicActivity(lastNumMs)
  return activity
}

export const requestBackgroundPermission = () => {
  try {
    if (typeof window !== 'undefined' && window.highlight) {
      console
      return Highlight.permissions.requestBackgroundPermission()
    }
  } catch (error) {
    console.error('Error requesting background permission:', error)
  }
}

// Internal API functions
export const getAudioSuperpowerEnabled = async (): Promise<boolean> => {
  return await window.highlight.internal.getAudioSuperpowerEnabled()
}

export const setAudioSuperpowerEnabled = async (enabled: boolean): Promise<void> => {
  await window.highlight.internal.setAudioSuperpowerEnabled(enabled)
}

interface ProcessedConversationData {
  topics: string[]
  summary: string
  title: string
}

export const getTextPredictionFromHighlight = async (
  transcript: string,
  signal?: AbortSignal,
): Promise<ProcessedConversationData> => {
  const messages: LLMMessage[] = [
    {
      role: 'system',
      content:
        'Analyze the following conversation transcript and generate a JSON object containing the following fields: \'topics\' (an array of main topics discussed), \'summary\' (a brief summary of the conversation), and \'title\' (a concise title no more than 26 characters long). The Summary should jump straight into listing important topics discussed in the first sentence, with following sentences expanding on conclusions and takeaways. Your response must be valid JSON and nothing else. Do not include any explanations or markdown formatting. The response should be in this exact format: {"topics": ["topic1", "topic2", ...], "summary": "Brief summary here", "title": "Concise title (max 26 chars)"}',
    },
    {
      role: 'user',
      content: transcript,
    },
  ]

  let accumulatedText = ''

  try {
    const textPredictionStream = Highlight.inference.getTextPrediction(messages)

    for await (const chunk of textPredictionStream) {
      if (signal?.aborted) {
        throw new DOMException('Aborted', 'AbortError')
      }
      accumulatedText += chunk
    }

    // Parse the accumulated text as JSON
    const parsedData: ProcessedConversationData = JSON.parse(accumulatedText)
    console.log('Parsed data:', parsedData)
    return parsedData
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      console.log('Text prediction was aborted')
      throw error
    }
    console.error('Error in text prediction or parsing:', error)
    throw new Error('Failed to get or parse LLM output')
  }
}

export const addAudioPermissionListener = (listener: (event: any) => void): void => {
  Highlight.app.addListener('onAudioPermissionUpdate', listener)
}

export const requestAudioPermissionEvents = async (): Promise<void> => {
  if (typeof window !== 'undefined' && window.highlight && window.highlight.internal) {
    try {
      await window.highlight.internal.requestAudioPermissionEvents()
      console.log('Audio permission events requested successfully')
    } catch (error) {
      console.error('Error sending audio permission request:', error)
      throw error
    }
  } else {
    throw new Error('request audio permission is not available')
  }
}

export const saveToAppStorage = async (key: string, value: any): Promise<void> => {
  const appStorage = getAppStorage()
  if (appStorage) {
    await appStorage.whenHydrated()
    appStorage.set(key, value)
  }
}

export const loadFromAppStorage = async (key: string, defaultValue: any): Promise<any> => {
  const appStorage = getAppStorage()
  if (appStorage) {
    await appStorage.whenHydrated()
    const value = appStorage.get(key)
    return value !== undefined ? value : defaultValue
  }
  return defaultValue
}

export const removeFromAppStorage = async (key: string): Promise<void> => {
  const appStorage = getAppStorage()
  if (appStorage) {
    await appStorage.whenHydrated()
    appStorage.delete(key)
  }
}

export const clearAppStorage = async (): Promise<void> => {
  const appStorage = getAppStorage()
  if (appStorage) {
    await appStorage.whenHydrated()
    appStorage.clear()
  }
}

// Type-specific app storage functions
export const saveNumberInAppStorage = async (key: string, value: number): Promise<void> => {
  const appStorage = getAppStorage()
  if (appStorage) {
    await appStorage.whenHydrated()
    appStorage.set(key, value)
  }
}

export const saveBooleanInAppStorage = async (key: string, value: boolean): Promise<void> => {
  const appStorage = getAppStorage()
  if (appStorage) {
    await appStorage.whenHydrated()
    appStorage.set(key, value)
  }
}

export const saveStringInAppStorage = async (key: string, value: string): Promise<void> => {
  const appStorage = getAppStorage()
  if (appStorage) {
    await appStorage.whenHydrated()
    appStorage.set(key, value)
  }
}

export const saveConversationsInAppStorage = async (conversations: ConversationData[]): Promise<void> => {
  if (conversations.length === 0) {
    console.warn('Attempting to save an empty conversations array. This might be unintended')
    return
  }
  const appStorage = getAppStorage()
  if (appStorage) {
    await appStorage.whenHydrated()
    const serializedConversations = conversations.map((conv) => ({
      ...conv,
      timestamp: conv.timestamp.toISOString(),
    }))
    appStorage.set(CONVERSATIONS_STORAGE_KEY, serializedConversations)
  } else {
    console.error('AppStorage not available. Unable to save conversations.')
  }
}

export const deleteAllConversationsInAppStorage = async (): Promise<void> => {
  const appStorage = getAppStorage()
  if (appStorage) {
    await appStorage.whenHydrated()
    appStorage.delete(CONVERSATIONS_STORAGE_KEY)
    console.log('Deleted conversations: ', appStorage.get(CONVERSATIONS_STORAGE_KEY))
  }
}

// Type-specific app storage retrieval functions
export const getNumberFromAppStorage = async (key: string, defaultValue: number): Promise<number> => {
  const appStorage = getAppStorage()
  if (appStorage) {
    await appStorage.whenHydrated()
    const value = appStorage.get(key)
    return typeof value === 'number' ? value : defaultValue
  }
  return defaultValue
}

export const getBooleanFromAppStorage = async (key: string, defaultValue: boolean): Promise<boolean> => {
  const appStorage = getAppStorage()
  if (appStorage) {
    await appStorage.whenHydrated()
    const value = appStorage.get(key)
    return typeof value === 'boolean' ? value : defaultValue
  }
  return defaultValue
}

export const getStringFromAppStorage = async (key: string, defaultValue: string): Promise<string> => {
  const appStorage = getAppStorage()
  if (appStorage) {
    await appStorage.whenHydrated()
    const value = appStorage.get(key)
    return typeof value === 'string' ? value : defaultValue
  }
  return defaultValue
}

export const getConversationsFromAppStorage = async (): Promise<ConversationData[]> => {
  const appStorage = getAppStorage()
  if (appStorage) {
    await appStorage.whenHydrated()
    const serializedConversations = appStorage.get(CONVERSATIONS_STORAGE_KEY)
    if (Array.isArray(serializedConversations)) {
      return serializedConversations.map((conv) => ({
        ...conv,
        timestamp: new Date(conv.timestamp),
      }))
    }
  }
  return []
}
