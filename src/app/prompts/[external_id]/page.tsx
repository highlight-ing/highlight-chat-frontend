import Button from '@/components/Button/Button'
import NotFoundPage from '@/components/NotFoundPage/NotFoundPage'
import PromptListingPage from '@/components/prompts/PromptListingPage/PromptListingPage'
import PromptShareButton from '@/components/prompts/PromptListingPage/PromptShareButton'
import { RelatedAppProps } from '@/components/prompts/PromptListingPage/RelatedApp'
import { supabaseAdmin } from '@/lib/supabase'
import { Metadata, ResolvingMetadata } from 'next'

interface PromptPageProps {
  params: { external_id: string }
}

async function getPrompt(external_id: string) {
  const supabase = supabaseAdmin()
  return await supabase.from('prompts').select('*').eq('external_id', external_id).maybeSingle()
}

export async function generateMetadata({ params }: PromptPageProps, parent: ResolvingMetadata): Promise<Metadata> {
  const { data: prompt, error } = await getPrompt(params.external_id)

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

  const { data: prompt, error } = await getPrompt(params.external_id)

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
    .select('*')
    .neq('id', prompt.id)
    .order('created_at', { ascending: false })
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
          name={prompt.name}
          author={'Unknown'}
          description={prompt.description ?? ''}
          relatedApps={relatedApps}
        />
      </div>
    </div>
  )
}
