import React from 'react'
import Image from 'next/image'

import Button from '@/components/Button/Button'
import { useStore } from '@/components/providers/store-provider'

interface EmptyStateProps {
  selectedNavItem?: {
    type: 'application' | 'tag' | 'global'
    id: string
  }
}

export function EmptyState({ selectedNavItem }: EmptyStateProps) {
  const openModal = useStore((state) => state.openModal)

  return (
    <div className="flex flex-col items-center justify-center h-full text-center gap-12">
      <Image src="/empty-shortcuts-icon-lg.webp" alt="Empty shortcuts" width={240} height={240} className="mb-4" />
      <div className="flex flex-col gap-4 items-center justify-center">
        <p className="text-sm text-light-40">
          {selectedNavItem?.type === 'application'
            ? `No shortcuts defined for ${selectedNavItem.id}`
            : selectedNavItem?.type === 'tag'
              ? `No shortcuts found with tag #${selectedNavItem.id}`
              : 'No Global shortcuts defined'}
        </p>
        <Button size="small" variant="tertiary" onClick={() => openModal('create-prompt')}>
          Create Shortcut
        </Button>
      </div>
    </div>
  )
}
