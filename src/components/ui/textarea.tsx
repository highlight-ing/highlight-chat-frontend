import * as React from 'react'

import { cn } from '@/lib/utils'

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({ className, value, ...props }, ref) => (
    <textarea
      className={cn(
        'min-h-44 group-has-[label]:pb-2 group-has-[label]:pt-7 relative flex !h-fit w-full resize-none flex-col justify-start gap-2 rounded-2xl border border-light-10 bg-secondary bg-transparent px-3 py-2 text-[15px] text-base text-primary shadow-sm outline-none transition-[padding] placeholder:text-subtle hover:border-light-20 focus:border-light-20 focus:bg-tertiary disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        className,
      )}
      ref={ref}
      value={value}
      {...props}
    />
  ),
)
Textarea.displayName = 'Textarea'
