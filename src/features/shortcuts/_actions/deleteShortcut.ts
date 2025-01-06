'use server'

import { validateUserAuth } from '@/lib/auth'
import { supabaseHlChatAdmin } from '@/lib/supabase'

export async function deleteShortcut(promptId: number, authToken: string) {
  console.log(`Attempting to delete prompt ${promptId}`)

  let userId: string
  try {
    userId = await validateUserAuth(authToken)
    console.log(`Validated JWT for user ${userId}`)
  } catch (error) {
    console.error('JWT validation failed:', error)
    return { error: 'INVALID_AUTH_TOKEN' }
  }

  const supabase = supabaseHlChatAdmin()

  // First verify the user owns this prompt
  const { data: prompt, error: fetchError } = await supabase
    .from('prompts')
    .select('user_id')
    .eq('id', promptId)
    .single()

  console.log('Prompt fetch result:', { prompt, fetchError })

  if (!prompt || prompt.user_id !== userId) {
    console.error('Authorization failed:', {
      promptExists: !!prompt,
      promptUserId: prompt?.user_id,
      requestingUserId: userId,
    })
    return { error: 'UNAUTHORIZED' }
  }

  // Delete the prompt and related data
  const { error: deleteError } = await supabase.from('prompts').delete().eq('id', promptId).eq('user_id', userId)

  if (deleteError) {
    console.error('Error deleting prompt', deleteError)
    return { error: 'DATABASE_ERROR' }
  }
  console.log('Prompt deleted')
  return { success: true }
}
