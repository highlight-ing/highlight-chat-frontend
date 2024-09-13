import PromptTagPage from '@/components/prompts/PromptTagPage/PromptTagPage'
import { supabaseAdmin } from '@/lib/supabase'
import { Prompt } from '@/types/supabase-helpers'
import { notFound } from 'next/navigation'

interface TagPageProps {
  params: { slug: string }
}

export interface PromptWithTags extends Prompt {
  added_prompt_tags: {
    tags: {
      tag: string
      slug: string
    } | null
  }[]
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
    .select('prompts(*, user_images(file_extension), added_prompt_tags(tags(tag, slug)))')
    .eq('tag_id', data.id)
    .throwOnError()

  if (!promptSelect) {
    throw new Error('promptSelect was null.')
  }

  const prompts = promptSelect.map((prompt) => prompt.prompts).filter((prompt) => prompt !== null)

  prompts[0].added_prompt_tags

  return <PromptTagPage tag={data.tag} prompts={prompts} />
}
