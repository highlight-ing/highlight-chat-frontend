import { Prompt } from '@/types/supabase-helpers'

export const getPromptAppType = (selfUserId?: string, prompt?: Prompt) => {
  if (selfUserId && prompt && selfUserId === prompt?.user_id) {
    return 'self'
  }
  if (prompt?.slug === 'hlchat') {
    return 'official'
  }
  return 'community'
}

export const DEFAULT_PROMPT_EXTERNAL_IDS = [
  '2d2d0033-edc7-4f43-bad9-3c0baaaee2ee',
  'f9da16e0-ae49-43bb-95d3-5e89d3e3fc9b',
  'e9306eac-3dc2-4380-bb67-37f5ab3a1eaf',
  '957af06a-2f69-4854-a4d7-189bf3758a73',
]
