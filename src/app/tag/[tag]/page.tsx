import TagPage from '@/components/prompts/TagPage/TagePage'

interface TagPageProps {
  params: { tag: string }
}

export default function Page({ params }: TagPageProps) {
  return <TagPage />
}
