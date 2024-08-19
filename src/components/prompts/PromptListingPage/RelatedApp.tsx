'use client'

import Button from '@/components/Button/Button'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

function RelatedAppIcon() {
  return <Image className="rounded-full" src="/50x50.svg" alt="Related App Icon" width={50} height={50} />
}

export interface RelatedAppProps {
  name: string
  description: string
  slug: string
}

export default function RelatedApp({ name, description, slug }: RelatedAppProps) {
  const router = useRouter()

  return (
    <div className="flex items-center rounded-xl border border-light-10 p-3">
      <div className="flex items-center space-x-3">
        <div className="flex-none rounded-full">
          <RelatedAppIcon />
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="text-light-100">{name}</p>
          <p className="line-clamp-2 text-light-60">{description}</p>
        </div>
      </div>
      <div className="ml-auto">
        <Button onClick={() => router.push(`/prompts/${slug}`)} size="small" variant="tertiary">
          Get
        </Button>
      </div>
    </div>
  )
}
