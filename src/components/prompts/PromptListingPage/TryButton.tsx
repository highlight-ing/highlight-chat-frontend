'use client'

import Button from '@/components/Button/Button'

export default function TryButton({ slug }: { slug: string }) {
  function handleClick() {
    window.location.href = `highlight://app/${slug}`
  }

  return (
    <Button size="xlarge" variant="primary" onClick={handleClick}>
      Try for free
    </Button>
  )
}
