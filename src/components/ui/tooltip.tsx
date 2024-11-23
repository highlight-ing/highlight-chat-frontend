'use client'

import * as React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'

import { cn } from '@/lib/utils'

export const TooltipProvider = TooltipPrimitive.Provider

const TooltipRoot = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = TooltipPrimitive.Content

type TooltipProps = React.ComponentPropsWithoutRef<typeof TooltipRoot> &
  React.ComponentPropsWithoutRef<typeof TooltipContent> & {
    content: string
  }

export function Tooltip({
  children,
  content,
  open,
  defaultOpen,
  onOpenChange,
  side = 'top',
  sideOffset = 8,
  align = 'center',
  className,
  ...props
}: TooltipProps) {
  return (
    <TooltipRoot open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange} delayDuration={100}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent
        className={cn(
          'z-50 overflow-hidden rounded-md border border-tertiary bg-secondary px-3 py-1.5 text-xs text-primary animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          className,
        )}
        sideOffset={sideOffset}
        side={side}
        align={align}
        {...props}
      >
        {content}
      </TooltipContent>
    </TooltipRoot>
  )
}
