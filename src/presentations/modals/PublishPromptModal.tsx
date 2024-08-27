import { ModalObjectProps } from '@/types'

import { useStore } from '@/providers/store-provider'
import ConfirmationModal from '@/components/modals/ConfirmationModal'
import { Prompt } from '@/types/supabase-helpers'
import useAuth from '@/hooks/useAuth'
import { deletePrompt } from '@/utils/prompts'
import { usePromptsStore } from '@/stores/prompts'

export interface PublishPromptModalContext {
  externalId: string
  name: string
}
