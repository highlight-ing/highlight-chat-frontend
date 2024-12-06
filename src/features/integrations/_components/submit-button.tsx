import React, { ReactElement } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import Button from '@/components/Button/Button'
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner'
import Tooltip from '@/components/Tooltip/Tooltip'

type IntegrationSubmitButtonProps = {
  icon: React.ReactNode
  label: string
  isPending?: boolean
  disabled?: boolean
  onClick?: () => void
  tooltip?: string | ReactElement
  defaultTooltip?: string | ReactElement
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right'
  tooltipOffsetY?: number
  tooltipOffsetX?: number
}

export function IntegrationSubmitButton(props: IntegrationSubmitButtonProps) {
  return (
    <Tooltip
      tooltip={props.tooltip || props.defaultTooltip || ''}
      position={props.tooltipPosition || 'bottom'}
      disabled={props.defaultTooltip ? !props.disabled : false}
      offset={props.tooltipOffsetY}
      offsetX={props.tooltipOffsetX}
    >
      <Button
        size={'medium'}
        variant={'accent'}
        type={'submit'}
        disabled={props.isPending || props.disabled}
        style={{ gap: 8 }}
        onClick={props.onClick}
      >
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={props.isPending ? 'true' : 'false'}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
          >
            {props.isPending ? (
              <LoadingSpinner size={'20px'} />
            ) : (
              <div className="size-5 overflow-hidden rounded-md">{props.icon}</div>
            )}
          </motion.span>
        </AnimatePresence>
        {props.label}
      </Button>
    </Tooltip>
  )
}
