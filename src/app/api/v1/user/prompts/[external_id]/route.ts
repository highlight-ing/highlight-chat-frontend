import { authenticateApiUser, validateIsUuid } from '@/lib/api'
import { supabaseAdmin } from '@/lib/supabase'

interface Params {
  external_id: string
}

/**
 * API route that removes a prompt from the user's prompts
 */
export async function DELETE(request: Request, { params }: { params: Params }) {
  const supabase = supabaseAdmin()

  const externalId = params.external_id

  const uuidCheck = validateIsUuid(externalId)

  if (uuidCheck instanceof Response) {
    return uuidCheck
  }

  const authUser = await authenticateApiUser(request)

  if (authUser instanceof Response) {
    return authUser
  }

  const userId = authUser.sub

  if (!userId) {
    return Response.json({ error: 'Unauthorized, no subject in token' }, { status: 401 })
  }

  // Select the prompt
  const { data: prompt, error: promptError } = await supabase
    .from('prompts')
    .select('id')
    .eq('external_id', externalId)
    .maybeSingle()

  if (promptError) {
    return Response.json({ error: promptError.message }, { status: 500 })
  }

  if (!prompt) {
    return Response.json({ error: 'Prompt does not exist' }, { status: 404 })
  }

  const { error: deleteError } = await supabase
    .from('added_prompts')
    .delete()
    .eq('user_id', userId)
    .eq('prompt_id', prompt.id)
    .maybeSingle()

  if (deleteError) {
    return Response.json({ error: deleteError.message }, { status: 500 })
  }

  return Response.json({ success: true }, { status: 200 })
}

/**
 * API route that adds a prompt to the user's prompts
 */
export async function PUT(request: Request, { params }: { params: Params }) {
  const externalId = params.external_id

  const uuidCheck = validateIsUuid(externalId)

  if (uuidCheck instanceof Response) {
    return uuidCheck
  }

  const supabase = supabaseAdmin()

  const authUser = await authenticateApiUser(request)

  if (authUser instanceof Response) {
    return authUser
  }

  const userId = authUser.sub

  if (!userId) {
    return Response.json({ error: 'Unauthorized, no subject in token' }, { status: 401 })
  }

  if (!externalId) {
    return Response.json({ error: 'Bad Request, external_id is required' }, { status: 400 })
  }

  // Select the prompt
  const { data: prompt, error: promptError } = await supabase
    .from('prompts')
    .select('id')
    .eq('external_id', externalId)
    .maybeSingle()

  if (promptError) {
    return Response.json({ error: promptError.message }, { status: 500 })
  }

  if (!prompt) {
    return Response.json({ error: 'Prompt does not exist' }, { status: 404 })
  }

  // Check if the prompt has already been added
  const { data: addedPrompt } = await supabase
    .from('added_prompts')
    .select('id')
    .eq('user_id', userId)
    .eq('prompt_id', prompt.id)
    .maybeSingle()

  if (addedPrompt) {
    return Response.json({ success: true }, { status: 200 })
  }

  // Add the prompt to the user's prompts
  const { error: insertedPromptError } = await supabase.from('added_prompts').insert({
    user_id: userId,
    prompt_id: prompt.id,
  })

  if (insertedPromptError) {
    return Response.json({ error: insertedPromptError.message }, { status: 500 })
  }

  return Response.json({ success: true }, { status: 200 })
}
