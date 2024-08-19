import { PromptApp } from '@/types'

export const getPromptAppType = (selfUserId?: string, prompt?: PromptApp) => {
  if (selfUserId && prompt && selfUserId === prompt?.user_id) {
    return 'self'
  }
  if (prompt?.slug === 'hlchat') {
    return 'official'
  }
  return 'community'
}
