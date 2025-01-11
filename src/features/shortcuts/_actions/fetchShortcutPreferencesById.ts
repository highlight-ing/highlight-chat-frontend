'use server'

import { AppShortcutPreferences } from '@/types/supabase-helpers'
import { validateUserAuth } from '@/lib/auth'
import { supabaseHlChatAdmin } from '@/lib/supabase'

export async function fetchShortcutPreferencesById(
  promptId: number,
  authToken: string,
): Promise<{ error?: string; preferences?: AppShortcutPreferences }> {
  console.log('Fetching shortcut preferences for prompt:', promptId)

  let userId: string
  try {
    userId = await validateUserAuth(authToken)
  } catch (error) {
    console.error('Auth validation failed:', error)
    return { error: 'INVALID_AUTH_TOKEN' }
  }

  const supabase = supabaseHlChatAdmin()

  const { data, error } = await supabase
    .from('app_shortcut_preferences')
    .select('*')
    .eq('prompt_id', promptId)
    .eq('user_id', userId)
    .maybeSingle()

  console.log('Preferences query result:', { data, error })

  if (error) {
    console.error('Error fetching shortcut preferences:', error)
    return { error: 'DATABASE_ERROR' }
  }

  return { preferences: data as AppShortcutPreferences }
}