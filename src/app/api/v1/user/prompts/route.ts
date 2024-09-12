import { authenticateApiUser } from '@/lib/api'
import { PROMPTS_TABLE_SELECT_FIELDS, promptSelectMapper, supabaseAdmin } from '@/lib/supabase'

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

  // Select all prompts that the user has added
  const { data: selectResult, error } = await supabase
    .from('added_prompts')
    .select(`prompts(${PROMPTS_TABLE_SELECT_FIELDS}, prompt_usages(created_at)), created_at`)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  // Select all prompts that the user owns
  const { data: ownedPrompts, error: ownedPromptsError } = await supabase
    .from('prompts')
    .select(`${PROMPTS_TABLE_SELECT_FIELDS}, prompt_usages(created_at)`)
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

  // Sort the most recent prompt usage to the top
  const filteredPromptsWithUsages = filteredPrompts.map((prompt) => {
    const sorted = prompt.prompt_usages.sort((a, b) => {
      return b.created_at.localeCompare(a.created_at)
    })
    return {
      ...prompt,
      prompt_usages: undefined,
      last_usage: sorted[0]?.created_at ?? null,
    }
  })

  return Response.json(filteredPromptsWithUsages, { status: 200 })
}
