import { PROMPTS_TABLE_SELECT_FIELDS, promptSelectMapper, supabaseAdmin } from '@/lib/supabase'

/**
 * API route that returns a single prompt by its slug
 */
export async function GET(request: Request, { params }: { params: { slug: string } }) {
  const supabase = supabaseAdmin()

  const { data: prompt, error } = await supabase
    .from('prompts')
    .select(PROMPTS_TABLE_SELECT_FIELDS)
    // .eq('public', true)
    .eq('slug', params.slug)
    .maybeSingle()

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  if (!prompt) {
    return Response.json({ error: 'Prompt not found' }, { status: 404 })
  }

  return Response.json(promptSelectMapper(prompt))
}
