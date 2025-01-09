import { useEffect } from 'react'
import { usePromptEditorStore } from '@/stores/prompt-editor'
import { ModalObjectProps } from '@/types'
import { useQueryClient } from '@tanstack/react-query'

import { Prompt } from '@/types/supabase-helpers'
import usePromptApps from '@/hooks/usePromptApps' // Add this import
import { usePromptEditor } from '@/hooks/usePromptEditor'
import Modal from '@/components/modals/Modal'
import AppSelector from '@/components/prompts/PromptEditor/ShortcutPreferences/AppSelector'
import { useStore } from '@/components/providers/store-provider'

interface AppSelectorContext {
  prompt: Prompt
  promptShortcutPreferences?: any
}

export default function AppSelectorModal({ id, context }: ModalObjectProps) {
  const { prompt, promptShortcutPreferences } = (context?.data || {}) as AppSelectorContext
  const closeModal = useStore((state) => state.closeModal)
  const { setSelectedApp, setAppVisibility, setContextTypes, setPromptEditorData } = usePromptEditorStore()
  const { saveShortcutPreferences } = usePromptEditor() as {
    saveShortcutPreferences: (maybePromptId?: number) => Promise<void>
  }
  const { refreshPinnedPrompts } = usePromptApps()

  const queryClient = useQueryClient()

  // Set prompt ID for saving
  useEffect(() => {
    setPromptEditorData({ externalId: prompt?.external_id }, true)
  }, [prompt?.external_id, setPromptEditorData])

  // Initialize preferences
  useEffect(() => {
    if (!promptShortcutPreferences) {
      setSelectedApp('hidden')
      setAppVisibility({})
      setContextTypes(null)
      return
    }

    if (promptShortcutPreferences.application_name_darwin === '*') {
      setSelectedApp('all')
      setAppVisibility({})
      return
    }

    try {
      const apps = JSON.parse(promptShortcutPreferences.application_name_darwin || '[]')
      if (apps.length === 0) {
        setSelectedApp('hidden')
        setAppVisibility({})
      } else {
        setSelectedApp('specific')
        const newVisibility: Record<string, boolean> = {}
        apps.forEach((app: string) => {
          newVisibility[app] = true
        })
        setAppVisibility(newVisibility)
      }
    } catch (error) {
      setSelectedApp('hidden')
      setAppVisibility({})
    }
  }, [promptShortcutPreferences, setSelectedApp, setAppVisibility, setContextTypes])

  const handleSave = async () => {
    await saveShortcutPreferences()
    await refreshPinnedPrompts()

    // Get current data from cache
    const currentPreferences = queryClient.getQueryData(['user-shortcut-preferences'])
    const currentShortcuts = queryClient.getQueryData(['shortcuts'])

    // Force update the cache
    queryClient.setQueryData(['user-shortcut-preferences'], (old: any) => {
      // Return new preferences that reflect the changes
      return old
        ? old.map((pref: any) => {
            if (pref.prompt_id === prompt.id) {
              return {
                ...pref,
                application_name_darwin: promptShortcutPreferences?.application_name_darwin,
              }
            }
            return pref
          })
        : old
    })

    closeModal(id)
  }

  if (!prompt) return null

  return (
    <Modal
      id={id}
      size="small"
      header={
        <div className="flex w-full items-center justify-between">
          <div className="flex grow justify-center">Edit App Availability</div>
        </div>
      }
    >
      <div className="p-6">
        <AppSelector shortcutName={prompt.name} />
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSave}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            Save
          </button>
        </div>
      </div>
    </Modal>
  )
}
