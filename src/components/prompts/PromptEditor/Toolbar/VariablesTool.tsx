import React, { useMemo } from 'react'
import {
  Category2,
  ClipboardText,
  DocumentText,
  Gallery,
  MessageProgramming,
  MessageText1,
  Monitor,
  Sound,
} from 'iconsax-react'
import sassVariables from '@/variables.module.scss'
import ContextMenu, { MenuItemType } from '@/components/ContextMenu/ContextMenu'
import Button from '@/components/Button/Button'

interface VariablesToolProps {
  disabled?: boolean
  onSelect: (keyword: string, phrase: string) => void
}

export const VariablesTool: React.FC<VariablesToolProps> = ({ disabled, onSelect }) => {
  const contextMenuItems = useMemo(() => {
    return [
      {
        label: (
          <>
            <Sound variant="Bold" size={20} color={sassVariables.green100} /> Audio
          </>
        ),
        onClick: () => onSelect('audio', 'Using the audio, ...'),
      },
      {
        label: (
          <>
            <ClipboardText variant="Bold" size={20} color={sassVariables.yellow80} /> Clipboard Text
          </>
        ),
        onClick: () => onSelect('clipboard text', 'Using the clipboard text, ...'),
      },
      {
        label: (
          <>
            <MessageText1 variant="Bold" size={20} color={sassVariables.primary80} /> User Message
          </>
        ),
        onClick: () => onSelect('user message', 'Using the user message, ...'),
      },
      {
        label: (
          <>
            <Category2 variant="Bold" size={20} color={sassVariables.purple100} /> Open Windows
          </>
        ),
        onClick: () => onSelect('open windows', "Using the user's open windows, ..."),
      },
      {
        divider: true,
      },
      {
        label: (
          <>
            <DocumentText variant="Bold" size={20} color={sassVariables.pink80} /> App Text
          </>
        ),
        onClick: () => onSelect('app text', 'Using the app text, ...'),
      },
      {
        label: (
          <>
            <Monitor variant="Bold" size={20} color={sassVariables.pink80} /> Screen Text
          </>
        ),
        onClick: () => onSelect('screen text', 'Using the screen text, ...'),
      },
      {
        label: (
          <>
            <Gallery variant="Bold" size={20} color={sassVariables.pink80} /> Image / Screenshot
          </>
        ),
        onClick: () => onSelect('screenshot', 'Using the image / screenshot, ...'),
      },
    ] as MenuItemType[]
  }, [])

  return (
    <ContextMenu
      key="variables-menu"
      items={contextMenuItems}
      position={'bottom'}
      triggerId={`toggle-variables`}
      leftClick={true}
      disabled={disabled}
    >
      <Button id="toggle-variables" size={'medium'} variant={'ghost-neutral'} disabled={disabled}>
        <MessageProgramming variant="Bold" size={20} color={sassVariables.green100} />
        Variables
      </Button>
    </ContextMenu>
  )
}
