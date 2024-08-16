import { PROMPTS_TABLE_SELECT_FIELDS, supabaseAdmin } from '@/lib/supabase'

/**
 * API route that returns a single prompt by its slug
 */
export async function GET(request: Request, { params }: { params: { external_id: string } }) {
  const { data: prompt, error } = await supabaseAdmin
    .from('prompts')
    .select(PROMPTS_TABLE_SELECT_FIELDS)
    .eq('public', true)
    .eq('external_id', params.external_id)
    .maybeSingle()

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  if (!prompt) {
    return Response.json({ error: 'Prompt not found' }, { status: 404 })
  }

  return Response.json(prompt)
}
