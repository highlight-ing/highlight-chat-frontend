import { usePromptEditorStore } from '@/stores/prompt-editor'

import { Prompt } from '@/types/supabase-helpers'
import { supabaseLoader } from '@/lib/supabase'
import { getPromptShortcutPreferences } from '@/utils/prompts'
import useAuth from '@/hooks/useAuth'
import { useStore } from '@/components/providers/store-provider'

export default function useForkDefaultAction() {
  const {
    setSelectedScreen,
    setPromptEditorData,
    clearPromptEditorData,
    setOnboarding,
    setSelectedApp,
    setAppVisibility,
    setContextTypes,
  } = usePromptEditorStore()

  const openModal = useStore((state) => state.openModal)
  const { setNeedSave, setSettingsHasNoErrors, setForkingShortcutId } = usePromptEditorStore()
  const { getAccessToken } = useAuth()

  return {
    forkDefaultAction: async (prompt: Prompt) => {
      setOnboarding({ isOnboarding: false, index: 0 })
      setSelectedScreen('startWithTemplate')
      setForkingShortcutId(prompt.external_id)

      // Set initial prompt data with externalId to enable preference saving
      setPromptEditorData({
        externalId: prompt.external_id,
        appPrompt: prompt.prompt_text ?? '',
        name: prompt.name,
        description: prompt.description ?? '',
        image: `${prompt.image}.${prompt.user_images?.file_extension}`,
      })

      // Fetch the original prompt's preferences
      const authToken = await getAccessToken()
      const { preferences } = await getPromptShortcutPreferences(prompt.id, authToken)

      // Set app visibility and context preferences
      if (preferences) {
        if (preferences.application_name_darwin === '*') {
          setSelectedApp('all')
          setAppVisibility({})
        } else if (preferences.application_name_darwin) {
          setSelectedApp('specific')
          const apps = JSON.parse(preferences.application_name_darwin)
          const newVisibility: Record<string, boolean> = {}
          apps.forEach((app: string) => {
            newVisibility[app] = true
          })
          setAppVisibility(newVisibility)
        } else {
          setSelectedApp('hidden')
          setAppVisibility({})
        }

        setContextTypes(
          preferences.context_types
            ? {
                selected_text: !!(preferences.context_types as any).selected_text,
                audio_transcription: !!(preferences.context_types as any).audio_transcription,
                clipboard_text: !!(preferences.context_types as any).clipboard_text,
                screenshot: !!(preferences.context_types as any).screenshot,
                window: !!(preferences.context_types as any).window,
              }
            : null,
        )
      }

      openModal('create-prompt-from-template')

      if (prompt.image) {
        const imageUrl = supabaseLoader({
          src: `user_content/${prompt.image}.${prompt.user_images?.file_extension}`,
          width: 256,
        })

        try {
          const imageFile = await fetch(imageUrl).then((res) => res.blob())
          const uploadingImage = new File([imageFile], prompt.image, { type: imageFile.type })
          setPromptEditorData({ uploadingImage })
        } catch (error) {
          console.error('Error fetching image file:', error)
        }
      }

      setNeedSave(true)
      setSettingsHasNoErrors(true)
    },
  }
}
