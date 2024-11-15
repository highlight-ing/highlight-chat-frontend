import Link from 'next/link'

import Button from '@/components/Button/Button'

export default function NotFound() {
  return (
    <div className="flex h-dvh w-dvw flex-col items-center justify-center gap-6">
      <h2 className="text-4xl font-semibold tracking-tight text-primary">404 | Not Found</h2>
      <Link href="/">
        <Button variant="primary-outline" size="medium">
          Return Home
        </Button>
      </Link>
    </div>
  )
}
