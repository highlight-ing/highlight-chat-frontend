import { cn } from '@/lib/utils'
import React from 'react'

interface InputProps extends React.ComponentProps<'input'> {
  label?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const { className, label, type, value, ...rest } = props

  return (
    <input
      data-slot="input"
      type={type}
      className={cn(
        'relative flex w-full flex-col justify-start gap-2 rounded-[10px] border border-light-10 bg-secondary px-3 py-2 text-[15px] text-primary outline-none transition-[padding] placeholder:text-subtle hover:border-light-20 focus:border-light-20 focus:bg-tertiary group-has-[label]:focus:pb-2 group-has-[label]:focus:pt-7',
        value && 'group-has-[label]:pb-2 group-has-[label]:pt-7',
        className,
      )}
      value={value}
      ref={ref}
      {...rest}
    />
  )
})

Input.displayName = 'Input'
