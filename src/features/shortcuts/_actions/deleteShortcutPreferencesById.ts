'use server'

import { validateUserAuth } from '@/lib/auth'
import { supabaseHlChatAdmin } from '@/lib/supabase'

export async function deleteShortcutPreferencesById(promptId: number, authToken: string) {
  console.log('Attempting to delete shortcut preferences for prompt:', promptId)

  let userId: string
  try {
    userId = await validateUserAuth(authToken)
    console.log('Validated user:', userId)
  } catch (error) {
    console.error('Auth validation failed:', error)
    return { error: 'INVALID_AUTH_TOKEN' }
  }

  const supabase = supabaseHlChatAdmin()

  const { error } = await supabase
    .from('app_shortcut_preferences')
    .delete()
    .eq('prompt_id', promptId)
    .eq('user_id', userId)

  if (error) {
    console.error('Error deleting shortcut preferences:', error)
    return { error: 'DATABASE_ERROR' }
  }

  console.log('Successfully deleted shortcut preferences')
  return { success: true }
}
