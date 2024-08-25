import { supabaseAdmin } from '@/lib/supabase'
import { corsHeaders } from '@/utils/cors'
import Handlebars from 'handlebars'

/**
 * API route that returns a single prompt by its slug
 */
export async function GET(request: Request, { params }: { params: { external_id: string } }) {
  const supabase = supabaseAdmin()
  const { data: prompt, error } = await supabase
    .from('prompts')
    .select('suggestion_prompt_text')
    // .eq('public', true)
    .eq('external_id', params.external_id)
    .maybeSingle()

  console.log('prompt', prompt)

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  if (!prompt) {
    return Response.json({ error: 'Prompt not found' }, { status: 404 })
  }

  if (!prompt.suggestion_prompt_text) {
    return Response.json({ error: 'Prompt has no suggestion prompt text.' }, { status: 404 })
  }

  const translatedPrompt = Handlebars.compile(prompt.suggestion_prompt_text)

  // Transform the prompt editor format into the suggestions format

  const translated = translatedPrompt({
    image: '',
    clipboard_text: '{{environment.clipboardText}}',
    about_me: '{{factsAboutMe}}',
    screen: '{{environment.ocrScreenContents}}',
    audio: '{{audioRecent}}',
    user_message: '{{userIntent}}',
  })

  const systemPrompt = `{{#system}}
  Generate a list of 5 tasks. Format the tasks in a JSON array like this: ["task1", "task2", "task3", "task4", "task5"].
  {{/system}}`

  return new Response(`${systemPrompt}\n{{#user}}\n${translated}\n{{/user}}`, {
    headers: {
      'Content-Type': 'text/plain',
      ...corsHeaders,
    },
  })
}
