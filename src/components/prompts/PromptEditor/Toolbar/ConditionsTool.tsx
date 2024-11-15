import React, { useMemo } from 'react'
import sassVariables from '@/variables.module.scss'
import { Category2, Hierarchy, MessageProgramming, MessageSearch, Text } from 'iconsax-react'

import Button from '@/components/Button/Button'
import ContextMenu from '@/components/ContextMenu/ContextMenu'
import Tooltip from '@/components/Tooltip/Tooltip'

export const ConditionsTool = ({ disabled }: { disabled?: boolean }) => {
  const contextMenuItems = useMemo(() => {
    return [
      {
        label: (
          <>
            <Category2 variant="Bold" size={20} color={sassVariables.purple100} /> If window is open
          </>
        ),
        onClick: () => {},
      },
      {
        label: (
          <>
            <Text variant="Bold" size={20} color={sassVariables.primary100} /> If user message includes text
          </>
        ),
        onClick: () => {},
      },
    ]
  }, [])

  return (
    <ContextMenu
      key="conditions-menu"
      items={contextMenuItems}
      position={'bottom'}
      triggerId={`toggle-conditions`}
      leftClick={true}
      disabled={disabled}
    >
      {
        // @ts-ignore
        ({ isOpen }) => (
          <Tooltip
            position={'bottom'}
            tooltip={
              isOpen ? undefined : (
                <div className={'flex flex-col gap-1'}>
                  <span>Apply Conditions</span>
                  <span className={'text-xs text-light-60'}>
                    Use handlebars conditions for advanced prompt engineering.
                  </span>
                </div>
              )
            }
          >
            <Button id="toggle-conditions" size={'medium'} variant={'ghost-neutral'} disabled={disabled}>
              <Hierarchy variant="Bold" size={16} color={sassVariables.pink100} />
              Conditions
            </Button>
          </Tooltip>
        )
      }
    </ContextMenu>
  )
}
