import { useMemo } from 'react'
import { Category2, Hierarchy, MessageSearch, Text } from 'iconsax-react'
import sassVariables from '@/variables.module.scss'
import ContextMenu from '@/components/ContextMenu/ContextMenu'
import Button from '@/components/Button/Button'

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
      <Button id="toggle-conditions" size={'medium'} variant={'ghost-neutral'} disabled={disabled}>
        <Hierarchy variant="Bold" size={16} color={sassVariables.pink100} />
        Conditions
      </Button>
    </ContextMenu>
  )
}
