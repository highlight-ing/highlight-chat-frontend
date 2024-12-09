import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'dark:border-neutral-800 dark:focus:ring-neutral-300 inline-flex items-center rounded-md border border-neutral-200 px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-hover text-neutral-50 shadow hover:bg-hover/80',
        secondary:
          'dark:bg-neutral-800 dark:text-neutral-50 dark:hover:bg-neutral-800/80 border-transparent bg-neutral-100 text-neutral-900 hover:bg-neutral-100/80',
        destructive:
          'bg-red-500 hover:bg-red-500/80 dark:bg-red-900 dark:text-neutral-50 dark:hover:bg-red-900/80 border-transparent text-neutral-50 shadow',
        outline: 'dark:text-neutral-50 text-neutral-950',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
