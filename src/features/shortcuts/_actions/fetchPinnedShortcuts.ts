'use server'

import { PromptWithTags } from '@/types/supabase-helpers'
import { validateUserAuth } from '@/lib/auth'
import { supabaseHlChatAdmin } from '@/lib/supabase'

export async function fetchPinnedShortcuts(authToken: string) {
  let userId: string
  try {
    userId = await validateUserAuth(authToken)
    console.log('Fetching pinned shortcuts for user:', userId) // Add debug log
  } catch (error) {
    console.error('Auth error in fetchPinnedShortcuts:', error)
    return { error: 'INVALID_AUTH_TOKEN' }
  }

  const supabase = supabaseHlChatAdmin()

  const { data: addedPrompts, error: addedPromptsError } = await supabase
    .from('added_prompts')
    .select('prompt_id')
    .eq('user_id', userId)

  console.log('Added prompts query result:', { addedPrompts, addedPromptsError }) // Add debug log

  if (!addedPrompts?.length) {
    console.log('No pinned prompts found') // Add debug log
    return []
  }

  const { data: prompts, error } = await supabase
    .from('prompts')
    .select(
      `
      *,
      user_images(file_extension),
      added_prompt_tags(id, tags(tag, slug))
    `,
    )
    .in(
      'id',
      addedPrompts.map((p) => p.prompt_id),
    )
    .order('name', { ascending: true })

  console.log('Prompts query result:', { prompts, error })

  if (error) {
    console.error('Database error in fetchPinnedShortcuts:', error)
    return { error: 'DATABASE_ERROR' }
  }

  return prompts as PromptWithTags[]
}
