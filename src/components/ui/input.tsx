import { cn } from '@/lib/utils'
import React from 'react'

export const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => (
    <input
      data-slot="input"
      type={type}
      className={cn(
        'peer relative flex w-full flex-col justify-start gap-2 rounded-2xl border border-light-10 bg-secondary px-3 py-2 text-[15px] text-primary outline-none transition-[padding] placeholder:text-subtle hover:border-light-20 focus:border-light-20 focus:bg-tertiary disabled:cursor-not-allowed disabled:opacity-50 group-has-[label]:pb-2 group-has-[label]:pt-7',
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
)
Input.displayName = 'Input'
