import * as React from 'react'

import { cn } from '@/lib/utils'

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({ className, value, rows = 4, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'relative flex !h-fit min-h-36 w-full resize-none flex-col justify-start gap-2 rounded-2xl border border-light-10 bg-secondary bg-transparent px-3 pb-2 pt-7 text-[15px] text-base text-primary shadow-sm outline-none transition-[padding] placeholder:text-subtle hover:border-light-20 focus:border-light-20 focus:bg-tertiary disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          className,
        )}
        ref={ref}
        value={value}
        {...props}
      />
    )
  },
)
Textarea.displayName = 'Textarea'

export { Textarea }
