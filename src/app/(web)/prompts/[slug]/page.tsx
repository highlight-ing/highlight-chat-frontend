import PromptListingPage from '@/components/prompts/PromptListingPage/PromptListingPage'
import PromptShareButton from '@/components/prompts/PromptListingPage/PromptShareButton'
import { RelatedAppProps } from '@/components/prompts/PromptListingPage/RelatedApp'
import { supabaseAdmin } from '@/lib/supabase'
import { Metadata, ResolvingMetadata } from 'next'
import { notFound } from 'next/navigation'

interface PromptPageProps {
  params: { slug: string }
}

async function getPrompt(slug: string) {
  const supabase = supabaseAdmin()
  return await supabase.from('prompts').select('*, user_images(file_extension)').eq('slug', slug).maybeSingle()
}

export async function generateMetadata({ params }: PromptPageProps, parent: ResolvingMetadata): Promise<Metadata> {
  const { data: prompt, error } = await getPrompt(params.slug)

  if (error) {
    throw error
  }

  if (!prompt) {
    notFound()
  }

  return {
    title: `${prompt.name} | Highlight Prompts`,
    description: prompt.description ?? '',
  }
}

export default async function PromptPage({ params }: PromptPageProps) {
  // Look up the prompt by slug

  const { data: prompt, error } = await getPrompt(params.slug)

  if (error) {
    return <div>Error fetching prompt: {error.message}</div>
  }

  if (!prompt) {
    notFound()
  }

  const supabase = supabaseAdmin()

  // Fetch "related" prompts
  const { data: relatedPrompts } = await supabase
    .from('prompts')
    .select('*, user_images(file_extension)')
    .eq('public', true)
    .eq('is_handlebar_prompt', true)
    .neq('id', prompt.id)
    .limit(3)

  let relatedApps: RelatedAppProps[] = []

  if (relatedPrompts) {
    // Append related prompts
    relatedPrompts.forEach((relatedPrompt) => {
      if (!relatedPrompt.slug) {
        return
      }

      relatedApps.push({
        name: relatedPrompt.name,
        description: relatedPrompt.description ?? '',
        slug: relatedPrompt.slug,
        imageId: relatedPrompt.image ?? undefined,
        imageExtension: relatedPrompt.user_images?.file_extension ?? undefined,
      })
    })
  }

  // Attempt to select the user's username
  const { data: user } = await supabase.from('profiles').select('username').eq('user_id', prompt.user_id).maybeSingle()

  const author = user?.username ?? 'Highlight User'

  return (
    <div className="min-h-screen bg-bg-layer-1">
      <div className="flex flex-row items-center border-b border-b-light-5 p-2">
        <div className="basis-1/3"></div>
        <h3 className="basis-1/3 text-center">Highlight Apps</h3>
        <div className="flex basis-1/3 justify-end">
          <PromptShareButton />
        </div>
      </div>
      <div className="p-20">
        <PromptListingPage
          externalId={prompt.external_id}
          image={prompt.image ?? undefined}
          imageExtension={prompt.user_images?.file_extension ?? undefined}
          slug={prompt.slug ?? ''}
          name={prompt.name}
          author={author}
          description={prompt.description ?? ''}
          relatedApps={relatedApps}
          videoUrl={prompt.video_url ?? undefined}
        />
      </div>
    </div>
  )
}
