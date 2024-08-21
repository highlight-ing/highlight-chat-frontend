import { notFound } from 'next/navigation'
import SharePageComponent from '@/components/Share/SharePageComponent'
import { getSharedConversation } from '@/services/shareLink'
import { Metadata } from 'next'
import { Message } from '@/types'
import Header from '@/components/Share/Header'
import Footer from '@/components/Share/Footer'

interface SharePageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const sharedData = await getSharedConversation(params.id)

  if (!sharedData) {
    return {
      title: 'Shared Conversation | Your App Name',
      description: 'This conversation could not be found.',
    }
  }

  return {
    title: `${sharedData.title} | Your App Name`,
    description: 'View a shared conversation',
    // Add more metadata as needed (OpenGraph, Twitter, etc.)
  }
}

export default async function SharePage({ params }: SharePageProps) {
  const sharedData = await getSharedConversation(params.id)

  if (!sharedData) {
    notFound()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header title={sharedData.title} />
      <main className="flex-grow">
        <SharePageComponent title={sharedData.title} messages={sharedData.messages} />
      </main>
      <Footer />
    </div>
  )
}
