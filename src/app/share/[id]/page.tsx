import { notFound } from 'next/navigation'
import SharePageComponent from '@/components/Share/SharePageComponent'
import Header from '@/components/Share/Header/ShareHeader'
import Footer from '@/components/Share/Footer'
import { getSharedConversation } from '@/services/shareLink'
import { Metadata } from 'next'
import ClientWrapper from '@/app/share/ClientWrapper'

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
    title: `${sharedData.title} | Shared Hilight Conversation`,
    description: 'View a shared conversation',
  }
}

export default async function SharePage({ params }: SharePageProps) {
  const sharedData = await getSharedConversation(params.id)

  if (!sharedData) {
    notFound()
  }

  return (
    <ClientWrapper>
      <div className="flex h-screen flex-col">
        <Header title={sharedData.title} sharedBy={sharedData.user_id} />
        <main className="flex-1 overflow-y-auto">
          <SharePageComponent messages={sharedData.messages} />
        </main>
        {/* <Footer /> */}
      </div>
    </ClientWrapper>
  )
}
