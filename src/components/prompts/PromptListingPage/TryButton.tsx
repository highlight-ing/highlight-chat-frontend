'use client'

import Button from '@/components/Button/Button'

export default function TryButton({ slug }: { slug: string }) {
  function handleClick() {
    window.location.href = `highlight://prompt/${slug}`
  }

  return (
    <Button className="w-full" size="xlarge" variant="primary" onClick={handleClick}>
      Try for free
    </Button>
  )
}
