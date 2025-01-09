import React from 'react'
import Image from 'next/image'

import { Button } from '@/components/ui/button'
import { useStore } from '@/components/providers/store-provider'

export function EmptyPreview() {
  const openModal = useStore((state) => state.openModal)

  return (
    <div className="flex flex-col items-center justify-center h-full text-center gap-12">
      <Image
        src="/empty-shortcuts-icon-light.webp"
        alt="Empty shortcuts"
        width={240}
        height={240}
        className="mb-4 opacity-90"
      />
      <div className="flex flex-col gap-4 items-center justify-center">
        <p className="text-base font-medium text-light-80">No shortcut selected</p>
        <p className="text-sm text-light-40">Select a shortcut from the list to view its details</p>
        <Button size="sm" variant="secondary" onClick={() => openModal('create-prompt')}>
          Create Shortcut
        </Button>
      </div>
    </div>
  )
}
