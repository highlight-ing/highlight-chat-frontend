'use client'

import * as React from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const labelVariants = cva('leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70', {
  variants: {
    variant: {
      default: 'text-sm font-medium',
      form: 'group-has-[data-state=open]:bg-pink pointer-events-none absolute left-3 top-2 z-10 text-[13px] font-semibold leading-none text-tertiary opacity-100 transition-opacity peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & VariantProps<typeof labelVariants>
>(({ className, variant, ...props }, ref) => (
  <LabelPrimitive.Root ref={ref} data-slot="label" className={cn(labelVariants({ variant, className }))} {...props} />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
