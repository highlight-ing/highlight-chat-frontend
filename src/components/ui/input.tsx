import { cn } from '@/lib/utils'
import React from 'react'
import { useFormField } from './form'

export const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>((props, ref) => {
  const { className, type, value, ...rest } = props
  const { error } = useFormField()

  return (
    <input
      data-slot="input"
      type={type}
      className={cn(
        'relative flex w-full flex-col justify-start gap-2 rounded-2xl border border-light-10 bg-secondary px-3 py-2 text-[15px] text-primary outline-none transition-[padding] placeholder:text-subtle hover:border-light-20 focus:border-light-20 focus:bg-tertiary disabled:cursor-not-allowed disabled:opacity-50 group-has-[label]:pb-2 group-has-[label]:pt-7',
        error && 'border-red/70 hover:border-red focus:border-red',
        className,
      )}
      value={value}
      ref={ref}
      {...rest}
    />
  )
})

Input.displayName = 'Input'
