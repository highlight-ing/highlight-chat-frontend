import PromptTagPage from '@/components/prompts/PromptTagPage/PromptTagPage'
import { supabaseAdmin } from '@/lib/supabase'
import { Prompt } from '@/types/supabase-helpers'
import { Metadata, ResolvingMetadata } from 'next'
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

export async function generateMetadata({ params }: TagPageProps, parent: ResolvingMetadata): Promise<Metadata> {
  const supabase = supabaseAdmin()
  const { data: tag } = await supabase.from('tags').select('*').eq('slug', params.slug).maybeSingle().throwOnError()

  if (!tag) {
    notFound()
  }

  return {
    title: `${tag.tag} Prompts | Highlight Chat`,
    description: `Explore ${tag.tag} prompts designed for Highlight Chat.`,
  }
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
    .eq('prompts.public', true)
    .throwOnError()

  if (!promptSelect) {
    throw new Error('promptSelect was null.')
  }

  const prompts = promptSelect.map((prompt) => prompt.prompts).filter((prompt) => prompt !== null)

  return <PromptTagPage tag={data.tag} prompts={prompts} />
}
