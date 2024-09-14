import { notFound } from 'next/navigation'
import SharePageComponent from '@/components/Share/SharePageComponent'
import Header from '@/components/Share/Header/ShareHeader'
import { Metadata } from 'next'
import { getSharedConversation } from '@/lib/api'

interface SharePageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const sharedData = await getSharedConversation(params.id, { version: 'v3' })

  if (!sharedData) {
    notFound()
  }

  return {
    title: `${sharedData.title} | Shared Highlight Conversation`,
    description: 'View a shared conversation',
  }
}

export default async function SharePage({ params }: SharePageProps) {
  const sharedData = await getSharedConversation(params.id, { version: 'v3' })

  if (!sharedData) {
    notFound()
  }

  return (
    <div className="flex h-screen flex-col">
      <Header title={sharedData.title} sharedBy={sharedData.user_id} />
      <main className="custom-scrollbar flex-1 overflow-y-auto">
        <SharePageComponent messages={sharedData.messages} />
      </main>
    </div>
  )
}
