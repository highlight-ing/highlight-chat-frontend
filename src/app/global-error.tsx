'use client'

import { useEffect } from 'react'
import NextError from 'next/error'
import Link from 'next/link'
import * as Sentry from '@sentry/nextjs'

import Button from '@/components/Button/Button'

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <body>
        {/* `NextError` is the default Next.js error page component. Its type
        definition requires a `statusCode` prop. However, since the App Router
        does not expose status codes for errors, we simply pass 0 to render a
        generic error message. */}
        <div className="flex h-dvh w-dvw flex-col items-center justify-center gap-6">
          <NextError statusCode={0} />

          <Link href="/">
            <Button variant="primary-outline" size="medium">
              Return Home
            </Button>
          </Link>
        </div>
      </body>
    </html>
  )
}
