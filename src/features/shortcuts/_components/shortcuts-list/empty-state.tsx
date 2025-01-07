import React from 'react'
import Image from 'next/image'

import Button from '@/components/Button/Button'
import { useStore } from '@/components/providers/store-provider'

type NavItemType = 'all' | 'unassigned' | 'application' | 'global' | 'app-based'
type NavItem = {
  type: NavItemType
  id: string
}

interface EmptyStateProps {
  selectedNavItem: NavItem
}

export function EmptyState({ selectedNavItem }: EmptyStateProps) {
  const openModal = useStore((state) => state.openModal)

  const getEmptyStateMessage = () => {
    switch (selectedNavItem.type) {
      case 'all':
        return 'No shortcuts available'
      case 'global':
        return 'No Global shortcuts defined'
      case 'unassigned':
        return 'No unassigned shortcuts available'
      case 'application':
        return `No shortcuts defined for ${selectedNavItem.id}`
      case 'app-based':
        return `No shortcuts defined for ${selectedNavItem.id}`
      default:
        return 'No shortcuts available'
    }
  }

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
        <p className="text-sm text-light-40">{getEmptyStateMessage()}</p>
        <Button size="small" variant="tertiary" onClick={() => openModal('create-prompt')}>
          Create Shortcut
        </Button>
      </div>
    </div>
  )
}
