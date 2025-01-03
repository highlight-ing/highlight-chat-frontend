'use client'

import { Add, ArrowRight } from 'iconsax-react'
import { useAtomValue, useSetAtom } from 'jotai'

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
      <div className="absolute right-0 top-0">
        <button
          aria-hidden="true"
          tabIndex={-1}
          onKeyDown={(e) => {
            if (e.key.startsWith('Arrow')) {
              e.preventDefault()
              e.currentTarget.blur()
            }
          }}
          onClick={handleClick}
          className="group relative hidden h-[60px] w-10 place-items-center rounded-l-[20px] border border-r-0 border-tertiary bg-bg-layer-1 transition-colors hover:bg-secondary lg:grid"
        >
          {homeSidePanelOpen ? (
            <Add
              variant="Linear"
              size={24}
              className="translate-x-0.5 rotate-45 text-tertiary transition-all group-hover:text-primary"
            />
          ) : (
            <ArrowRight
              size={18}
              className="translate-x-0.5 rotate-180 text-tertiary transition-all group-hover:text-primary"
            />
          )}
        </button>
      </div>
    </Tooltip>
  )
}
