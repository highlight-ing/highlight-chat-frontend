'use client'

import * as React from 'react'
import * as SwitchPrimitives from '@radix-ui/react-switch'

import { cn } from '@/lib/utils'

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      'inline-flex cursor-pointer items-center rounded-full drop-shadow-md transition-colors disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-conv-green data-[state=unchecked]:bg-conv-secondary dark:focus-visible:ring-conv-green',
      className,
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        'pointer-events-none block aspect-square h-[calc(100%-2px)] rounded-full shadow-lg transition-transform data-[state=checked]:translate-x-full data-[state=unchecked]:translate-x-0 data-[state=checked]:bg-conv-white data-[state=unchecked]:bg-light-40',
      )}
    />
  </SwitchPrimitives.Root>
))

Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
