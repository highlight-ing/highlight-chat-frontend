import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-[10px] border border-tertiary py-1 pl-2.5 pr-2 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-secondary text-secondary',
        secondary: 'border-transparent bg-neutral-100 text-neutral-900 hover:bg-neutral-100/80',
        destructive: 'bg-red-500 hover:bg-red-500/80 text-neutral-50 shadow',
        outline: 'text-neutral-950',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
