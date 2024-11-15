'use client'

import * as React from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'

import { cn } from '@/lib/utils'

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    data-slot="label"
    className={cn(
      'pointer-events-none absolute left-3 top-2 z-10 text-[13px] font-semibold leading-none text-tertiary opacity-100 transition-opacity peer-disabled:cursor-not-allowed peer-disabled:opacity-70 group-has-[data-state=open]:bg-pink',
      className,
    )}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
