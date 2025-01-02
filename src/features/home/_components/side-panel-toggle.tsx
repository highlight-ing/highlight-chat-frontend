'use client'

import { ArrowRight } from 'iconsax-react'
import { useAtomValue, useSetAtom } from 'jotai'

import { cn } from '@/lib/utils'
import { homeSidePanelOpenAtom, toggleHomeSidePanelAtom } from '@/atoms/side-panel'
import { Tooltip } from '@/components/ui/tooltip'

export function SidePanelToggle() {
  const homeSidePanelOpen = useAtomValue(homeSidePanelOpenAtom)
  const toggleHomeSidePanel = useSetAtom(toggleHomeSidePanelAtom)

  function handleClick() {
    toggleHomeSidePanel()
  }

  return (
    <Tooltip content={homeSidePanelOpen ? 'Close' : 'Open'} side="right">
      <div className="absolute -right-3 top-0">
        <button
          aria-label="Close Side Panel"
          onClick={handleClick}
          className="group relative hidden h-[60px] w-10 place-items-center rounded-l-[20px] border border-r-0 border-tertiary bg-bg-layer-1 transition-colors hover:bg-secondary lg:grid"
        >
          <ArrowRight
            size={18}
            className={cn(
              'translate-x-0.5 text-tertiary transition-all group-hover:text-primary',
              homeSidePanelOpen ? 'rotate-0' : 'rotate-180',
            )}
          />
        </button>
      </div>
    </Tooltip>
  )
}
