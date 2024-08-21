import NotFoundPage from '@/components/NotFoundPage/NotFoundPage'
import PromptListingPage from '@/components/prompts/PromptListingPage/PromptListingPage'
import PromptShareButton from '@/components/prompts/PromptListingPage/PromptShareButton'
import { RelatedAppProps } from '@/components/prompts/PromptListingPage/RelatedApp'
import { supabaseAdmin } from '@/lib/supabase'
import { Metadata, ResolvingMetadata } from 'next'

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
    return {
      title: 'Page Not Found',
      description: 'The page you are looking for does not exist.',
    }
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
    return <NotFoundPage />
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

  return (
    <div className="min-h-screen bg-bg-layer-1">
      <div className="flex flex-row items-center border-b border-b-light-5 p-4">
        <div className="basis-1/3"></div>
        <h3 className="basis-1/3 text-center">Highlight Apps</h3>
        <div className="flex basis-1/3 justify-end">
          <PromptShareButton />
        </div>
      </div>
      <div className="p-20">
        <PromptListingPage
          image={prompt.image ?? undefined}
          imageExtension={prompt.user_images?.file_extension ?? undefined}
          slug={prompt.slug ?? ''}
          name={prompt.name}
          author={'Unknown'}
          description={prompt.description ?? ''}
          relatedApps={relatedApps}
          videoUrl={prompt.video_url ?? undefined}
        />
      </div>
    </div>
  )
}
