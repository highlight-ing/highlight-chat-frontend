import { useEffect, useState } from 'react'
import { usePromptEditorStore } from '@/stores/prompt-editor'
import { usePromptsStore } from '@/stores/prompts'

import { DEFAULT_PROMPT_EXTERNAL_IDS } from '@/lib/promptapps'
import { openApp, sendExternalMessage } from '@/utils/highlightService'
import {
  deletePromptShortcutPreferences,
  getPromptShortcutPreferences,
  removePromptFromUser,
  savePrompt,
  upsertPromptShortcutPreferences,
} from '@/utils/prompts'
import { useStore } from '@/components/providers/store-provider'

import useAuth from './useAuth'
import usePromptApps from './usePromptApps'

// export const PROMPT_SLUG = 'prompts'
export const PROMPT_SLUG = 'dev'

interface AppVisibility {
  [key: string]: boolean
}

export function usePromptEditor() {
  // STATE
  const [saveDisabled, setSaveDisabled] = useState(false)

  // HOOKS
  const {
    promptEditorData,
    setPromptEditorData,
    needSave,
    saving,
    setNeedSave,
    settingsHasNoErrors,
    setSaving,
    selectedApp,
    setSelectedApp,
    appVisibility,
    setAppVisibility,
  } = usePromptEditorStore()
  const { updatePrompt, addPrompt, prompts } = usePromptsStore()
  const addToast = useStore((state) => state.addToast)
  const closeModal = useStore((state) => state.closeModal)
  const { getAccessToken } = useAuth()
  const { selectPrompt, refreshPinnedPrompts } = usePromptApps()

  // EFFECTS
  useEffect(() => {
    setSaveDisabled(!(settingsHasNoErrors && needSave && !saving))
  }, [settingsHasNoErrors, needSave, saving])

  async function loadShortcutPreferences(promptId: number) {
    const accessToken = await getAccessToken()
    const result = await getPromptShortcutPreferences(promptId, accessToken)

    console.log('Loaded shortcut preferences:', result)
    if (!result.preferences) {
      console.log('No shortcut preferences found for prompt:', {
        promptId,
        message: 'Setting to hidden by default',
      })
      setSelectedApp('hidden')
      setAppVisibility({})
      return
    }

    if (result.preferences.application_name_darwin === '*') {
      setSelectedApp('all')
      setAppVisibility({})
      return
    }

    try {
      // Parse the JSON array of apps
      const apps = JSON.parse(result.preferences.application_name_darwin || '[]') as string[]

      if (apps.length === 0) {
        setSelectedApp('hidden')
        setAppVisibility({})
      } else {
        setSelectedApp('specific')
        const newVisibility: AppVisibility = {}
        apps.forEach((app: string) => {
          newVisibility[app] = true
        })
        setAppVisibility(newVisibility)
      }
    } catch (error) {
      console.error('Error parsing app preferences:', error)
      setSelectedApp('hidden')
      setAppVisibility({})
    }
  }

  // Add effect to load preferences when prompt is loaded
  useEffect(() => {
    if (promptEditorData.externalId) {
      const prompt = prompts.find((p) => p.external_id === promptEditorData.externalId)
      if (prompt?.id) {
        console.log('Loading preferences for prompt:', {
          id: prompt.id,
          externalId: prompt.external_id,
          name: prompt.name,
        })
        loadShortcutPreferences(prompt.id)
      }
    }
  }, [promptEditorData.externalId, prompts])

  /**
   * Saves the prompt data from the prompt-editor store to the database.
   */
  async function save() {
    setSaving(true)

    if (!needSave) {
      setSaving(false)
      return
    }

    const formData = new FormData()

    if (promptEditorData.externalId) {
      // This logic handles default prompts being forked.
      // Check if the externalId is in the DEFAULT_PROMPT_EXTERNAL_IDS array
      if (DEFAULT_PROMPT_EXTERNAL_IDS.includes(promptEditorData.externalId)) {
        // We want the prompt to have a new externalId since we're essentially forking it.

        // Unpin the prompt
        const accessToken = await getAccessToken()
        await removePromptFromUser(promptEditorData.externalId, accessToken)
        refreshPinnedPrompts()
      } else {
        formData.append('externalId', promptEditorData.externalId)
      }
    }

    formData.append('slug', promptEditorData.slug)
    formData.append('name', promptEditorData.name)
    formData.append('description', promptEditorData.description)
    formData.append('appPrompt', promptEditorData.appPrompt)
    formData.append('systemPrompt', promptEditorData.systemPrompt)
    formData.append('visibility', promptEditorData.visibility)
    formData.append('roleplay', promptEditorData.roleplay ? 'true' : 'false')
    formData.append('tags', JSON.stringify(promptEditorData.tags ?? []))

    if (promptEditorData.preferredAttachment) {
      formData.append('preferredAttachment', promptEditorData.preferredAttachment)
    }

    if (promptEditorData.videoUrl) {
      formData.append('videoUrl', promptEditorData.videoUrl)
    }

    if (promptEditorData.uploadingImage) {
      formData.append('uploadingImage', promptEditorData.uploadingImage)
    }

    if (promptEditorData.enabledAutomations) {
      formData.append('enabledAutomations', JSON.stringify(promptEditorData.enabledAutomations))
    }

    const accessToken = await getAccessToken()
    const res = await savePrompt(formData, accessToken)

    if (res && res.error) {
      console.error('Error saving prompt:', res.error)
      setSaving(false)
      addToast({
        title: 'Error saving prompt',
        description: res.error,
        type: 'error',
      })
      return
    }

    try {
      //@ts-expect-error
      globalThis.highlight.internal.reloadPrompts()
    } catch (err) {
      console.error('Error reloading prompts', err)
    }

    if (res?.new) {
      // Reload Electron's prompt apps
      setPromptEditorData({
        externalId: res.prompt.external_id,
        slug: res.prompt.slug ?? '',
        image: res.prompt.image ? `${res.prompt.image}.${res.prompt.user_images?.file_extension}` : undefined,
      })

      addPrompt(res.prompt)

      const message = {
        type: 'prompt-created',
        promptId: res.prompt.id,
      }
      await sendExternalMessage(PROMPT_SLUG, message)
      closeModal('create-prompt')

      selectPrompt(res.prompt.external_id, true, false)
    } else if (res?.prompt) {
      // Update the prompts store with the updated prompt data
      updatePrompt(res.prompt)

      const message = {
        type: 'prompt-edited',
        promptId: res.prompt.id,
      }
      // Open the app and send message before closing modal
      await openApp(PROMPT_SLUG)
      await sendExternalMessage(PROMPT_SLUG, message)

      closeModal('edit-prompt')
    }

    addToast({
      title: 'Prompt Updated',
      description: 'Your latest prompt is active everywhere.',
      type: 'success',
      timeout: 7500,
    })

    setNeedSave(false)
    setSaving(false)
  }

  async function saveShortcutPreferences() {
    if (!promptEditorData.externalId) {
      console.log('Cannot save preferences - no prompt ID')
      return
    }

    const prompt = prompts.find((p) => p.external_id === promptEditorData.externalId)
    if (!prompt?.id) {
      console.log('Cannot save preferences - prompt not found')
      return
    }

    const accessToken = await getAccessToken()

    // If hidden/never, delete the record
    if (selectedApp === 'hidden') {
      const result = await deletePromptShortcutPreferences(prompt.id, accessToken)

      if (result.error) {
        console.error('Error deleting shortcut preferences:', result.error)
        addToast({
          title: 'Error saving shortcut preferences',
          description: result.error,
          type: 'error',
        })
        //@ts-expect-error
        // globalThis.highlight.internal.reloadPrompts()
        return
      }

      console.log('Shortcut preferences deleted successfully:', {
        promptId: prompt.id,
      })

      //@ts-expect-error
      // globalThis.highlight.internal.reloadPrompts()

      return
    }

    const preferences = {
      application_name_darwin: null as string | null,
      application_name_win32: null as string | null,
    }

    switch (selectedApp) {
      case 'all':
        preferences.application_name_darwin = '*'
        preferences.application_name_win32 = '*'
        break

      case 'specific':
        const selectedApps = Object.entries(appVisibility)
          .filter(([_, isSelected]) => isSelected)
          .map(([appName]) => appName)

        // If no apps selected in specific mode, treat as hidden
        if (selectedApps.length === 0) {
          const result = await deletePromptShortcutPreferences(prompt.id, accessToken)
          if (result.error) {
            console.error('Error deleting shortcut preferences:', result.error)
            addToast({
              title: 'Error saving shortcut preferences',
              description: result.error,
              type: 'error',
            })
          }

          //@ts-expect-error
          // globalThis.highlight.internal.reloadPrompts()

          return
        }

        const appsString = JSON.stringify(selectedApps)
        preferences.application_name_darwin = appsString
        preferences.application_name_win32 = appsString
        break

      default:
        console.warn('Unexpected selectedApp value:', selectedApp)
        return
    }

    // Only proceed with save if we have valid preferences
    const result = await upsertPromptShortcutPreferences(prompt.id, preferences, accessToken)

    if (result.error) {
      console.error('Error saving shortcut preferences:', result.error)
      addToast({
        title: 'Error saving shortcut preferences',
        description: result.error,
        type: 'error',
      })

      //@ts-expect-error
      // globalThis.highlight.internal.reloadPrompts()

      return
    }

    console.log('Shortcut preferences saved successfully:', {
      promptId: prompt.id,
      selectedApp,
      preferences,
    })

    //@ts-expect-error
    // globalThis.highlight.internal.reloadPrompts()
  }

  return { save, saveDisabled, saveShortcutPreferences }
}
