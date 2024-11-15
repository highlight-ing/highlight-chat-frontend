import { usePromptEditorStore } from '@/stores/prompt-editor'

import { Prompt } from '@/types/supabase-helpers'
import { supabaseLoader } from '@/lib/supabase'
import { useStore } from '@/components/providers/store-provider'

export default function useForkDefaultAction() {
  const { setSelectedScreen, setPromptEditorData, clearPromptEditorData, setOnboarding } = usePromptEditorStore()
  const openModal = useStore((state) => state.openModal)
  const { setNeedSave, setSettingsHasNoErrors } = usePromptEditorStore()

  return {
    forkDefaultAction: async (prompt: Prompt) => {
      clearPromptEditorData()
      setOnboarding({ isOnboarding: false, index: 0 })
      setSelectedScreen('startWithTemplate')
      setPromptEditorData({
        externalId: prompt.external_id,
        appPrompt: prompt.prompt_text ?? '',
        name: prompt.name,
        description: prompt.description ?? '',
        image: `${prompt.image}.${prompt.user_images?.file_extension}`,
      })

      openModal('create-prompt-from-template')

      if (!prompt.image) {
        return
      }

      const imageUrl = supabaseLoader({
        src: `user_content/${prompt.image}.${prompt.user_images?.file_extension}`,
        width: 256,
      })

      // Fetch the image file

      let imageFile
      try {
        imageFile = await fetch(imageUrl).then((res) => res.blob())
        // Convert the image to a file
        const uploadingImage = new File([imageFile], prompt.image, { type: imageFile.type })
        setPromptEditorData({ uploadingImage })
      } catch (error) {
        console.error('Error fetching image file:', error)
      }

      setNeedSave(true)
      setSettingsHasNoErrors(true)
    },
  }
}
