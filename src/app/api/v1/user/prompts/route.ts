import { authenticateApiUser } from '@/lib/api'
import { PROMPTS_TABLE_SELECT_FIELDS, promptSelectMapper, supabaseAdmin } from '@/lib/supabase'

const DEFAULT_PROMPT_IDS = [452, 453, 454, 455]

async function checkIfDefaultPromptsAdded(userId: string) {
  const supabase = supabaseAdmin()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .throwOnError()
    .maybeSingle()

  let hasAddedDefaultPrompts = profile?.added_default_prompts ?? false

  if (hasAddedDefaultPrompts) {
    return
  }

  // Update the user's profile

  const { error: updateError } = await supabase.from('profiles').upsert(
    {
      user_id: userId,
      added_default_prompts: true,
    },
    {
      onConflict: 'user_id',
    },
  )

  if (updateError) {
    console.error('Error updating user profile:', updateError)
  }

  // Pin the 4 default prompts to the user
  const { error: insertError } = await supabase
    .from('added_prompts')
    .insert(DEFAULT_PROMPT_IDS.map((id) => ({ user_id: userId, prompt_id: id })))

  if (insertError) {
    console.error('Error pinning default prompts:', insertError)
  }

  return
}

/**
 * API route that returns all prompts for the calling user (based on the authorization token)
 *
 * This route is called by Highlight's Electron client.
 */
export async function GET(request: Request) {
  const supabase = supabaseAdmin()

  const authUser = await authenticateApiUser(request)

  if (authUser instanceof Response) {
    return authUser
  }

  const userId = authUser.sub

  if (!userId) {
    return Response.json({ error: 'Unauthorized, no subject in token' }, { status: 401 })
  }

  // Check if the user has added the default prompts
  // await checkIfDefaultPromptsAdded(userId)

  // Select all prompts that the user has added
  const { data: selectResult, error } = await supabase
    .from('added_prompts')
    .select(`prompts(${PROMPTS_TABLE_SELECT_FIELDS}), created_at`)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  // Select all prompts that the user owns
  const { data: ownedPrompts, error: ownedPromptsError } = await supabase
    .from('prompts')
    .select(`${PROMPTS_TABLE_SELECT_FIELDS}`)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (ownedPromptsError) {
    return Response.json({ error: ownedPromptsError.message }, { status: 500 })
  }

  // Join the two arrays
  const sortingArray = [...selectResult, ...ownedPrompts]

  // Sort by date created
  sortingArray.sort((a, b) => {
    return b.created_at.localeCompare(a.created_at)
  })

  // Ensure that the outputted array is only prompts, no extra fields
  const addedPrompts = sortingArray.map((prompt) => {
    // Check if the prompt has the correct shape
    if ('prompts' in prompt && prompt.prompts) {
      return promptSelectMapper(prompt.prompts)
    } else if ('external_id' in prompt) {
      return promptSelectMapper(prompt)
    } else {
      console.error('Unexpected prompt structure:', prompt)
      return null
    }
  })

  // Remove any nulls from the array
  let filteredPrompts = addedPrompts.filter((prompt) => prompt !== null)

  // Sort out any duplicates
  filteredPrompts = filteredPrompts.filter((prompt, index, self) => {
    return index === self.findIndex((t) => t.external_id === prompt.external_id)
  })

  const filteredPromptsWithUsages = filteredPrompts.map((prompt) => {
    return {
      ...prompt,
      last_usage: null,
    }
  })

  return Response.json(filteredPromptsWithUsages, { status: 200 })
}
