'use server'

import { validateUserAuth } from '@/lib/auth'
import { supabaseHlChatAdmin } from '@/lib/supabase'

export async function unpinShortcut(promptId: number, authToken: string) {
  let userId: string
  try {
    userId = await validateUserAuth(authToken)
  } catch (error) {
    console.warn('Invalid JWT', error)
    return { error: 'INVALID_AUTH_TOKEN' }
  }

  const supabase = supabaseHlChatAdmin()

  const { error: deleteError } = await supabase
    .from('added_prompts')
    .delete()
    .eq('user_id', userId)
    .eq('prompt_id', promptId)

  if (deleteError) {
    console.error('Error unpinning prompt', deleteError)
    return { error: 'DATABASE_ERROR' }
  }

  return { success: true }
}
