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
