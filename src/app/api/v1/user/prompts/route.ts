import { extractBearerToken, validateHighlightJWT } from '@/lib/auth'
import { PROMPTS_TABLE_SELECT_FIELDS, supabaseAdmin } from '@/lib/supabase'

/**
 * API route that returns all prompts for the calling user (based on the authorization token)
 */
export async function GET(request: Request) {
  const supabase = supabaseAdmin()

  const token = extractBearerToken(request.headers)

  if (!token) {
    // User didn't provide a token
    return Response.json({ error: 'Unauthorized, bearer token is required' }, { status: 401 })
  }

  let jwtResponse
  // Validate the JWT
  try {
    jwtResponse = await validateHighlightJWT(token)
  } catch (error) {
    return Response.json({ error: 'Unauthorized, invalid bearer token' }, { status: 401 })
  }

  const userId = jwtResponse.payload.sub

  if (!userId) {
    return Response.json({ error: 'Unauthorized, no subject in token' }, { status: 401 })
  }

  // Select all prompts that the user has added
  const { data: selectResult, error } = await supabase
    .from('added_prompts')
    .select(`prompts(${PROMPTS_TABLE_SELECT_FIELDS})`)
    .eq('user_id', userId)

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  let addedPrompts = selectResult
    .filter((prompt): prompt is { prompts: NonNullable<typeof prompt.prompts> } => prompt.prompts !== null)
    .map((prompt) => prompt.prompts)

  // Select all prompts that the user owns
  const { data: ownedPrompts, error: ownedPromptsError } = await supabase
    .from('prompts')
    .select(`${PROMPTS_TABLE_SELECT_FIELDS}`)
    .eq('user_id', userId)

  if (ownedPromptsError) {
    return Response.json({ error: ownedPromptsError.message }, { status: 500 })
  }

  // Append the unique owned prompts to addedPrompts
  addedPrompts = [...addedPrompts, ...ownedPrompts]

  // Sort out any duplicates
  addedPrompts = addedPrompts.filter((prompt, index, self) => {
    return index === self.findIndex((t) => t.external_id === prompt.external_id)
  })

  // Sort by date created
  addedPrompts.sort((a, b) => {
    return b.created_at.localeCompare(a.created_at)
  })

  if (!selectResult) {
    // Return an empty array since no prompts were found
    return Response.json([], { status: 200 })
  }

  return Response.json(addedPrompts, { status: 200 })
}
