// src/app/actions/searchPrompts.ts
'use server'

import { validateUserAuth } from '@/lib/auth'
import { supabaseHlChatAdmin } from '@/lib/supabase'

export async function pinShortcut(externalId: string, authToken: string) {
  let userId: string
  try {
    userId = await validateUserAuth(authToken)
  } catch (error) {
    console.warn('Invalid JWT', error)
    return { error: 'INVALID_AUTH_TOKEN' }
  }

  // Check if the user already has the prompt
  const supabase = supabaseHlChatAdmin()

  const { data: addedPrompt } = await supabase
    .from('added_prompts')
    .select('*')
    .eq('user_id', userId)
    .eq('prompts.external_id', externalId)
    .maybeSingle()

  if (addedPrompt) {
    console.log('Prompt has already been added, no need to do anything')
    // Prompt has already been added, no need to do anything
    return
  }

  const { data: prompt } = await supabase.from('prompts').select('id').eq('external_id', externalId).maybeSingle()

  if (!prompt) {
    return { error: 'DATABASE_READ_ERROR' }
  }

  console.log('adding prompt to user', userId, prompt.id)

  // Otherwise, add the prompt to the user
  const { error: insertError } = await supabase.from('added_prompts').insert({
    user_id: userId,
    prompt_id: prompt.id,
  })

  if (insertError) {
    console.error('Error adding prompt to user', insertError)
    return { error: 'DATABASE_ERROR' }
  }
}
