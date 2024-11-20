import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getSharedConversation } from '@/lib/api'
import Header from '@/components/Share/Header/ShareHeader'
import SharePageComponent from '@/components/Share/SharePageComponent'

interface SharePageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const sharedData = await getSharedConversation(params.id, { version: 'v4' })

  if (!sharedData) {
    notFound()
  }

  return {
    title: `${sharedData.title} | Shared Highlight Conversation`,
    description: 'View a shared conversation',
  }
}

export default async function SharePage({ params }: SharePageProps) {
  const sharedData = await getSharedConversation(params.id, { version: 'v4' })

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
