import { PROMPTS_TABLE_SELECT_FIELDS, supabaseAdmin } from '@/lib/supabase'

/**
 * API route that returns all public prompts
 */
export async function GET(request: Request) {
  const { data: prompts, error } = await supabaseAdmin
    .from('prompts')
    .select(PROMPTS_TABLE_SELECT_FIELDS)
    .eq('public', true)

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json(prompts)
}
