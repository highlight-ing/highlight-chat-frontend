'use server'

import { PromptWithTags } from '@/types/supabase-helpers'
import { validateUserAuth } from '@/lib/auth'
import { supabaseHlChatAdmin } from '@/lib/supabase'

export async function fetchUserCreatedShortcuts(authToken: string) {
  let userId: string
  try {
    userId = await validateUserAuth(authToken)
    console.log('Auth validated, userId:', userId)
  } catch (error) {
    console.error('Auth validation failed:', error)
    return { error: 'INVALID_AUTH_TOKEN' }
  }

  const supabase = supabaseHlChatAdmin()

  console.log('Fetching user created shortcuts for user:', userId)
  const { data: prompts, error } = await supabase
    .from('prompts')
    .select(
      `
      *,
      user_images(file_extension),
      added_prompt_tags(id, tags(tag, slug))
    `,
    )
    .eq('user_id', userId)

  // console.log('Query result:', { prompts, error })

  if (error) {
    console.error('Database error:', error)
    return { error: 'DATABASE_ERROR' }
  }
  console.log('PROMPTS', prompts)
  return prompts as PromptWithTags[]
}
