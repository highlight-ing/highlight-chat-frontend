import { useEffect, useState } from 'react'
import { usePromptEditorStore } from '@/stores/prompt-editor'
import { usePromptsStore } from '@/stores/prompts'
import { debounce } from 'throttle-debounce'

import { DEFAULT_PROMPT_EXTERNAL_IDS } from '@/lib/promptapps'
import { openApp, sendExternalMessage } from '@/utils/highlightService'
import {
  deletePromptShortcutPreferences,
  removePromptFromUser,
  savePrompt,
  upsertPromptShortcutPreferences,
} from '@/utils/prompts'
import { useStore } from '@/components/providers/store-provider'

import useAuth from './useAuth'
import usePromptApps from './usePromptApps'

export const PROMPT_SLUG = 'prompts'

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
    appVisibility,
    contextTypes,
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
      saveShortcutPreferences(res.prompt.id)
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

  async function saveShortcutPreferences(maybePromptId?: number) {
    let promptId = maybePromptId
    if (!promptId) {
      if (!promptEditorData.externalId) {
        console.log('Cannot save preferences - missing promptId and externalId')
        return
      }

      const prompt = prompts.find((p) => p.external_id === promptEditorData.externalId)
      if (!prompt?.id) {
        console.log('Cannot save preferences - prompt not found')
        return
      }

      promptId = prompt.id
    }

    const accessToken = await getAccessToken()

    // If hidden/never, delete the record
    if (selectedApp === 'hidden') {
      const result = await deletePromptShortcutPreferences(promptId, accessToken)

      if (result.error) {
        console.error('Error deleting shortcut preferences:', result.error)
        addToast({
          title: 'Error saving shortcut preferences',
          description: result.error,
          type: 'error',
        })
        return
      }

      console.log('Shortcut preferences deleted successfully:', {
        promptId,
      })

      refreshPinnedPrompts()
      return
    }

    const preferences = {
      application_name_darwin: null as string | null,
      application_name_win32: null as string | null,
      context_types: contextTypes,
    }

    switch (selectedApp) {
      case 'all':
        preferences.application_name_darwin = '*'
        preferences.application_name_win32 = '*'

        if (!contextTypes) {
          preferences.context_types = {
            selected_text: true,
            audio_transcription: true,
            clipboard_text: true,
            screenshot: true,
            window: true,
          }
        }
        break

      case 'specific':
        const selectedApps = Object.entries(appVisibility)
          .filter(([_, isSelected]) => isSelected)
          .map(([appName]) => appName)

        // If no apps selected in specific mode, treat as hidden
        if (selectedApps.length === 0) {
          const result = await deletePromptShortcutPreferences(promptId, accessToken)
          if (result.error) {
            console.error('Error deleting shortcut preferences:', result.error)
            addToast({
              title: 'Error saving shortcut preferences',
              description: result.error,
              type: 'error',
            })
          }

          refreshPinnedPrompts()
          return
        }

        const appsString = JSON.stringify(selectedApps)
        preferences.application_name_darwin = appsString
        preferences.application_name_win32 = appsString
        if (!contextTypes) {
          preferences.context_types = {
            selected_text: true,
            audio_transcription: true,
            clipboard_text: true,
            screenshot: true,
            window: true,
          }
        }
        break

      default:
        console.warn('Unexpected selectedApp value:', selectedApp)
        return
    }
    // Only proceed with save if we have valid preferences
    const result = await upsertPromptShortcutPreferences(promptId, preferences, accessToken)

    if (result.error) {
      console.error('Error saving shortcut preferences:', result.error)
      addToast({
        title: 'Error saving shortcut preferences',
        description: result.error,
        type: 'error',
      })

      refreshPinnedPrompts()
      return
    } else {
      console.log('Shortcut preferences saved successfully:', {
        promptId,
        selectedApp,
        preferences,
        contextTypes,
      })
    }

    // Refresh prompts to update the pinned status in the assistant
    refreshPinnedPrompts()
  }

  const debouncedSaveShortcutPreferences = debounce(300, saveShortcutPreferences)

  useEffect(() => {
    if (promptEditorData.externalId) {
      debouncedSaveShortcutPreferences()
    }
  }, [contextTypes, selectedApp, appVisibility, promptEditorData.externalId])

  return { save, saveDisabled }
}
