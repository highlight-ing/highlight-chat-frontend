import { notFound } from 'next/navigation'
import SharePageComponent from '@/components/Share/SharePageComponent'
import Header from '@/components/Share/Header'
import Footer from '@/components/Share/Footer'
import { getSharedConversation } from '@/services/shareLink'
import { Metadata } from 'next'

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
  }
}

export default async function SharePage({ params }: SharePageProps) {
  const sharedData = await getSharedConversation(params.id)

  if (!sharedData) {
    notFound()
  }

  return (
    <>
      <Header title={sharedData.title} />
      <SharePageComponent messages={sharedData.messages} />
      <Footer />
    </>
  )
}
