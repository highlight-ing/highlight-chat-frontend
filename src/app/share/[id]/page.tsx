// import { notFound } from 'next/navigation';
// import SharePageComponent from '@/components/Share/SharePageComponent'
// import { getSharedConversation } from '@/lib/api';
// import { Metadata } from 'next';

// interface SharePageProps {
//   params: {
//     id: string;
//   };
// }

// export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
//   const conversation = await getSharedConversation(params.id);

//   if (!conversation) {
//     return {
//       title: 'Shared Conversation | Your App Name',
//       description: 'This conversation could not be found.',
//     };
//   }

//   return {
//     title: `${conversation.title} | Your App Name`,
//     description: conversation.description || 'View a shared conversation',
//     // Add more metadata as needed (OpenGraph, Twitter, etc.)
//   };
// }

// export default async function SharePage({ params }: SharePageProps) {
//   const conversation = await getSharedConversation(params.id);

//   if (!conversation) {
//     notFound();
//   }

//   return (
//     <div className="min-h-screen bg-background">
//       <SharePageComponent conversation={conversation} />
//     </div>
//   );
// }
