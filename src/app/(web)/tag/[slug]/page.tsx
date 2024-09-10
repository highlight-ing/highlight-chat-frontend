import PromptTagPage from '@/components/prompts/PromptTagPage/PromptTagPage'
import { supabaseAdmin } from '@/lib/supabase'
import { notFound } from 'next/navigation'

interface TagPageProps {
  params: { slug: string }
}

export default async function Page({ params }: TagPageProps) {
  // Perform a lookup for this tag
  const supabase = supabaseAdmin()
  const { data } = await supabase.from('tags').select('*').eq('slug', params.slug).maybeSingle().throwOnError()

  if (!data) {
    // We can't find this tag
    notFound()
  }

  // Select the prompts that have this tag
  const { data: promptSelect } = await supabase
    .from('added_prompt_tags')
    .select('prompts(*, user_images(file_extension))')
    .eq('tag_id', data.id)
    .throwOnError()

  if (!promptSelect) {
    throw new Error('promptSelect was null.')
  }

  const prompts = promptSelect.map((prompt) => prompt.prompts).filter((prompt) => prompt !== null)

  return <PromptTagPage prompts={prompts} />
}
