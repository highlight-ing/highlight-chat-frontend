import PromptHelper from '@/components/HighlightChat/PromptHelper'
import { supabaseAdmin } from '@/lib/supabase'

export default async function Home({ params }: { params: { slug: string } }) {
  const supabase = supabaseAdmin()

  // fetch the prompt app from supabase
  const { data: prompt, error } = await supabase
    .from('prompts')
    .select('*, user_images(file_extension)')
    .eq('slug', params.slug)
    .maybeSingle()

  if (error) {
    return <div>Error fetching prompt: {error.message}</div>
  }

  if (!prompt) {
    return <div>Prompt not found</div>
  }

  return <PromptHelper prompt={prompt} />
}
