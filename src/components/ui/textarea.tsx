import * as React from 'react'

import { cn } from '@/lib/utils'

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({ className, value, rows = 4, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'relative flex !h-fit min-h-36 w-full resize-none flex-col justify-start gap-2 rounded-[10px] border border-light-10 bg-secondary bg-transparent px-3 py-2 text-[15px] text-base text-primary shadow-sm outline-none transition-[padding] placeholder:text-subtle hover:border-light-20 focus:border-light-20 focus:bg-tertiary disabled:cursor-not-allowed disabled:opacity-50 group-has-[label]:focus:pb-2 group-has-[label]:focus:pt-7 md:text-sm',
          value && 'group-has-[label]:pb-2 group-has-[label]:pt-7',
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Textarea.displayName = 'Textarea'

export { Textarea }
